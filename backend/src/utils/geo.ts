/**
 * Geospatial helpers — haversine distance and geofence checks.
 */

const EARTH_RADIUS_KM = 6371;

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isWithinGeofence(
  pointLat: number,
  pointLon: number,
  centerLat: number,
  centerLon: number,
  radiusKm: number
): boolean {
  return haversineKm(pointLat, pointLon, centerLat, centerLon) <= radiusKm;
}

/** Nepal bounding box sanity check (PRD §3.3 geo-check) */
export function isInsideNepal(lat: number, lon: number): boolean {
  return lat >= 26.3 && lat <= 30.5 && lon >= 80.0 && lon <= 88.3;
}
