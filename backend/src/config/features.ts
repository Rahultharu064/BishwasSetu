/**
 * MVP feature flags — scope the launch surface to the single-city pilot.
 *
 * Rationale (see docs/MVP_SCOPE.md): the backend ships far more than a
 * pre-revenue pilot needs. These flags let us run a lean, low-cost launch
 * (manual KYC review, no paid AI infra) and turn subsystems on only once
 * real usage justifies their cost.
 *
 * Every flag reads from an env var so ops can flip behaviour without a deploy.
 * Defaults are chosen for the pilot, NOT for the full PRD feature set.
 */

const truthy = (v: string | undefined, fallback: boolean): boolean => {
  if (v === undefined || v.trim() === '') return fallback
  return ['1', 'true', 'yes', 'on'].includes(v.trim().toLowerCase())
}

export const features = {
  /**
   * When true, KYC skips the paid AI pipeline (OCR + AWS Rekognition face
   * match + Groq-vision forgery detection) and routes every submission
   * straight to the human admin queue. Default ON for the pilot — a human
   * reviewing a phone photo catches obvious fakes at pilot volume for free.
   */
  kycManualReview: truthy(process.env.KYC_MANUAL_REVIEW, true),

  /** RAG / Groq streaming assistant. Off until support volume justifies it. */
  aiAssistant: truthy(process.env.AI_ASSISTANT_ENABLED, false),

  /** Emergency "Find Me a Pro Now" dispatch. Needs provider density first. */
  emergencyDispatch: truthy(process.env.EMERGENCY_DISPATCH_ENABLED, false),

  /** Provider credit packs / paid ranking boosts. Meaningless pre-liquidity. */
  credits: truthy(process.env.CREDITS_ENABLED, false),

  /** Hyper-local neighborhood tags (needs booking volume to populate). */
  neighborhoodTags: truthy(process.env.NEIGHBORHOOD_TAGS_ENABLED, false),
} as const

export type FeatureFlags = typeof features
