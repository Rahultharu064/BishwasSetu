/**
 * 5.1 Escrow-Based Milestone Payments
 * Customer pays before the job begins; funds are HELD by the platform and
 * RELEASED to the provider only when the customer taps "Job Complete".
 */
import { prisma } from "../config/db";
import { escrowQueue } from "../config/queues";
import {
  commissionPctForAmount,
  computeSplit,
} from "../utils/commission";
import {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
} from "../utils/payment";
import {
  initiateEsewaPayment,
  verifyEsewaPayment,
} from "../utils/payment";
import type { Gateway } from "../types/antiDisinterminationTypes";
import { ApiError } from "../utils/apierror";

export async function initiateEscrow(
  customerId: string,
  input: { bookingId: string; gateway: Gateway; returnUrl: string }
) {
  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
  });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.customerId !== customerId)
    throw new ApiError(403, "Not your booking");

  const existing = await prisma.escrowPayment.findUnique({
    where: { bookingId: input.bookingId },
  });
  if (existing && existing.status !== "PENDING")
    throw new ApiError(409, "Payment already processed for this booking");

  const amountPaisa = (booking.priceNpr ?? 0) * 100;
  // Emergency bookings carry the flat 12% tier; standard follows §6.1
  const commissionPct = booking.isEmergency
    ? 12
    : commissionPctForAmount(amountPaisa);

  const escrow = existing
    ? existing
    : await prisma.escrowPayment.create({
        data: {
          bookingId: booking.id,
          customerId,
          providerId: booking.providerId,
          gateway: input.gateway,
          amountPaisa,
          commissionPct,
        },
      });

  if (input.gateway === "KHALTI") {
    const result = await initiateKhaltiPayment({
      amountPaisa,
      purchaseOrderId: escrow.id,
      purchaseOrderName: `GharSewa Booking ${booking.id}`,
      returnUrl: input.returnUrl,
    });
    await prisma.escrowPayment.update({
      where: { id: escrow.id },
      data: { gatewayRef: result.gatewayRef },
    });
    return { escrowId: escrow.id, ...result };
  }

  const result = initiateEsewaPayment({
    amountPaisa,
    transactionUuid: escrow.id,
    successUrl: input.returnUrl,
    failureUrl: input.returnUrl,
  });
  await prisma.escrowPayment.update({
    where: { id: escrow.id },
    data: { gatewayRef: result.gatewayRef },
  });
  return { escrowId: escrow.id, ...result };
}

/** Called after the gateway redirects back — moves PENDING → HELD */
export async function verifyAndHold(input: {
  escrowId: string;
  pidx?: string;
  data?: string;
}) {
  const escrow = await prisma.escrowPayment.findUnique({
    where: { id: input.escrowId },
  });
  if (!escrow) throw new ApiError(404, "Escrow not found");
  if (escrow.status === "HELD") return escrow; // idempotent
  if (escrow.status !== "PENDING")
    throw new ApiError(409, `Escrow is ${escrow.status}`);

  const result =
    escrow.gateway === "KHALTI"
      ? await verifyKhaltiPayment(input.pidx ?? escrow.gatewayRef ?? "")
      : await verifyEsewaPayment(input.data ?? "");

  if (!result.verified)
    throw new ApiError(402, "Payment could not be verified");
  if (result.amountPaisa != null && result.amountPaisa !== escrow.amountPaisa)
    throw new ApiError(409, "Paid amount does not match escrow amount");

  return prisma.escrowPayment.update({
    where: { id: escrow.id },
    data: {
      status: "HELD",
      gatewayTxnId: result.gatewayTxnId,
      heldAt: new Date(),
    },
  });
}

/**
 * Customer taps "Job Complete" — funds released to provider.
 * Side effects (guarantee creation, revenue points, neighborhood tag,
 * payout, notifications) run via the escrow queue.
 */
export async function releaseEscrow(
  customerId: string,
  escrowId: string,
  gps?: { latitude: number; longitude: number }
) {
  const escrow = await prisma.escrowPayment.findUnique({
    where: { id: escrowId },
  });
  if (!escrow) throw new ApiError(404, "Escrow not found");
  if (escrow.customerId !== customerId)
    throw new ApiError(403, "Only the customer can release funds");
  if (escrow.status !== "HELD")
    throw new ApiError(409, `Escrow is ${escrow.status}, expected HELD`);

  const { commissionPaisa, payoutPaisa } = computeSplit(
    escrow.amountPaisa,
    Number(escrow.commissionPct)
  );

  const released = await prisma.$transaction(async (tx) => {
    const updated = await tx.escrowPayment.update({
      where: { id: escrowId, status: "HELD" }, // optimistic guard
      data: {
        status: "RELEASED",
        commissionPaisa,
        payoutPaisa,
        releasedAt: new Date(),
      },
    });
    await tx.booking.update({
      where: { id: escrow.bookingId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        ...(gps && {
          completionLatitude: gps.latitude,
          completionLongitude: gps.longitude,
        }),
      },
    });
    return updated;
  });

  await escrowQueue.add(
    "escrow-released",
    { escrowId: released.id },
    { attempts: 5, backoff: { type: "exponential", delay: 3000 } }
  );

  return released;
}

/** Admin/dispute refund — HELD or DISPUTED → REFUNDED */
export async function refundEscrow(escrowId: string, reason: string) {
  const escrow = await prisma.escrowPayment.findUnique({
    where: { id: escrowId },
  });
  if (!escrow) throw new ApiError(404, "Escrow not found");
  if (escrow.status !== "HELD" && escrow.status !== "DISPUTED")
    throw new ApiError(409, `Cannot refund escrow in ${escrow.status}`);

  // NOTE: Khalti/eSewa refund APIs require merchant-dashboard or support
  // flows at MVP stage; we record the refund and process manually via ops.
  return prisma.$transaction(async (tx) => {
    const updated = await tx.escrowPayment.update({
      where: { id: escrowId },
      data: { status: "REFUNDED", refundedAt: new Date() },
    });
    await tx.booking.update({
      where: { id: escrow.bookingId },
      data: { status: "CANCELLED", cancelReason: reason },
    });
    return updated;
  });
}

export async function getEscrowForUser(
  user: { id: string; providerId?: string },
  escrowId: string
) {
  const escrow = await prisma.escrowPayment.findUnique({
    where: { id: escrowId },
    include: { guarantee: { select: { id: true, status: true, expiresAt: true } } },
  });
  if (!escrow) throw new ApiError(404, "Escrow not found");
  // escrow.providerId is a Provider.id, not a User.id — compare against
  // the caller's provider profile id, not their user id (PROVIDER-role
  // callers have no matching customerId, so this is the only path for them).
  const isCustomer = escrow.customerId === user.id;
  const isProvider = user.providerId != null && escrow.providerId === user.providerId;
  if (!isCustomer && !isProvider) throw new ApiError(403, "Forbidden");
  return escrow;
}
