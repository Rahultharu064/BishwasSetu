import type { Provider } from "./types";

/** Extract a provider list from the backend's varied response envelopes. */
export function providersFrom(data: unknown): Provider[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Provider[];
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj.providers)) return obj.providers as Provider[];
  if (Array.isArray(obj.items)) return obj.items as Provider[];
  if (Array.isArray(obj.results)) return obj.results as Provider[];
  if (Array.isArray(obj.data)) return obj.data as Provider[];
  return [];
}

export function marketStatsFrom(data: unknown): {
  priceMin?: number;
  priceMax?: number;
  priceAvg?: number;
  totalProviders?: number;
  avgTrustScore?: number;
} | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  return (obj.marketStats as never) ?? null;
}
