/**
 * Worker: Emergency Dispatch (§5.3).
 * - "dispatch": finds the nearest verified providers, creates offers,
 *   fires FCM + SMS, then schedules an expiry check.
 * - "expire-check": marks the request EXPIRED if nobody accepted in time.
 *
 * Register once at boot: import "./jobs/emergencyDispatch.job";
 */
import { dispatchQueue } from "../config/queues";
import { prisma } from "../config/prisma";
import { findNearestProviders } from "../services/emergency.service";
import { sendPush, sendSms } from "../services/notification.service";
import type { DispatchJobPayload } from "../types/antiDisintermediation.types";

const DISPATCH_WINDOW_MS = 10 * 60 * 1000;

dispatchQueue.process("dispatch", async (job) => {
  const { requestId } = job.data as DispatchJobPayload;

  const request = await prisma.emergencyRequest.findUnique({
    where: { id: requestId },
  });
  if (!request || request.status !== "SEARCHING") return;

  const candidates = await findNearestProviders(requestId);

  if (candidates.length === 0) {
    await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: { status: "EXPIRED" },
    });
    return;
  }

  await prisma.$transaction([
    prisma.emergencyOffer.createMany({
      data: candidates.map((c) => ({
        requestId,
        providerId: c.providerId,
        distanceKm: c.distanceKm,
      })),
      skipDuplicates: true,
    }),
    prisma.emergencyRequest.update({
      where: { id: requestId },
      data: { status: "DISPATCHED" },
    }),
  ]);

  // Notify all candidates in parallel — first to accept wins
  await Promise.allSettled(
    candidates.map(async (c) => {
      if (c.fcmToken) {
        await sendPush(c.fcmToken, {
          title: "Emergency Job Nearby!",
          body: `${request.category} needed ${c.distanceKm.toFixed(1)} km away. Accept within 5 min for a Fast Responder badge.`,
          data: { type: "EMERGENCY_OFFER", requestId },
        });
      }
      if (c.phone) {
        await sendSms(
          c.phone,
          `GharSewa EMERGENCY: ${request.category} job ${c.distanceKm.toFixed(1)}km from you. Open the app to accept now.`
        );
      }
    })
  );

  // Schedule expiry sweep for this request
  await dispatchQueue.add(
    "expire-check",
    { requestId },
    { delay: DISPATCH_WINDOW_MS }
  );
});

dispatchQueue.process("expire-check", async (job) => {
  const { requestId } = job.data as DispatchJobPayload;

  const expired = await prisma.emergencyRequest.updateMany({
    where: { id: requestId, status: "DISPATCHED" },
    data: { status: "EXPIRED" },
  });
  if (expired.count === 0) return; // was accepted/cancelled in time

  await prisma.emergencyOffer.updateMany({
    where: { requestId, status: "SENT" },
    data: { status: "EXPIRED", respondedAt: new Date() },
  });

  const request = await prisma.emergencyRequest.findUnique({
    where: { id: requestId },
    select: { customerId: true },
  });
  if (!request) return;

  const customer = await prisma.user.findUnique({
    where: { id: request.customerId },
    select: { fcmToken: true },
  });
  if (customer?.fcmToken) {
    await sendPush(customer.fcmToken, {
      title: "No providers available",
      body: "We couldn't find an available pro right now. Try a standard booking or retry shortly.",
    });
  }
});