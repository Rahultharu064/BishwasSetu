/**
 * 5.4 Hyper-Local "Neighborhood" Tags
 * GPS-verified job completions inside seeded geofences power area-specific
 * social proof: "Has worked for 7 homes in Maharajgunj this month."
 */
import { prisma } from "../config/prisma";
import { isWithinGeofence } from "../utils/geo.util";
import { ApiError } from "../utils/apiError";
import type { NeighborhoodStat } from "../types/antiDisintermediation.types";

/**
 * Called by the escrow-released worker with the completion GPS fix.
 * Matches the point against seeded geofences and records the completion.
 */
export async function recordCompletion(params: {
  providerId: string;
  bookingId: string;
  latitude: number;
  longitude: number;
}) {
  const areas = await prisma.neighborhoodArea.findMany();
  const match = areas.find((a) =>
    isWithinGeofence(
      params.latitude,
      params.longitude,
      Number(a.latitude),
      Number(a.longitude),
      Number(a.radiusKm)
    )
  );
  if (!match) return null; // outside all known geofences — no tag

  return prisma.neighborhoodCompletion.upsert({
    where: { bookingId: params.bookingId }, // idempotent per booking
    update: {},
    create: {
      areaId: match.id,
      providerId: params.providerId,
      bookingId: params.bookingId,
      latitude: params.latitude,
      longitude: params.longitude,
    },
  });
}

/** Public profile stats: per-area monthly + all-time counts */
export async function getProviderNeighborhoodStats(
  providerId: string
): Promise<NeighborhoodStat[]> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const completions = await prisma.neighborhoodCompletion.findMany({
    where: { providerId },
    include: { area: { select: { name: true, city: true } } },
  });

  const byArea = new Map<string, NeighborhoodStat>();
  for (const c of completions) {
    const key = c.area.name;
    const stat = byArea.get(key) ?? {
      areaName: c.area.name,
      city: c.area.city,
      jobsThisMonth: 0,
      jobsAllTime: 0,
    };
    stat.jobsAllTime += 1;
    if (c.completedAt >= monthStart) stat.jobsThisMonth += 1;
    byArea.set(key, stat);
  }

  return [...byArea.values()].sort((a, b) => b.jobsThisMonth - a.jobsThisMonth);
}

/** Admin: seed a new geofenced area */
export async function createArea(input: {
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}) {
  const existing = await prisma.neighborhoodArea.findUnique({
    where: { name: input.name },
  });
  if (existing) throw new ApiError(409, "Area already exists");
  return prisma.neighborhoodArea.create({ data: input });
}

export async function listAreas() {
  return prisma.neighborhoodArea.findMany({ orderBy: { city: "asc" } });
}
