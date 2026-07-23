// Commission tiers (PRD §6.1): 0–1,000 → 8% · 1,001–5,000 → 10% · 5,001+ → 12%
export function commissionRate(priceNpr: number, isEmergency = false): number {
  if (isEmergency) return 0.12; // Emergency Dispatch tier (PRD §5.3)
  if (priceNpr <= 1000) return 0.08;
  if (priceNpr <= 5000) return 0.1;
  return 0.12;
}
