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

  /**
   * AI pre-check (duplicate/stock-photo/AI-generated flags + certificate
   * OCR) for skill-evidence submissions. Off by default for the same
   * pilot-cost reason as kycManualReview — skill evidence stays fully
   * human-reviewed either way, this only adds AI-assist on top.
   */
  skillEvidenceAiPrecheck: truthy(process.env.SKILL_EVIDENCE_AI_PRECHECK_ENABLED, false),

  /** RAG / Groq streaming assistant. Off until support volume justifies it. */
  aiAssistant: truthy(process.env.AI_ASSISTANT_ENABLED, false),

  /**
   * Semantic KB retrieval via Pinecone (embeddings) instead of MySQL
   * FULLTEXT keyword search. Requires PINECONE_API_KEY and a populated
   * index (see src/scripts/setupPineconeIndex.ts / reindexKbToPinecone.ts).
   * Degrades to the FULLTEXT/LIKE path in assistantRetrieval.ts whenever
   * this is off, the key is missing, or a Pinecone call fails — never
   * blocks an answer.
   */
  assistantSemanticSearch: truthy(process.env.AI_SEMANTIC_SEARCH_ENABLED, false),

  /** Emergency "Find Me a Pro Now" dispatch. Needs provider density first. */
  emergencyDispatch: truthy(process.env.EMERGENCY_DISPATCH_ENABLED, false),

  /** Provider credit packs / paid ranking boosts. Meaningless pre-liquidity. */
  credits: truthy(process.env.CREDITS_ENABLED, false),

  /** Hyper-local neighborhood tags (needs booking volume to populate). */
  neighborhoodTags: truthy(process.env.NEIGHBORHOOD_TAGS_ENABLED, false),

  /**
   * AI-powered nearest-provider "Smart Match". The deterministic distance +
   * trust ranking always runs; this flag only controls whether Groq is called
   * in the background to re-rank the shortlist and explain the top pick.
   * Default ON, but it degrades gracefully to the deterministic order when
   * GROQ_API_KEY is missing or the call fails — never blocks the response.
   */
  aiSmartMatch: truthy(process.env.AI_SMART_MATCH_ENABLED, true),

  /**
   * Paid Trust Badges (PRD §4.3 — Skill Verified / Background Checked /
   * Insured). Providers pay a verification fee; badges display on their
   * profile once an admin approves. Independent of the credit-pack economy.
   */
  trustBadges: truthy(process.env.TRUST_BADGES_ENABLED, true),
} as const

export type FeatureFlags = typeof features
