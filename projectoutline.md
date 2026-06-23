# BishwasSetu — Product Requirements Document

**Version:** 2.1
**Status:** Active Development
**Classification:** Internal — Engineering & Product
**Last Updated:** 2026-06-23

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Personas](#3-user-personas)
4. [Platform Architecture](#4-platform-architecture)
5. [Module Specifications](#5-module-specifications)
6. [AI Feature Layer](#6-ai-feature-layer)
7. [Business Model](#7-business-model)
8. [API Reference](#8-api-reference)
9. [Database Schema](#9-database-schema)
10. [Tech Stack](#10-tech-stack)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Future Roadmap](#12-future-roadmap)

---

## 1. Product Overview

**BishwasSetu** (बिश्वाससेतु — "Bridge of Trust") is a trust-based home services marketplace connecting customers with verified service providers in Nepal. The platform's core differentiator is a transparent, AI-augmented **Trust Score system**, mandatory KYC verification, and community-driven reviews — designed to solve the fundamental problem of trust in Nepal's informal service economy.

### Problem Statement

The informal home services economy in Nepal operates without accountability. Customers have no way to verify a plumber's qualifications. Skilled providers have no way to build a verifiable, portable reputation. BishwasSetu creates the infrastructure for that trust layer.

### Core Value Propositions

| Stakeholder | Value |
|---|---|
| Customer | Book verified providers with transparent trust scores and real accountability |
| Provider | Build a portable, verified professional reputation and find consistent work |
| Platform | Become the trust infrastructure for Nepal's home services economy |

### What BishwasSetu Is Not

- Not a subscription platform that charges providers during idle months
- Not an ad platform that sells ranking to the highest bidder
- Not a lead-selling platform that auctions customer inquiries to multiple providers
- Not a platform where money can override trust score in organic search ranking

These are deliberate architectural decisions, not feature gaps.

---

## 2. Goals & Success Metrics

### MVP Goals

| Goal | Target |
|---|---|
| Provider KYC approval time | Median < 4 hours (AI-assisted pipeline) |
| Customer booking conversion | > 25% of provider profile views |
| Trust Score false positive rate | < 5% of flagged reviews |
| RAG Assistant resolution rate | > 60% of queries without human support |

### Key Performance Indicators

| Metric | Month 3 | Month 6 | Month 12 |
|---|---|---|---|
| Verified providers | 200 | 1,000 | 3,000 |
| Monthly bookings | 500 | 3,000 | 10,000 |
| Average trust score | > 70 | > 75 | > 78 |
| Complaint rate | < 5% | < 3% | < 2% |
| AI Assistant CSAT | — | > 4.0/5 | > 4.3/5 |
| Monthly revenue (NPR) | — | 200k | 570k |

---

## 3. User Personas

### Persona 1 — Maya (Customer)

- **Age:** 28 | **Location:** Kathmandu | **Device:** Android smartphone
- **Behavior:** Finds home services via Facebook groups today. Frustrated by no-shows, unclear pricing, and no accountability.
- **Need:** Book a reliable plumber or electrician with a verifiable quality guarantee.
- **Language:** Nepali primary, some English.

### Persona 2 — Rajan (Service Provider)

- **Age:** 34 | **Location:** Lalitpur | **Device:** Basic Android
- **Behavior:** Gets work via word-of-mouth. Has strong skills but no formal way to prove or scale his reputation.
- **Need:** Consistent work and a reputation that travels with him — without paying platform fees during slow months.
- **Language:** Nepali. Limited English comfort.

### Persona 3 — Admin / Moderator

- **Background:** Platform operations team member.
- **Need:** Clear, AI-assisted queues for KYC review, complaint resolution, and trust anomaly flags — not raw database tables.

---

## 4. Platform Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Public Website                     │
│          (Landing / Services / Providers / About)    │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
┌──────────────┐             ┌──────────────────┐
│  Customer    │             │ Service Provider  │
│  Module      │             │ Module + KYC      │
└──────┬───────┘             └──────────┬────────┘
       │                               │
       └──────────────┬────────────────┘
                      ▼
        ┌─────────────────────────┐
        │     Core Services       │
        │  Search · Booking ·     │
        │  Trust Engine · Reviews │
        │  Complaints · Credits   │
        └──────────────┬──────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
┌──────────────┐             ┌──────────────────┐
│  AI Layer    │             │  Admin Panel      │
│  (Active)    │             │                   │
└──────────────┘             └──────────────────┘
        │
┌───────┴─────────────────────────────────────────┐
│  Shared Infra: PostgreSQL · Redis · Cloudinary · Groq API │
└─────────────────────────────────────────────────┘
```

---

## 5. Module Specifications

### 5.1 Public Website

All public pages share a common **Sticky Header** (Logo, Nav: Home / Services / Providers / About, CTAs: Login / Register) and **Footer** (brand tagline, quick links, legal, contact).

#### Landing Page

- Hero with service + location search bar
- Service categories grid (icon, name, CTA)
- "Why BishwasSetu" trust section (Trust Score / KYC / Support)
- Featured verified providers carousel
- CTA banners for provider registration

#### Services Page

- Category cards: icon, description, average trust score, "View Providers" CTA
- Service detail preview: included tasks, estimated pricing, avg. completion time
- Trust benefits section

#### Providers Page

- Advanced filters: category, location, trust score range, verification status, availability
- Provider cards: photo, skills, experience badge, trust score, verification badge, boost indicator
- Provider profile detail: trust score breakdown, experience badge, reviews, availability calendar, "Book Service" CTA

#### About Page

- Mission & vision, trust philosophy, platform values, contact details

---

### 5.2 Authentication & Authorization

**Supported methods:** Phone (OTP) or Email + Password
**Token strategy:** JWT with HttpOnly cookie, refresh token rotation
**RBAC roles:** Customer · Provider (Unverified) · Provider (Verified) · Moderator · Admin

**Business Rules**

- OTP expires in 5 minutes.
- JWT access token TTL: 15 minutes. Refresh token TTL: 7 days.
- Providers with status ≠ `VERIFIED` cannot accept bookings — enforced at middleware, not just UI.

**Endpoints**

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-otp
POST /api/auth/refresh
POST /api/auth/logout
```

---

### 5.3 Customer Module

**Dashboard**

- Nearby verified providers (geolocation-based)
- Recommended services (category history + trust-weighted)
- Recent bookings summary with status indicators

**Provider Profile Page (Customer View)**

- Trust score meter with breakdown
- Experience badge display
- Reviews list with authenticity indicators
- Availability slots
- Book Service CTA
- "Boosted" label on featured providers (disclosed, never hidden)

**Endpoints**

```
GET  /api/users/me
PUT  /api/users/me
GET  /api/providers/:id
GET  /api/providers/:id/reviews
GET  /api/providers/:id/availability
```

---

### 5.4 Service Provider Module

#### Mandatory Enforcement Rule

> Providers **CANNOT** accept bookings until professional info & KYC are `VERIFIED`. Enforced at middleware — any attempt returns `403 Forbidden`.

#### Onboarding Status

| Status | Description |
|---|---|
| `INCOMPLETE` | Profile fields not filled |
| `PENDING_DOCUMENTS` | Professional info saved, documents not uploaded |
| `UNDER_REVIEW` | Submitted, awaiting AI + human review |
| `VERIFIED` | Full access unlocked |
| `REJECTED` | Rejection reason shown with re-submission option |

#### Provider Professional Information

Fields: Legal name · Phone & email · Service categories & skills · Years of experience · Service description · Service area (district/zone) · Availability schedule

#### Experience Badge Logic

| Badge | Nepali | Condition |
|---|---|---|
| New | नविन (Navin) | < 1 year |
| Experienced | अनुभवी (Anubhavi) | 1–2 years |
| Expert | प्रवीन (Prabin) | > 2 years |

#### Provider Dashboard (Verified Only)

- Trust score overview with trend graph
- Credit balance widget (current credits, pack recharge CTA)
- Incoming booking requests (accept / reject)
- Earnings summary + commission breakdown
- Verification badge display
- AI Assistant chat widget (RAG-based)
- Boost analytics: profile views, click-through rate, booking conversion

**Endpoints**

```
POST /api/providers/profile/complete
GET  /api/providers/me
PUT  /api/providers/me
GET  /api/providers/me/bookings
PUT  /api/bookings/:id/status
```

---

### 5.5 Provider KYC & Verification

#### KYC Wizard Flow

**Step 1 — Professional Info** (fields from 5.4, saved as draft)

**Step 2 — Document Upload**

| Document | Required |
|---|---|
| Government-issued ID (Citizenship / Passport) | Yes |
| Profile photo (selfie) | Yes |
| Professional certificate | No (boosts trust score if provided) |

Files uploaded to Cloudinary via signed upload URLs. Max 5 MB. Formats: JPG, PNG, PDF. KYC documents stored in a private, restricted Cloudinary folder — accessible only via signed delivery URLs.

**Step 3 — Verification Status**

- Status badge display
- Admin feedback (REJECTED only)
- Re-upload button (REJECTED only)

**Post-Submission Behavior**

- Redirect to read-only dashboard
- Booking functionality disabled until `VERIFIED`
- Trust score displays as "Pending"

**Endpoints**

```
POST /api/providers/kyc/upload
GET  /api/providers/kyc/status
GET  /api/admin/providers/kyc
PUT  /api/admin/providers/kyc/:id/approve
PUT  /api/admin/providers/kyc/:id/reject
```

---

### 5.6 Service Discovery & Advanced Search

**Filter parameters:** category · lat/lng + radius · trust score min/max · verification status · availability date

**Sorting:** Trust score (default organic) · Distance · Price · Experience · AI-ranked (with boost layer)

With AI active (6.3), results are re-ranked by semantic intent before returning. Boost credits add a secondary featured layer — disclosed to customers and never overriding organic trust-score ranking.

**Endpoints**

```
GET /api/providers?category=&lat=&lng=&radius=&trust_min=&sort=
GET /api/categories
GET /api/categories/:id/providers
GET /api/categories/:id/price-range
```

---

### 5.7 Booking & Job Management

#### Booking Lifecycle

```
REQUESTED → ACCEPTED → IN_PROGRESS → COMPLETED → REVIEWED
                ↓
            REJECTED
```

#### Business Rules

- Only `VERIFIED` providers can transition `REQUESTED → ACCEPTED`.
- Customers can cancel up to 2 hours before scheduled time.
- 48-hour review window opens after `COMPLETED`.
- Providers rejecting > 30% of bookings over 30 days receive a trust score penalty.
- New providers (trust score < 40): first 3 bookings require manual completion confirmation from customer (Risk-Adaptive Booking — see 6.6).
- Commission deducted automatically from provider payout on `COMPLETED`.

**Endpoints**

```
POST /api/bookings
GET  /api/bookings/:id
PUT  /api/bookings/:id/status
GET  /api/bookings/customer/me
GET  /api/bookings/provider/me
```

---

### 5.8 Trust Score Engine

Score range 0–100. Recomputed on every review, complaint, vouch, and booking event.

#### Base Formula

| Signal | Weight |
|---|---|
| Review average (recency-weighted) | 40% |
| Booking timeliness (on-time rate) | 20% |
| Complaint ratio (complaints / bookings) | −20% |
| Verification completeness | 10% |
| Community vouches | 10% |

#### AI-Augmented Signals (6.1)

- Behavioral anomaly flags → temporary score hold pending admin review
- Review authenticity score → gates each review before it counts
- Dynamic decay → −2 points/month after 60 days of inactivity

#### Boost Interaction

Credit-based boost (7.3) affects **featured placement only** — it does not modify the trust score. Organic search ranking remains purely trust-score-driven.

**Endpoints**

```
GET  /api/providers/:id/trust-score
POST /api/internal/trust/recompute/:id
GET  /api/admin/trust/anomalies
```

---

### 5.9 Review & Rating System

- One review per completed booking, per customer.
- Rating: 1–5 stars. Review text: 10–500 characters.
- Reviews held for AI authenticity screening before appearing publicly.
- Providers may submit one public reply per review.

**Endpoints**

```
POST /api/reviews
GET  /api/providers/:id/reviews
POST /api/reviews/:id/reply
```

---

### 5.10 Complaint & Resolution System

**Complaint types:** Service quality · No-show · Overcharging · Abusive behavior · Fraud

**Resolution flow**

```
Customer files → AI triage classification → Admin queue →
Admin resolves (refund / warning / ban) → Both parties notified
```

- `FRAUD` or `ABUSIVE` complaints escalated immediately.
- Providers with > 3 upheld complaints in 90 days auto-suspended pending review.

**Endpoints**

```
POST /api/complaints
GET  /api/complaints/:id
PUT  /api/complaints/:id/resolve
GET  /api/admin/complaints
```

---

### 5.11 Admin & Moderator Panel

**KYC Review Queue**

- Paginated pending KYC list
- Document viewer (ID, selfie, certificate)
- AI summary panel: confidence score, extracted fields, face match result, risk flag
- One-click approve / reject with required rejection reason

**Complaint Review Page**

- Complaint detail + chat timeline
- Resolution actions: refund · provider warning · suspension · account ban
- AI-generated triage classification

**Admin Dashboard**

- User & provider management (search, filter by status/category/trust score)
- Trust score audit log
- Platform analytics (bookings by category/zone, trust score distribution)
- Fraud & abuse flag queue
- Revenue analytics: commission by category · credit pack sales · badge purchase history

**Endpoints**

```
GET  /api/admin/users
GET  /api/admin/providers
PUT  /api/admin/providers/:id/status
GET  /api/admin/trust/anomalies
GET  /api/admin/analytics/summary
GET  /api/admin/analytics/revenue
```

---

### 5.12 Notifications & Payments

**Notification Channels:** In-app · Push (Firebase FCM) · SMS (Sparrow SMS)

**Notification Events:** Booking request received · Booking accepted/rejected · Job completed · Review received · KYC status update · Complaint resolved · Credit balance low (10 credits remaining)

**Payment Methods:** Khalti · eSewa · Cash-on-completion

**Payment flows:**

- Commission deducted from provider payout on booking completion — customer never sees platform fees.
- Credit pack purchases: Khalti or eSewa, instant credit top-up on payment confirmation.
- Trust badge purchases: one-time payment, badge activated on admin verification.
- Booking deposit held in escrow, released to provider on job completion + no active dispute.

---

## 6. AI Feature Layer

The AI layer is additive. Every feature has a graceful degradation path — if a pipeline fails, the platform falls back to manual flows without user-facing errors. All AI decisions affecting user accounts are logged with model version, confidence score, input hash, and timestamp.

---

### 6.1 Trust Intelligence Engine

**Status:** Active (MVP)

**Purpose:** Replace static trust scoring with ML-augmented, explainable signals.

**Behavioral Anomaly Detector** — monitors sudden review spikes, off-hours patterns, sentiment divergence between messages and reviews. Anomalies place a temporary score hold and create an admin flag. No silent actions.

**Review Authenticity Scorer** — embeds each review + metadata (time-to-submit, device fingerprint, IP cluster, text similarity to prior reviews). Below-threshold reviews hidden pending admin review. Audit trail preserved.

**Dynamic Trust Decay Model** — −2 points/month after 60 days inactivity. Recovers immediately on new positive signals.

**Community Vouch Graph** — vouch weight = voucher's trust score / 100. Prevents trust farming via low-score accounts.

**Endpoints**

```
GET  /api/providers/:id/trust-score
     Response: { score, breakdown, ai_signals, anomaly_flag, last_computed }

POST /api/internal/trust/recompute/:id
     Triggered by: review, complaint, vouch, booking, decay job

GET  /api/admin/trust/anomalies
```

---

### 6.2 AI KYC Verification

**Status:** Active (MVP)

**Purpose:** Reduce KYC approval time from hours to minutes for clear-cut cases.

**Pipeline**

```
Document Upload (Cloudinary — private folder)
        ↓
OCR + Field Extraction  →  Mismatch check vs. profile data
        ↓
Face Match (selfie ↔ ID photo)
        ↓
Forgery Detection (EXIF, metadata, compression artifacts)
        ↓
  Confidence ≥ 85% + no flags  →  AUTO-APPROVE
  Confidence < 85% OR any flag  →  HUMAN QUEUE (admin sees AI report)
```

Auto-approve threshold is configurable via admin panel. All threshold changes are logged. Admin decision always overrides AI.

**Endpoints**

```
POST /api/providers/kyc/upload
     Returns: { job_id, status: "processing" }

GET  /api/providers/kyc/status
     Returns: { status, ai_confidence, flag_reason, admin_feedback }

POST /api/admin/kyc/:id/override
```

**Implementation:** OCR via AWS Textract · Vision analysis via Groq `llama-3.2-90b-vision-preview` · Face match via AWS Rekognition · Files stored on Cloudinary (signed upload, restricted delivery) · Bull queue on Redis · SLA: AI < 2 min, human queue < 4 hours.

---

### 6.3 Smart Provider Matching

**Status:** Active (MVP)

**Purpose:** Return ranked, intent-aware results rather than a flat filtered list.

**Intent-Aware Reranker** — query embedded via `text-embedding-3-small`, cosine similarity against provider service description embeddings. "Plumber for leak" and "plumber for renovation" return meaningfully different rankings.

**Availability Predictor** — historical booking acceptance rate by day/time → predicted availability badge on provider card.

**Personalized Discovery** — returning customers weighted toward booking history. Cold-start defaults to trust-score-weighted results.

**Price Fairness Scoring** — market rate computed per category + zone from accepted booking prices. Providers > 30% above market receive a soft dashboard warning.

**Boost Layer Integration** — featured placement from credit boosts appears as a secondary, clearly labelled layer above organic results. Organic ranking is never modified by credits.

**Endpoints**

```
GET /api/providers?q=&lat=&lng=&radius=&trust_min=&sort=ai_rank
GET /api/providers/:id/availability-hint
GET /api/categories/:id/price-range?zone=
```

**Implementation:** pgvector on PostgreSQL 16 · cosine similarity at search time (< 100ms p95) · provider embeddings updated on profile edit via background job.

---

### 6.4 RAG-Based AI Assistant (Customer & Provider Facing)

**Status:** Active (MVP)

**Purpose:** Context-aware conversational assistant embedded across all flows. Zero hallucinated policy — all answers sourced from indexed platform content.

#### Architecture

```
User Message
      ↓
Query Preprocessing
  - Language detection (Nepali / English)
  - Intent classification (booking / provider info / complaint / policy / credits)
      ↓
Retrieval — PostgreSQL FTS (vectorless)
  - BM25 keyword search over kb_articles
  - Context injection: session, active booking, viewed provider, credit balance
      ↓
LLM Generation (Groq — llama-3.3-70b-versatile — streaming)
  - System prompt grounded in retrieved chunks only
  - Instruction: never answer beyond retrieved context
      ↓
Streamed Response → UI widget (SSE)
```

#### Vectorless Retrieval Design

PostgreSQL full-text search (`tsvector` + `GIN` index) — no separate vector database required at MVP scale.

```sql
CREATE TABLE kb_articles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    TEXT NOT NULL,  -- 'policy'|'faq'|'provider_info'|'booking_guide'|'credits'
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  lang        TEXT DEFAULT 'ne',  -- 'ne' | 'en'
  search_vec  TSVECTOR GENERATED ALWAYS AS (
                to_tsvector('english', title || ' ' || content)
              ) STORED,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX kb_fts_idx ON kb_articles USING GIN(search_vec);
```

Retrieval query:

```sql
SELECT id, title, content,
       ts_rank(search_vec, query) AS rank
FROM kb_articles,
     plainto_tsquery('english', $1) AS query
WHERE search_vec @@ query
ORDER BY rank DESC
LIMIT 5;
```

#### Context Injection per Intent

| Intent | Injected Context |
|---|---|
| Booking help | Current booking object, provider profile, lifecycle docs |
| Provider comparison | Shortlisted provider profiles + trust breakdowns |
| Complaint filing | Complaint form schema, policy articles, past complaint status |
| Credits / boost | Current credit balance, pack options, boost analytics |
| Policy / FAQ | Top-ranked KB chunks |
| General (Nepali) | Translated KB chunks; response in Nepali |

#### UI Placement

Not a standalone chatbot page. Contextual widget:

- Booking flow: appears after 30s inactivity on a step
- Provider profile page: "Compare or ask about this provider"
- Complaint page: structured complaint intake guide
- Provider dashboard: booking, profile, and credits questions
- Global help icon: always accessible

#### Guardrails

- Read-only — cannot initiate bookings or any mutations
- Context overflow → "I don't have enough information — please contact support"
- All conversations logged (user ID, query, retrieved chunks, response)
- PII and payment details never injected into assistant context

#### Nepali Language Support

- Devanagari and romanized Nepali input accepted
- KB articles maintained in both languages (`lang` column)
- Retrieval runs on both language indices, results merged
- Response generated in detected input language
- Native bilingual operation — not translation

**Endpoints**

```
POST /api/assistant/chat
     Body: { message, session_id, context_type, context_id }
     Response: SSE streamed text

GET  /api/assistant/history/:session_id
POST /api/admin/kb/articles
PUT  /api/admin/kb/articles/:id
DELETE /api/admin/kb/articles/:id
```

**Implementation:** Groq API `llama-3.3-70b-versatile` streaming · PostgreSQL FTS · Redis session (TTL 30 min) · KB managed via admin panel, no engineer needed for content updates.

---

### 6.5 Provider AI Copilot *(Future — Phase 2)*

**Status:** Planned. Not in MVP scope.

Planned sub-features: profile completion coach · rejection explainer · pricing advisor · review translator (Nepali ↔ English).

**Dependency:** Requires > 500 active providers for pricing benchmarks to be meaningful. Rejection explainer can ship earlier as a template-based feature.

---

### 6.6 Fraud & Moderation AI

**Status:** Active (MVP)

**Purpose:** Platform integrity at scale without a large moderation headcount.

**Fake Review Detector** — graph analysis on review timing + account relationships. Ring detection (A→B, B's network→C, C→A within 72 hours) flags all accounts. Graph-based, not just text-based.

**Coordinated Fraud Signal** — device fingerprint + IP clustering detects multiple accounts from the same location. Admin alert triggered. No auto-ban (false positive risk in shared-WiFi environments).

**Harmful Content Filter** — review text, complaint descriptions, and provider service descriptions pass through content moderation classifier at write time. Slurs, doxxing, threatening language caught before storage.

**Risk-Adaptive Booking** — automatic friction for new providers (trust score < 40):
- "New provider" badge on customer-facing card
- Payment deposit held in escrow 7 days (vs. standard 2)
- First 3 bookings require manual completion confirmation from customer
- Friction auto-removes as trust score grows above 40

**Endpoints**

```
POST /api/internal/moderation/review/:id
POST /api/internal/moderation/content
GET  /api/admin/fraud/flags
PUT  /api/admin/fraud/flags/:id/resolve
```

---

### 6.7 Admin Intelligence Panel *(Future — Phase 2)*

**Status:** Planned. Not in MVP scope.

Planned sub-features: KYC decision summaries in admin UI · complaint triage AI · platform health monitor · churn prediction signals.

**Dependency:** Requires 3+ months of platform data for meaningful pattern detection. The KYC AI summary display (from 6.2) ships in MVP as an early subset of this feature.

---

## 7. Business Model

### 7.1 Core Philosophy

BishwasSetu monetizes **outcomes**, not time. The fundamental problem with subscription models in Nepal's variable-demand home services market is that providers pay during idle months when they earn nothing — creating resentment, churn, and an adversarial relationship between provider and platform.

BishwasSetu's model is designed around one constraint: **every revenue stream must either produce trust or be unlocked by trust.** Any stream that erodes trust destroys the platform's core product.

---

### 7.2 Revenue Stream 1 — Transaction Commission (Primary)

The platform deducts a percentage of every **completed** booking from the provider's payout. Providers pay nothing during idle periods.

#### Commission Rate Structure

| Booking Value | Commission |
|---|---|
| NPR 0 – 1,000 | 8% |
| NPR 1,001 – 5,000 | 10% |
| NPR 5,001+ | 12% |

The tiered rate reflects Nepal's market reality: small jobs (light bulb, tap repair) are price-sensitive and high-frequency — they build platform liquidity. Large jobs (renovation, deep cleaning) have sufficient margin to absorb a higher cut. A flat rate at 10% would either kill small job volume or leave money on the table for large jobs.

**Collection mechanism:** Commission is deducted from provider payout automatically at `COMPLETED` status. The customer pays the full amount and never sees platform fees. This eliminates booking abandonment caused by visible service charges.

**Payment methods:** Khalti · eSewa (digital). Cash-on-completion supported for providers not yet using digital wallets — the booking record is held by the platform, and the provider manually confirms receipt. This is a market access decision: requiring digital payment from day one excludes a large segment of the target provider base.

**Unit economics**

| Metric | Value |
|---|---|
| Average booking value | NPR 1,500 |
| Average commission rate | 10% |
| Average revenue per booking | NPR 150 |
| Bookings to reach NPR 450k/month | ~3,000 (Month 12 target) |

---

### 7.3 Revenue Stream 2 — Credit-Based Boost System (Unique)

Providers buy credits when they want more visibility. No monthly fee. No obligation when idle. Credits work exactly like mobile data recharges — buy when you need, stop when you don't.

#### Why Credits, Not Subscriptions

A subscription forces providers to predict their future demand. They cannot. A Rajan-type provider in Sunsari has no way to know whether next month will bring 20 bookings or 2. A credit pack has no such assumption: buy when active, pay nothing when not.

Credits are **performance-based, not time-based.** Credits deduct only when a boost produces a result (a booking accepted through a featured slot), not for the passage of time. A provider who buys a pack and goes on pilgrimage for three weeks returns with their credits exactly where they left them. Zero loss. Zero resentment.

#### Credit Pack Tiers

| Pack | Price | Credits | Primary Value |
|---|---|---|---|
| Starter | NPR 99 | 50 | 1 week priority ranking + basic analytics |
| Active *(best value)* | NPR 249 | 150 | 3 weeks priority ranking + homepage featured slot + full analytics + AI tips |
| Pro | NPR 499 | 350 | 6 weeks priority ranking + 2× search boost + direct message before booking |

#### Credit Mechanics

- Credits deduct only on a booking accepted through a boost placement (not on placement time alone).
- Unused credits never expire.
- Low-credit warning at 10 credits remaining → in-app and push notification prompting recharge. No auto-charge. Provider decides.
- Boost placement is clearly labelled "Featured" to customers — disclosed, never hidden.

#### Boost and Trust Score Separation (Critical)

Credits affect **featured placement only**. Organic search ranking is trust-score-driven and cannot be purchased. A provider with a trust score of 40 cannot outrank a provider with a trust score of 80 in organic results, regardless of credits spent. Credits determine which high-trust providers appear in the featured layer above organic results.

This protects platform credibility: customers always see quality-ordered results first. Credits are meaningful only once a provider has earned competitive trust.

#### Credit Analytics (Provider Dashboard)

Providers see: profile views generated by boost · click-through rate · bookings won through boost · cost per booking acquired via credits. This makes ROI visible and drives informed recharge decisions rather than churn.

**Endpoints**

```
POST /api/credits/purchase
     Body: { pack_id, payment_method }
     Triggers: Khalti/eSewa payment initiation

GET  /api/credits/balance
GET  /api/credits/history
POST /api/credits/boost/activate
     Body: { placement_type, duration_slots }
GET  /api/credits/boost/analytics
POST /api/internal/credits/deduct
     Triggered by: booking accepted through boost slot
```

---

### 7.4 Revenue Stream 3 — Trust Badge Upgrades (One-Time)

Providers pay a one-time fee for additional verified credentials displayed publicly on their profile and search card. These are not cosmetic — each tier requires a real verification step, which is what makes them worth paying for.

| Badge | Fee | Verification Step |
|---|---|---|
| Citizenship verified | Free | Included in base KYC |
| Skill verified | NPR 199 | AI assessment + admin review of work samples or certificate |
| Background checked | NPR 499 | Criminal record check *(Phase 2 — NRN database integration)* |
| Insured | NPR 299/year | Provider uploads insurance document; platform displays insurance status |

**Provider motivation:** A "Skill verified" badge boosts trust score and search ranking — it pays for itself in the first additional booking it generates.

**Customer impact:** "Background checked" directly addresses the primary trust barrier for high-value bookings (renovation, home access). This is a real, verifiable claim — not a star rating.

**Revenue characteristics:** One-time purchases with high margins (no variable cost beyond admin review time, which AI handles at scale). "Insured" badge is annual recurring — providers who let it lapse lose the badge publicly, creating strong renewal motivation.

**Endpoints**

```
POST /api/badges/purchase
     Body: { badge_type, payment_method }
GET  /api/providers/me/badges
GET  /api/providers/:id/badges  (public)
PUT  /api/admin/badges/:id/verify
```

---

### 7.5 Revenue Stream 4 — B2B / Corporate Contracts *(Phase 2)*

Corporate accounts (hotels, apartment complexes, office buildings) pay a monthly retainer for guaranteed access to a pool of pre-vetted providers with defined SLAs.

| Package | Monthly Fee | Included |
|---|---|---|
| Building Manager | NPR 1,999 | Up to 20 requests/month · 4-hour response SLA · dedicated dashboard |
| Hotel / Hospitality | NPR 4,999 | Unlimited requests · dedicated provider pool · 2-hour SLA · invoice billing |
| Enterprise | Custom | Negotiated volume · white-label booking portal · API access |

**Why Phase 2:** B2B requires proven SLA compliance. Promising a 2-hour response time requires sufficient verified providers across enough locations to deliver it consistently. Shipping this prematurely and failing the SLA kills the contract and the reference customer. Build supply density first, then sell uptime guarantees on top.

---

### 7.6 What Is Permanently Excluded

| Mechanism | Reason excluded |
|---|---|
| Monthly provider subscription | Charges during idle months → resentment → churn → supply collapse |
| Paid organic ranking override | Breaks trust signal → customers get low-quality results → platform credibility collapses |
| Lead selling (auction model) | Multiple providers call same customer simultaneously → customer harassment → demand collapse |
| Third-party advertising | Destroys trust brand — customers on a "trusted" platform should not see competitor ads |
| Customer-side booking fees | Adds friction at conversion moment → booking abandonment |
| Auto-renewing credit charges | Provider must control their own spend — no auto-charge under any circumstance |

---

### 7.7 The Trust Flywheel

The business model is self-reinforcing because revenue and trust grow together:

```
More verified providers
        ↓
More customer trust → more bookings
        ↓
More commission revenue
        ↓
More AI investment (better KYC, better matching)
        ↓
Better verification → higher trust scores
        ↓
More verified providers (higher quality)
```

Providers who invest in quality (earn high trust score) pay fewer credits to win the same bookings because their organic ranking is already strong. Quality and revenue alignment is structural — not an accident of pricing.

---

### 7.8 Revenue Projections

| Stream | Type | Month 6 (NPR) | Month 12 (NPR) |
|---|---|---|---|
| Transaction commission | Variable per booking | 150,000 | 450,000 |
| Credit pack sales | On-demand purchases | 30,000 | 80,000 |
| Trust badge fees | One-time + annual | 15,000 | 40,000 |
| B2B contracts | Recurring (Phase 2) | — | — |
| **Total** | | **~195,000** | **~570,000** |

*Approximately $1,400 USD at Month 6 → $4,200 USD at Month 12. Conservative estimates based on 1,000 verified providers and 3,000 monthly bookings at Month 6.*

---

## 8. API Reference

### Base URL

```
Production:  https://api.bishwassetu.com/api/v1
Development: http://localhost:4000/api/v1
```

### Authentication

All authenticated routes: `Authorization: Bearer <access_token>`. Refresh via `POST /api/auth/refresh` with HttpOnly refresh cookie.

### Error Format

```json
{
  "success": false,
  "error": {
    "code": "PROVIDER_NOT_VERIFIED",
    "message": "Provider must complete KYC verification before accepting bookings.",
    "status": 403
  }
}
```

### Complete Endpoint Index

```
── AUTH ──────────────────────────────────────────────────────
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/verify-otp
POST   /api/auth/refresh
POST   /api/auth/logout

── USERS ─────────────────────────────────────────────────────
GET    /api/users/me
PUT    /api/users/me

── PROVIDERS ─────────────────────────────────────────────────
GET    /api/providers
GET    /api/providers/:id
GET    /api/providers/me
PUT    /api/providers/me
GET    /api/providers/:id/trust-score
GET    /api/providers/:id/reviews
GET    /api/providers/:id/availability
GET    /api/providers/:id/availability-hint
GET    /api/providers/:id/badges

── KYC ───────────────────────────────────────────────────────
POST   /api/providers/profile/complete
POST   /api/providers/kyc/upload
GET    /api/providers/kyc/status

── CATEGORIES ────────────────────────────────────────────────
GET    /api/categories
GET    /api/categories/:id/providers
GET    /api/categories/:id/price-range

── BOOKINGS ──────────────────────────────────────────────────
POST   /api/bookings
GET    /api/bookings/:id
PUT    /api/bookings/:id/status
GET    /api/bookings/customer/me
GET    /api/bookings/provider/me

── REVIEWS ───────────────────────────────────────────────────
POST   /api/reviews
GET    /api/providers/:id/reviews
POST   /api/reviews/:id/reply

── COMPLAINTS ────────────────────────────────────────────────
POST   /api/complaints
GET    /api/complaints/:id
GET    /api/complaints/customer/me

── ASSISTANT ─────────────────────────────────────────────────
POST   /api/assistant/chat                (SSE streaming)
GET    /api/assistant/history/:session_id

── CREDITS & BOOST ───────────────────────────────────────────
POST   /api/credits/purchase
GET    /api/credits/balance
GET    /api/credits/history
POST   /api/credits/boost/activate
GET    /api/credits/boost/analytics
POST   /api/internal/credits/deduct

── BADGES ────────────────────────────────────────────────────
POST   /api/badges/purchase
GET    /api/providers/me/badges

── ADMIN ─────────────────────────────────────────────────────
GET    /api/admin/users
GET    /api/admin/providers
PUT    /api/admin/providers/:id/status
GET    /api/admin/providers/kyc
PUT    /api/admin/providers/kyc/:id/approve
PUT    /api/admin/providers/kyc/:id/reject
POST   /api/admin/kyc/:id/override
GET    /api/admin/complaints
PUT    /api/complaints/:id/resolve
GET    /api/admin/trust/anomalies
GET    /api/admin/fraud/flags
PUT    /api/admin/fraud/flags/:id/resolve
GET    /api/admin/analytics/summary
GET    /api/admin/analytics/revenue
PUT    /api/admin/badges/:id/verify
POST   /api/admin/kb/articles
PUT    /api/admin/kb/articles/:id
DELETE /api/admin/kb/articles/:id

── INTERNAL (service-to-service) ─────────────────────────────
POST   /api/internal/trust/recompute/:id
POST   /api/internal/moderation/review/:id
POST   /api/internal/moderation/content
```

---

## 9. Database Schema

### Core AI & Assistant Tables

```prisma
// Knowledge base for RAG assistant
model KbArticle {
  id         String   @id @default(uuid())
  category   String   // 'policy'|'faq'|'provider_info'|'booking_guide'|'credits'
  title      String
  content    String
  lang       String   @default("ne")  // 'ne' | 'en'
  updatedAt  DateTime @updatedAt

  @@map("kb_articles")
}

// Assistant session log
model AssistantSession {
  id          String   @id @default(uuid())
  userId      String?
  sessionId   String   @unique
  contextType String?
  contextId   String?
  messages    Json     // [{ role, content, retrieved_chunks }]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("assistant_sessions")
}

// Trust score event log
model TrustScoreEvent {
  id         String   @id @default(uuid())
  providerId String
  score      Float
  prevScore  Float
  trigger    String   // 'review'|'complaint'|'vouch'|'decay'|'booking'
  inputs     Json     // full breakdown snapshot
  aiFlags    Json?
  modelVer   String?
  createdAt  DateTime @default(now())

  provider   Provider @relation(fields: [providerId], references: [id])
  @@map("trust_score_events")
}

// KYC AI decision log
model KycAiDecision {
  id            String   @id @default(uuid())
  providerId    String
  ocrResult     Json
  faceScore     Float?
  forgeryRisk   String   // 'low'|'medium'|'high'
  confidence    Float
  decision      String   // 'AUTO_APPROVE'|'HUMAN_QUEUE'
  adminOverride String?  // 'APPROVE'|'REJECT'
  modelVer      String
  createdAt     DateTime @default(now())

  provider      Provider @relation(fields: [providerId], references: [id])
  @@map("kyc_ai_decisions")
}

// Content moderation log
model ModerationLog {
  id         String   @id @default(uuid())
  entityType String   // 'review'|'complaint'|'profile'
  entityId   String
  result     String   // 'PASSED'|'FLAGGED'
  category   String?
  confidence Float
  createdAt  DateTime @default(now())

  @@map("moderation_logs")
}
```

### Credit & Boost Tables

```prisma
// Credit packs catalogue
model CreditPack {
  id          String    @id @default(uuid())
  name        String    // 'starter'|'active'|'pro'
  credits     Int
  priceNpr    Int
  features    Json      // array of feature strings
  isActive    Boolean   @default(true)
  purchases   CreditPurchase[]

  @@map("credit_packs")
}

// Credit purchase records
model CreditPurchase {
  id            String     @id @default(uuid())
  providerId    String
  packId        String
  creditsAdded  Int
  amountNpr     Int
  paymentMethod String     // 'khalti'|'esewa'
  paymentRef    String?
  status        String     // 'pending'|'completed'|'failed'
  createdAt     DateTime   @default(now())

  provider      Provider   @relation(fields: [providerId], references: [id])
  pack          CreditPack @relation(fields: [packId], references: [id])
  @@map("credit_purchases")
}

// Provider credit wallet
model CreditWallet {
  id           String   @id @default(uuid())
  providerId   String   @unique
  balance      Int      @default(0)
  totalEarned  Int      @default(0)
  totalSpent   Int      @default(0)
  updatedAt    DateTime @updatedAt

  provider     Provider @relation(fields: [providerId], references: [id])
  @@map("credit_wallets")
}

// Credit deduction log
model CreditDeduction {
  id          String   @id @default(uuid())
  providerId  String
  amount      Int
  reason      String   // 'boost_booking_accepted'|'featured_slot'
  bookingId   String?
  createdAt   DateTime @default(now())

  provider    Provider @relation(fields: [providerId], references: [id])
  @@map("credit_deductions")
}

// Trust badge catalogue & purchases
model ProviderBadge {
  id           String   @id @default(uuid())
  providerId   String
  badgeType    String   // 'skill_verified'|'background_checked'|'insured'
  status       String   // 'pending'|'active'|'expired'
  verifiedBy   String?  // admin user ID
  expiresAt    DateTime?
  amountNpr    Int
  purchasedAt  DateTime @default(now())

  provider     Provider @relation(fields: [providerId], references: [id])
  @@map("provider_badges")
}
```

### PostgreSQL FTS Index Migration

```sql
ALTER TABLE kb_articles
  ADD COLUMN search_vec TSVECTOR
  GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || content)) STORED;

CREATE INDEX kb_fts_idx ON kb_articles USING GIN(search_vec);
```

---

## 10. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 + TypeScript 5 |
| Framework | Express 4 |
| ORM | Prisma 5 |
| Primary DB | PostgreSQL 16 |
| Cache / Queue | Redis + Bull |
| File Storage | Cloudinary (signed uploads, auto-optimization) |
| LLM — Assistant | Groq API — `llama-3.3-70b-versatile` (streaming SSE) |
| LLM — KYC Vision | Groq API — `llama-3.2-90b-vision-preview` / AWS Textract (OCR) |
| Face Match | AWS Rekognition CompareFaces |
| Content Moderation | Groq API — classifier prompt on `llama-3.1-8b-instant` |
| Embeddings / Reranking | pgvector on PostgreSQL 16 |
| FTS — Assistant RAG | PostgreSQL `tsvector` + `GIN` index |
| Auth | JWT (HttpOnly cookies) + OTP |
| Payments | Khalti · eSewa |
| Notifications | Firebase FCM + Sparrow SMS |
| CI/CD | GitHub Actions |
| Hosting | AWS EC2 / Railway (MVP) |

---

## 11. Non-Functional Requirements

### Performance

| Endpoint Type | p95 Latency Target |
|---|---|
| Standard API (read) | < 200ms |
| Search + AI rerank | < 500ms |
| Assistant first token | < 1.5s |
| KYC AI pipeline | < 2 minutes |
| Credit purchase confirmation | < 3s |

### Security

- All file uploads virus-scanned before storage.
- PII (ID numbers, selfies) stored in Cloudinary private folders — never publicly accessible.
- KYC documents served only via Cloudinary signed delivery URLs (15-minute TTL).
- All admin actions logged with actor ID and timestamp.
- Rate limiting: 100 req/min authenticated · 20 req/min unauthenticated.
- OWASP Top 10 checklist completed before launch.
- Credit purchase webhooks verified via HMAC signature (Khalti/eSewa).

### Availability

- Target uptime: 99.5% (MVP) · 99.9% (post-Series A)
- AI pipeline failures degrade gracefully — KYC falls to human queue, assistant shows "currently unavailable", boost falls back to standard organic ranking.

### Compliance

- GDPR-style data handling: soft delete, data export on request, PII minimization.
- KYC documents purged 90 days after account closure.
- AI decision logs retained 2 years for audit.
- Credit purchase records retained 7 years for financial compliance.

---

## 12. Future Roadmap

### Phase 2 — Month 4–6

- **6.5 Provider AI Copilot** — profile completion coach, rejection explainer, pricing advisor, review translator. Requires > 500 active providers.
- **6.7 Admin Intelligence Panel** — complaint triage AI, platform health monitor, churn prediction. Requires 3+ months data.
- **Trust Badge: Background Checked** — NRN database integration for criminal record checks.
- **Mobile App** — React Native for customer and provider.
- **Credit pack gifting** — admin can grant bonus credits for onboarding incentives.

### Phase 3 — Month 7–12

- Multi-city expansion beyond Kathmandu Valley.
- B2B / Corporate contracts (7.5) — hotel and apartment building packages.
- Provider certification partnerships (CTEVT integration for certificate verification).
- Group bookings (multiple providers for single job — house moves, large events).
- Trust Score portability API — providers take their verified score to partner platforms.
- International expansion track — Stripe integration, USD/INR pricing.

---

*Document maintained by the BishwasSetu Engineering Team.*
*Version history: v1.0 (2026-06-17) — initial release. v2.0 (2026-06-23) — subscription model removed, credit-based boost system added, business model section added as Section 7, database schema extended with credit and badge tables. v2.1 (2026-06-23) — LLM stack updated to Groq API (llama-3.3-70b-versatile for assistant, llama-3.2-90b-vision-preview for KYC vision, llama-3.1-8b-instant for moderation); file storage updated from AWS S3 to Cloudinary (signed uploads, restricted delivery for KYC documents).*

---

## 13. Current Implementation Status & Recommended Next Steps

### 13.1 Feature Status Matrix

| Module / Feature | Status | Priority | Notes / Dependencies |
|---|---|---|---|
| **Multi-Role Auth (JWT & Email OTP)** | Partially Active | High | Works; Needs real SMS provider mapping (Sparrow SMS) in prod |
| **Category & Service CRUD** | Active | High | Base tables and APIs fully functional |
| **Booking Lifecycle / WebSockets** | Active | High | Core requested/accepted/cancelled flow works |
| **KYC Document Upload (Local)** | Active | High | Files saved to local storage; Needs Cloudinary migration |
| **Review & Rating System** | **Missing** | High | Requires database schema updates and controller implementation |
| **Complaint & Resolution System** | **Missing** | High | Empty backend controller; Frontend relies on mock data |
| **Trust Score Engine (Base)** | **Missing** | High | Score recomputation logic & `TrustScoreEvent` model |
| **Database Schema Extensions** | **Missing** | Critical | Need to run prisma migrations for AI, Credits, and Badges |
| **RAG Assistant Engine** | **Missing** | Medium | Needs Groq llama-3.3-70b-versatile + PostgreSQL FTS |
| **Credit-Based Boost Wallet** | **Missing** | Medium | Wallet tracking, Khalti/eSewa webhook integration |
| **Trust Badges Upgrades** | **Missing** | Medium | Badges catalogue, payment checks |
| **AI KYC (OCR & Face Match)** | **Missing** | Low | AWS Rekognition / Textract integration |
| **pgvector Smart Provider Search** | **Missing** | Low | Intent-aware search ranking fallback |

### 13.2 Recommended Next Steps (Work Checklist)

#### Step 1: Update Database Schema & Migrations
Extend `schema.prisma` with all missing models:
- [ ] `KbArticle` and `AssistantSession`
- [ ] `TrustScoreEvent`
- [ ] `KycAiDecision`
- [ ] `ModerationLog`
- [ ] `CreditPack`, `CreditPurchase`, `CreditWallet`, `CreditDeduction`
- [ ] `ProviderBadge`
- [ ] Run `npx prisma migrate dev` to generate client updates and sync with MySQL.

#### Step 2: Implement Reviews & Ratings System
Create the database tables for Reviews if not already in schema (need `Review` schema table linked to provider and booking).
- [ ] Add `Review` model to `schema.prisma` mapping booking, customer, provider, ratings, text, and provider reply.
- [ ] Write `reviewController.ts` endpoints for creation, replies, and list retrieval.
- [ ] Wire up routes in `reviewRoute.ts` and register in `app.ts`.

#### Step 3: Implement Complaints & Resolution System
- [ ] Add `Complaint` model to `schema.prisma` mapping booking, customer, provider, complaint description, type, status, and resolution details.
- [ ] Write `complaintController.ts` logic for users filing and admins managing resolution events.
- [ ] Register routes in `complaintRoute.ts`.
- [ ] Update frontend services and components to replace mock data with active endpoints.

#### Step 4: Core Trust Score Calculation Engine
- [ ] Write utility function `/utils/trustScore.ts` that implements the base formula (Recency-weighted reviews, timeliness, verification status, complaints, etc.).
- [ ] Hook this recalculation logic into the Booking status updates (e.g. COMPLETED or CANCELLED) and Review submissions.
- [ ] Create endpoint `GET /api/providers/:id/trust-score` returning score details and trend logs.

#### Step 5: Credit Wallet & Boost Monetization
- [ ] Seed credit packs.
- [ ] Write wallets and credit deduction endpoints `/api/credits/balance` and payment hooks.