/**
 * Trust Badge catalog — PRD §4.3 "Trust Badge Fees".
 *
 * Purchasable trust signals a provider can buy on top of their KYC tier. The
 * fee pays for a *verification service*, not for a ranking boost — badges are
 * display-only trust signals and deliberately do NOT feed the numeric trust
 * score (which stays performance-earned; see PRD §7 on paid ranking).
 *
 * FAST_RESPONDER is intentionally absent — it is system-EARNED (accept an
 * emergency within 5 min), never sold. See EarnedBadge / booking flow.
 */

export type PurchasableBadge = 'SKILL_VERIFIED' | 'BACKGROUND_CHECKED' | 'INSURED'

export interface BadgeCatalogItem {
  badgeType: PurchasableBadge
  label: string
  priceNpr: number
  /** null = one-time (no expiry); a number = validity window in days. */
  validityDays: number | null
  annual: boolean
  /** Insurance requires the provider to attach a policy document. */
  requiresDocument: boolean
  verificationStep: string
  description: string
}

export const BADGE_CATALOG: Record<PurchasableBadge, BadgeCatalogItem> = {
  SKILL_VERIFIED: {
    badgeType: 'SKILL_VERIFIED',
    label: 'Skill Verified',
    priceNpr: 199,
    validityDays: null,
    annual: false,
    requiresDocument: false,
    verificationStep: 'AI assessment + admin review of work samples or CTEVT certificate',
    description:
      'Confirms your trade skill through reviewed work samples or a training certificate.',
  },
  BACKGROUND_CHECKED: {
    badgeType: 'BACKGROUND_CHECKED',
    label: 'Background Checked',
    priceNpr: 499,
    validityDays: null,
    annual: false,
    requiresDocument: false,
    verificationStep: 'Criminal record check (Phase 2 — NRN database integration)',
    description:
      'A criminal-record background check for high-trust, high-value jobs.',
  },
  INSURED: {
    badgeType: 'INSURED',
    label: 'Insured',
    priceNpr: 299,
    validityDays: 365,
    annual: true,
    requiresDocument: true,
    verificationStep: 'Provider uploads insurance document; platform verifies and displays status',
    description:
      'Shows customers you carry liability insurance. Renews yearly.',
  },
}

export const isPurchasableBadge = (t: string): t is PurchasableBadge =>
  t === 'SKILL_VERIFIED' || t === 'BACKGROUND_CHECKED' || t === 'INSURED'
