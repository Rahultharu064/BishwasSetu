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
import { prisma } from "../config/prisma";
import {
  createGuaranteeForEscrow,
  awardRevenuePoints,
} from "../services/guarantee.service";
import { recordCompletion } from "../services/neighborhood.service";
import { sendPush, sendSms } from "../services/notification.service";
import type { EscrowReleasedJobPayload } from "../types/antiDisintermediation.types";

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
    select: { fcmToken: true, phone: true },
  });
  const payoutNpr = (escrow.payoutPaisa / 100).toFixed(2);
  if (provider?.fcmToken) {
    await sendPush(provider.fcmToken, {
      title: "Payment Released",
      body: `NPR ${payoutNpr} has been released to your account.`,
    });
  }
  if (provider?.phone) {
    await sendSms(
      provider.phone,
      `GharSewa: NPR ${payoutNpr} released for booking ${escrow.bookingId}. Thank you for staying on-platform!`
    );
  }
})