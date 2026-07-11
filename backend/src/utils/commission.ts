// Commission tiers (from PRD Section 6.1)
// NPR 0–1000     → 8%
// NPR 1001–5000  → 10%
// NPR 5001+      → 12%
// Emergency Dispatch (PRD §5.3) → 12% flat (speed + convenience premium)

export interface CommissionResult {
  rate:          number   // decimal e.g. 0.10
  ratePercent:   number   // e.g. 10
  commission:    number   // NPR amount platform keeps
  providerPayout: number  // NPR amount provider receives
  isEmergencyRate: boolean
}

export const calculateCommission = (
  priceNpr:    number,
  isEmergency: boolean = false
): CommissionResult => {
  let rate: number

  if (isEmergency) {
    // Emergency Dispatch carries a flat 12% — justified by speed & convenience
    rate = 0.12
  } else if (priceNpr <= 1000)      rate = 0.08
  else if (priceNpr <= 5000) rate = 0.10
  else                        rate = 0.12

  const commission     = Math.round(priceNpr * rate)
  const providerPayout = priceNpr - commission

  return {
    rate,
    ratePercent:     rate * 100,
    commission,
    providerPayout,
    isEmergencyRate: isEmergency,
  }
}