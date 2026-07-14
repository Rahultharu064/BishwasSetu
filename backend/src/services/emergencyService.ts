/**
 * 5.3 Emergency Dispatch Mode — "Find Me a Pro Now"
 * - Matches customer with nearest available verified providers.
 * - Flat 12% commission tier.
 * - Fast Responder badge for accepting within 5 minutes.
 */
import { prisma } from "../config/db";
import { dispatchQueue } from "../config/queues";
import { haversineKm, isInsideNepal } from "../utils/geo";
import { EMERGENCY_COMMISSION_PCT } from "../utils/commission";
import type {
  EmergencyRequestInput,
  ProviderCandidate,
} from "../types/antiDisinterminationTypes";
import { ApiError } from "../utils/apierror";

const DISPATCH_WINDOW_MIN = 10; // total window before request expires
const FAST_RESPONDER_MIN = 5; // accept within 5 min → badge progress
const MAX_CANDIDATES = 5;
const SEARCH_RADIUS_KM = 10;

export async function createEmergencyRequest(
  customerId: string,
  input: EmergencyRequestInput
) {
  if (!isInsideNepal(input.latitude, input.longitude))
    throw new ApiError("Location must be inside Nepal",400);

  const active = await prisma.emergencyRequest.findFirst({
    where: {
      customerId,
      status: { in: ["SEARCHING", "DISPATCHED", "ACCEPTED", "IN_PROGRESS"] },
    },
  });
  if (active)
    throw new ApiError("You already have an active emergency request",403);

  const request = await prisma.emergencyRequest.create({
    data: {
      customerId,
      category: input.category,
      description: input.description,
      latitude: input.latitude,
      longitude: input.longitude,
      addressLabel: input.addressLabel,
      commissionPct: EMERGENCY_COMMISSION_PCT,
      expiresAt: new Date(Date.now() + DISPATCH_WINDOW_MIN * 60 * 1000),
    },
  });

  await dispatchQueue.add(
    "dispatch",
    { requestId: request.id },
    { attempts: 3, backoff: { type: "fixed", delay: 2000 } }
  );

  return request;
}

/**
 * Finds the nearest available Tier 2+ providers in the category.
 * Assumes Provider has: latitude, longitude, isAvailable, tier, category,
 * fcmToken, phone. Adjust field names to your schema.
 */
export async function findNearestProviders(
  requestId: string
): Promise<ProviderCandidate[]> {
  const request = await prisma.emergencyRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) return [];

  const providers = await prisma.provider.findMany({
    where: {
      category: request.category,
      isAvailable: true,
      tier: { gte: 2 }, // SKILLED or VERIFIED only
      status: "VERIFIED",
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      fcmToken: true,
      phone: true,
    },
  });

  return providers
    .map((p) => ({
      providerId: p.id,
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
      distanceKm: haversineKm(
        Number(request.latitude),
        Number(request.longitude),
        Number(p.latitude),
        Number(p.longitude)
      ),
      fcmToken: p.fcmToken,
      phone: p.phone,
    }))
    .filter((p) => p.distanceKm <= SEARCH_RADIUS_KM)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, MAX_CANDIDATES);
}

/** Provider accepts an emergency offer — first accept wins */
export async function acceptEmergency(providerId: string, requestId: string) {
  const offer = await prisma.emergencyOffer.findUnique({
    where: { requestId_providerId: { requestId, providerId } },
    include: { request: true },
  });
  if (!offer) throw new ApiError(404, "No offer found for this request");
  if (offer.status !== "SENT") throw new ApiError(409, "Offer no longer open");
  if (offer.request.expiresAt < new Date())
    throw new ApiError(410, "Emergency request expired");

  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    // Atomic first-accept-wins guard
    const updated = await tx.emergencyRequest.updateMany({
      where: { id: requestId, status: "DISPATCHED" },
      data: { status: "ACCEPTED", acceptedById: providerId, acceptedAt: now },
    });
    if (updated.count === 0)
      throw new ApiError(409, "Request was already accepted by another provider");

    await tx.emergencyOffer.update({
      where: { id: offer.id },
      data: { status: "ACCEPTED", respondedAt: now },
    });
    await tx.emergencyOffer.updateMany({
      where: { requestId, status: "SENT", NOT: { providerId } },
      data: { status: "EXPIRED", respondedAt: now },
    });

    // Create the booking on the flat 12% emergency tier
    const booking = await tx.booking.create({
      data: {
        customerId: offer.request.customerId,
        providerId,
        category: offer.request.category,
        description: offer.request.description ?? "Emergency dispatch",
        status: "CONFIRMED",
        isEmergency: true,
        totalAmountPaisa: 0, // quoted on-site, updated before escrow initiate
      },
    });
    await tx.emergencyRequest.update({
      where: { id: requestId },
      data: { bookingId: booking.id },
    });
    return booking;
  });

  // Fast Responder badge — accepted within 5 minutes of offer sent
  const responseMin = (now.getTime() - offer.sentAt.getTime()) / 60000;
  if (responseMin <= FAST_RESPONDER_MIN) {
    await prisma.providerBadge.upsert({
      where: {
        providerId_badge: { providerId, badge: "FAST_RESPONDER" },
      },
      update: {
        awardedAt: now,
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
      create: {
        providerId,
        badge: "FAST_RESPONDER",
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  return result;
}

export async function declineEmergency(providerId: string, requestId: string) {
  await prisma.emergencyOffer.updateMany({
    where: { requestId, providerId, status: "SENT" },
    data: { status: "DECLINED", respondedAt: new Date() },
  });
}

export async function getEmergencyStatus(userId: string, requestId: string) {
  const request = await prisma.emergencyRequest.findUnique({
    where: { id: requestId },
    include: {
      offers: {
        select: { providerId: true, distanceKm: true, status: true },
      },
    },
  });
  if (!request) throw new ApiError(404, "Request not found");
  const isParty =
    request.customerId === userId ||
    request.acceptedById === userId ||
    request.offers.some((o) => o.providerId === userId);
  if (!isParty) throw new ApiError(403, "Forbidden");
  return request;
}

export async function cancelEmergency(customerId: string, requestId: string) {
  const request = await prisma.emergencyRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) throw new ApiError(404, "Request not found");
  if (request.customerId !== customerId) throw new ApiError(403, "Forbidden");
  if (!["SEARCHING", "DISPATCHED"].includes(request.status))
    throw new ApiError(409, `Cannot cancel a ${request.status} request`);

  return prisma.$transaction(async (tx) => {
    await tx.emergencyOffer.updateMany({
      where: { requestId, status: "SENT" },
      data: { status: "EXPIRED", respondedAt: new Date() },
    });
    return tx.emergencyRequest.update({
      where: { id: requestId },
      data: { status: "CANCELLED" },
    });
  });
}
