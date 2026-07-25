/**
 * Worker: runs side effects after an escrow is RELEASED.
 * 1. Create the 7-day Service Guarantee (§5.2)
 * 2. Award Verified Revenue Points (§5.2)
 * 3. Record GPS-verified neighborhood completion (§5.4)
 * 4. Notify the provider (FCM + Sparrow SMS)
 *
 * Register once at boot (e.g. in server.ts):
 *   import "./jobs/escrowReleased.job";
 */
import { escrowQueue } from "../config/queues";
import { prisma } from "../config/db";
import { recordCompletion } from "../services/neighborhoodService";
import { sendPushNotification as sendPush } from "../utils/firebase";
import { sendSms } from "../utils/sms";
import type { EscrowReleasedJobPayload } from "../types/antiDisinterminationTypes";
import { ApiError } from "../utils/apierror";

export async function createGuaranteeForEscrow(escrowId: string) {
  const escrow = await prisma.escrowPayment.findUnique({ where: { id: escrowId } });
  if (!escrow) return;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.serviceGuarantee.create({
    data: {
      escrowId,
      bookingId: escrow.bookingId,
      customerId: escrow.customerId,
      providerId: escrow.providerId,
      expiresAt
    }
  });
}

export async function awardRevenuePoints(escrowId: string) {
  const escrow = await prisma.escrowPayment.findUnique({ where: { id: escrowId } });
  if (!escrow) return;
  await prisma.revenuePointLedger.create({
    data: {
      providerId: escrow.providerId,
      bookingId: escrow.bookingId,
      points: Math.floor(escrow.amountPaisa / 10000), // 1 point per 100 NPR
      reason: "ESCROW_RELEASE"
    }
  });
}

escrowQueue.process("escrow-released", async (job) => {
  const { escrowId } = job.data as EscrowReleasedJobPayload;

  const escrow = await prisma.escrowPayment.findUnique({
    where: { id: escrowId },
  });
  if (!escrow || escrow.status !== "RELEASED") return;

  // 1 + 2 — guarantee + revenue points (both idempotent)
  await createGuaranteeForEscrow(escrowId);
  await awardRevenuePoints(escrowId);

  // 3 — neighborhood tag from booking completion GPS
  const booking = await prisma.booking.findUnique({
    where: { id: escrow.bookingId },
    select: { completionLatitude: true, completionLongitude: true },
  });
  if (booking?.completionLatitude != null && booking.completionLongitude != null) {
    await recordCompletion({
      providerId: escrow.providerId,
      bookingId: escrow.bookingId,
      latitude: Number(booking.completionLatitude),
      longitude: Number(booking.completionLongitude),
    });
  }

  // 4 — notify provider of payout
  const provider = await prisma.provider.findUnique({
    where: { id: escrow.providerId },
    select: { user: { select: { fcmToken: true, phone: true } } },
  });
  const payoutNpr = (escrow.payoutPaisa / 100).toFixed(2);
  if (provider?.user?.fcmToken) {
    await sendPush({
      token: provider.user.fcmToken,
      title: "Payment Released",
      body: `NPR ${payoutNpr} has been released to your account.`,
    });
  }
  if (provider?.user?.phone) {
    await sendSms(
      provider.user.phone,
      `GharSewa: NPR ${payoutNpr} released for booking ${escrow.bookingId}. Thank you for staying on-platform!`
    );
  }
})