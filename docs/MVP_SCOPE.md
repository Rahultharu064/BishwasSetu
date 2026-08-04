# MVP Scope — Single-City Pilot

The backend implements far more than a pre-revenue pilot needs. To launch lean
and prove liquidity before spending on AI infra, the launch surface is scoped
with feature flags (`src/config/features.ts`). This document records what is ON
for the pilot, what is deferred, and why.

## The one hypothesis to test

> In one Kathmandu-area neighborhood, will customers pay a platform commission
> to book a provider they didn't already know, and will that provider keep
> coming back for more jobs?

Everything not directly testing that sentence is deferred.

## Feature flags (`src/config/features.ts`)

| Flag | Env var | Pilot default | Effect |
|---|---|---|---|
| Manual KYC review | `KYC_MANUAL_REVIEW` | **on** | KYC skips the paid AI pipeline (OCR + AWS Rekognition + Groq-vision) and goes straight to the human admin queue. Zero per-signup AI cost. |
| AI assistant | `AI_ASSISTANT_ENABLED` | off | RAG/Groq streaming assistant disabled — use phone/WhatsApp support at pilot volume. See `docs/AI_ASSISTANT.md`. |
| AI assistant semantic search | `AI_SEMANTIC_SEARCH_ENABLED` | off | Optional Pinecone embeddings retrieval on top of the AI assistant; falls back to MySQL FULLTEXT when off/unconfigured. |
| Emergency dispatch | `EMERGENCY_DISPATCH_ENABLED` | off | "Find Me a Pro Now" needs provider density to work; enable after supply is dense. |
| Credit packs / boosts | `CREDITS_ENABLED` | off | Paid ranking is meaningless before there is competition for visibility. |
| Neighborhood tags | `NEIGHBORHOOD_TAGS_ENABLED` | off | "Worked 7 homes in X" needs booking volume to look credible. |

Flip any flag via its env var without a code change.

## What ships in the pilot

Auth · browse services · provider search & profile · booking lifecycle ·
escrow payment (Khalti/eSewa) · **Tier 1** KYC (manual review) · admin KYC
queue · reviews.

## Cost cut (#3)

With `KYC_MANUAL_REVIEW=on`, no OCR / face-match / forgery API calls fire
during signup — a human reviews a phone photo and a selfie in the admin queue.
Re-enable the AI pipeline only once manual review becomes the bottleneck.

## Anti-disintermediation (#4)

Provider ranking is primarily by **on-platform completed bookings**
(`searchProviders`), with trust score and on-platform revenue as tie-breakers.
All ranking signals derive solely from on-platform booking history, so
off-platform cash deals earn no visibility. Escrow-backed service guarantees
attach only to on-platform (escrow) payments by construction.

## Not code — business validation still required

- Recruit ~50–100 real providers in one neighborhood (supply-first).
- Interview ~10 building managers/hotels before writing any B2B code.
- Watch repeat-booking rate as the real product-market-fit signal.
