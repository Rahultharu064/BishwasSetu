/**
 * Commission tiers per PRD §6.1, plus the flat 12% emergency tier (§5.3).
 * All money is handled in paisa (NPR * 100) to avoid float errors.
 */

export const EMERGENCY_COMMISSION_PCT = 12;

export function commissionPctForAmount(amountPaisa: number): number {
  const npr = amountPaisa / 100;
  if (npr <= 1000) return 8;
  if (npr <= 5000) return 10;
  return 12;
}

export function computeSplit(
  amountPaisa: number,
  commissionPct: number
): { commissionPaisa: number; payoutPaisa: number } {
  const commissionPaisa = Math.round((amountPaisa * commissionPct) / 100);
  return { commissionPaisa, payoutPaisa: amountPaisa - commissionPaisa };
}

/** Verified Revenue Points: 1 point per NPR 100 of on-platform payout */
export function revenuePointsFor(payoutPaisa: number): number {
  return Math.floor(payoutPaisa / 10000);
}
