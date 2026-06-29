# BishwasSetu — Product Requirements Document

**Version:** 2.4
**Status:** Active Development
**Classification:** Internal — Engineering & Product
**Last Updated:** 2026-06-28

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
- Not a platform that conflates "identity confirmed" with "skill confirmed" under one ambiguous "Verified" label *(new in v2.3 — see 5.5)*

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
| Skill evidence submission rate *(new)* | > 40% of identity-verified providers submit at least one proof within 30 days |

### Key Performance Indicators

| Metric | Month 3 | Month 6 | Month 12 |
|---|---|---|---|
| Verified providers (identity) | 200 | 1,000 | 3,000 |
| Skill-verified providers *(new)* | 30 | 250 | 1,000 |
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
- **Need:** Book a reliable plumber or electrician with a verifiable quality guarantee — and to clearly understand *what* "verified" actually means before trusting it.
- **Language:** Nepali primary, some English.

### Persona 2 — Rajan (Service Provider)

- **Age:** 34 | **Location:** Lalitpur | **Device:** Basic Android
- **Behavior:** Gets work via word-of-mouth. Has strong skills but no formal way to prove or scale his reputation, and likely has no formal certificate to upload.
- **Need:** Consistent work and a reputation that travels with him — without paying platform fees during slow months, and without being blocked from earning just because he lacks paperwork.
- **Language:** Nepali. Limited English comfort.

### Persona 3 — Admin / Moderator

- **Background:** Platform operations team member.
- **Need:** Clear, AI-assisted queues for KYC review, skill evidence review, complaint resolution, and trust anomaly flags — not raw database tables.

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
│  Shared Infra: MySQL · Redis · Cloudinary · Groq API │
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
- Provider cards: photo, skills, milestone badge, trust score, identity verification badge, boost indicator *(updated — see 5.4)*
- Provider profile detail: trust score breakdown, milestone badge, identity & skill verification status, reviews, availability calendar, "Book Service" CTA

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
- Providers with `identityStatus` ≠ `VERIFIED` cannot accept bookings — enforced at middleware, not just UI. *(Booking gate is tied to identity verification only — see 5.5.)*

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
- Milestone badge display *(replaces standalone "Experience Badge" — see 5.4)*
- Identity Verified indicator and Skill Verified indicator shown as **two distinct, separately labeled badges** — never merged into a single ambiguous "Verified" badge *(rule from v2.3)*. Skill Verified further distinguishes **Tier 1 ("Skill evidence submitted")** from **Tier 2 ("Skill Verified — Issuer Confirmed")** — the platform never implies institutional confirmation it hasn't actually performed *(refined, v2.4 — see 6.2.1)*
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

> Providers **CANNOT** accept bookings until `identityStatus` is `VERIFIED`. Enforced at middleware — any attempt returns `403 Forbidden`. Skill verification is **not** a booking gate — it is an additive trust signal layered on top, so providers without certificates or formal proof (the common case in Nepal's informal trades) are never blocked from earning a living.

#### Identity Verification Status *(renamed from "Onboarding Status" — formerly conflated identity + skill)*

| Status | Description |
|---|---|
| `INCOMPLETE` | Profile fields not filled |
| `PENDING_DOCUMENTS` | Professional info saved, documents not uploaded |
| `UNDER_REVIEW` | Submitted, awaiting AI + human review |
| `VERIFIED` | Full booking access unlocked |
| `REJECTED` | Rejection reason shown with re-submission option |

#### Skill Verification Status *(new, v2.3 — parallel, non-blocking track)*

| Status | Description |
|---|---|
| `UNVERIFIED` | No skill evidence submitted yet |
| `SELF_DECLARED` | Provider has stated years/skills but submitted no supporting evidence |
| `PENDING_REVIEW` | Evidence (certificate, work photos, reference) submitted, awaiting admin review |
| `VERIFIED` | Evidence reviewed and approved — or paid Skill Verified badge (7.4) approved |

> **Why two tracks:** Identity KYC (6.2) proves a provider is a real, identifiable person. It does **not** prove competence. Skill verification is the separate claim that a provider can actually do the job — built from uploaded evidence, admin review, and ultimately reinforced by real completed-booking history (see Milestone Badge below). Collapsing these into one "VERIFIED" status overstates what identity KYC actually checks and risks misleading customers like Maya.

#### Provider Professional Information

Fields: Legal name · Phone & email · Service categories & skills · Years of experience (self-reported, displayed as plain text, never as a badge on its own — see Milestone Badge) · Service description · Service area (district/zone) · Availability schedule

#### Milestone Badge Logic *(replaces the old self-reported Experience Badge)*

The previous Experience Badge (New / Experienced / Expert) was based solely on self-reported years, which is unverifiable and collapses all providers with 2+ years into a single "Expert" tier regardless of actual platform performance. It is replaced with a **platform-verified milestone badge** derived from real, unforgeable booking and trust data:

| Badge | Nepali | Condition |
|---|---|---|
| New | नविन (Navin) | < 5 completed bookings |
| Established | स्थापित (Sthapit) | 5–49 completed bookings |
| Trusted Pro | विश्वसनीय (Vishwasniya) | 50–199 completed bookings AND trust score > 70 |
| Master Provider | निपुण (Nipun) | 200+ completed bookings AND trust score > 80 |

- Self-reported years of experience remains visible on the profile as plain text (e.g., "12 years in trade — self-reported") but is **never** rendered as a badge graphic, to avoid implying platform verification it doesn't have.
- Milestone badge recomputes on every booking completion alongside trust score recompute (8.1 / 6.1 trigger).
- This directly addresses the gap where a 3-year provider and a 20-year provider previously looked identical under "Expert" — ranking now reflects actual proven performance on the platform.

#### Provider Dashboard (Identity-Verified Only)

- Trust score overview with trend graph
- Milestone badge progress (e.g., "12 bookings to Trusted Pro")
- Skill verification status + "Submit evidence" CTA if `UNVERIFIED` or `SELF_DECLARED`
- Credit balance widget (current credits, pack recharge CTA)
- Incoming booking requests (accept / reject)
- Earnings summary + commission breakdown
- Identity & skill verification badge display
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

**Step 2 — Identity Document Upload**

| Document | Required |
|---|---|
| Government-issued ID (Citizenship / Passport) | Yes |
| Profile photo (selfie) | Yes |

Files uploaded to Cloudinary via signed upload URLs. Max 5 MB. Formats: JPG, PNG, PDF. KYC documents stored in a private, restricted Cloudinary folder — accessible only via signed delivery URLs.

> This step determines `identityStatus` only. It is the **booking-access gate** (5.4).

**Step 3 — Identity Verification Status**

- Status badge display
- Admin feedback (REJECTED only)
- Re-upload button (REJECTED only)

**Step 4 — Skill Evidence (Optional, non-blocking)** *(new, v2.3)*

| Evidence type | Examples |
|---|---|
| Certificate | Trade school, CTEVT, vendor training certificate |
| Work photos | Before/after photos of past jobs |
| Reference | Name + phone of a past customer/employer |

- Entirely optional — skipping this step has **no effect** on booking access.
- Skipping leaves `skillStatus` at `SELF_DECLARED` (if years/skills were filled in Step 1) or `UNVERIFIED`.
- Submitted evidence enters the **Skill Evidence Review Queue** (new, see 5.11) — separate from the identity KYC queue.
- Approved evidence sets `skillStatus = VERIFIED`, displays a distinct "Skill Verified" badge, and contributes to trust score under Verification Completeness (5.8).
- Providers can return and submit evidence at any time after initial onboarding — not limited to first-time KYC.

**Post-Submission Behavior**

- Redirect to read-only dashboard until `identityStatus = VERIFIED`
- Booking functionality disabled until `identityStatus = VERIFIED` (skill status has no effect on this gate)
- Trust score displays as "Pending" until identity verification completes

**Endpoints**

```
POST /api/providers/kyc/upload
GET  /api/providers/kyc/status
POST /api/providers/skill-evidence/upload
GET  /api/providers/me/skill-evidence
GET  /api/admin/providers/kyc
PUT  /api/admin/providers/kyc/:id/approve
PUT  /api/admin/providers/kyc/:id/reject
```

---

### 5.6 Service Discovery & Advanced Search

**Filter parameters:** category · lat/lng + radius · trust score min/max · identity verification status · skill verification status · availability date

**Sorting:** Trust score (default organic) · Distance · Price · Milestone badge · AI-ranked (with boost layer)

With AI active (6.3), results are re-ranked by semantic intent before returning. Boost credits add a secondary featured layer — disclosed to customers and never overriding organic trust-score ranking.

**Endpoints**

```
GET /api/providers?category=&lat=&lng=&radius=&trust_min=&skill_status=&sort=
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

- Only providers with `identityStatus = VERIFIED` can transition `REQUESTED → ACCEPTED`.
- Customers can cancel up to 2 hours before scheduled time.
- 48-hour review window opens after `COMPLETED`.
- Providers rejecting > 30% of bookings over 30 days receive a trust score penalty.
- New providers (trust score < 40): first 3 bookings require manual completion confirmation from customer (Risk-Adaptive Booking — see 6.6).
- Commission deducted automatically from provider payout on `COMPLETED`.
- Every `COMPLETED` booking triggers a milestone badge recompute (5.4) alongside the existing trust score recompute (6.1).

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
| Verification completeness (identity + skill) | 10% |
| Community vouches | 10% |

> Verification completeness now factors in **both** `identityStatus = VERIFIED` and `skillStatus = VERIFIED` — a provider with both verified earns a higher completeness score than identity-only, reflecting the stronger trust claim.

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

**KYC Review Queue (Identity)**

- Paginated pending KYC list
- Document viewer (ID, selfie)
- AI summary panel: confidence score, extracted fields, face match result, risk flag
- One-click approve / reject with required rejection reason

**Skill Evidence Review Queue** *(new, v2.3 — separate from identity KYC queue)*

- Paginated pending skill evidence list (certificate / work photos / reference)
- Evidence viewer
- One-click approve / reject with required rejection reason
- Approval sets `skillStatus = VERIFIED` and triggers trust score recompute (5.8)
- Paid Skill Verified badge purchases (7.4) route into this same queue with priority flag

**Complaint Review Page**

- Complaint detail + chat timeline
- Resolution actions: refund · provider warning · suspension · account ban
- AI-generated triage classification

**Admin Dashboard**

- User & provider management (search, filter by identity status / skill status / category / trust score)
- Trust score audit log
- Platform analytics (bookings by category/zone, trust score distribution, milestone badge distribution)
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
GET  /api/admin/providers/skill-evidence
PUT  /api/admin/providers/skill-evidence/:id/approve
PUT  /api/admin/providers/skill-evidence/:id/reject
```

---

### 5.12 Notifications & Payments

**Notification Channels:** In-app · Push (Firebase FCM) · SMS (Sparrow SMS)

**Notification Events:** Booking request received · Booking accepted/rejected · Job completed · Review received · Identity KYC status update · Skill evidence status update · Milestone badge earned · Complaint resolved · Credit balance low (10 credits remaining)

**Payment Methods:** Khalti · eSewa · Cash-on-completion

**Payment flows:**

- Commission deducted from provider payout on booking completion — customer never sees platform fees.
- Credit pack purchases: Khalti or eSewa, instant credit top-up on payment confirmation.
- Trust badge purchases: one-time payment, badge activated on admin verification (routes through Skill Evidence Review Queue for skill-related badges).
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

**Milestone Badge Recompute** *(new, v2.3)* — triggered on every booking completion alongside trust score recompute; re-evaluates badge tier per thresholds in 5.4.

**Endpoints**

```
GET  /api/providers/:id/trust-score
     Response: { score, breakdown, ai_signals, anomaly_flag, last_computed, milestone_badge }

POST /api/internal/trust/recompute/:id
     Triggered by: review, complaint, vouch, booking, decay job

GET  /api/admin/trust/anomalies
```

---

### 6.2 AI KYC Verification (Identity)

**Status:** Active (MVP)

**Purpose:** Reduce **identity** KYC approval time from hours to minutes for clear-cut cases. *(Scope clarified, v2.3 — this pipeline verifies identity only, not professional skill. See 6.2.1 for the separate skill evidence pipeline.)*

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
  Confidence ≥ 85% + no flags  →  AUTO-APPROVE (sets identityStatus = VERIFIED)
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

### 6.2.1 AI Skill Evidence Review *(updated, v2.4 — two-tier authenticity model)*

**Status:** Active (MVP) — lightweight, mostly human-reviewed at launch

**Purpose:** Provide a first-pass quality and plausibility check on submitted skill evidence (certificates, work photos, references) before it reaches the admin queue — without claiming to assess actual trade competence, which AI cannot reliably do from a photo.

#### Why this is harder than identity KYC

Identity KYC (6.2) can auto-approve because forgery detection on a government ID is checking *image-level tampering* — a well-defined, narrow problem. Skill evidence forgery is a different and harder problem: a certificate can be a perfectly clean, untampered image of something that was simply **never issued by the institution it names** — including certificates generated or fabricated using AI image/document tools, which leave no editing artifacts to detect. EXIF analysis, compression-artifact checks, and OCR field-matching (the same techniques used for identity documents) **cannot prove a certificate is genuine** — they can only fail to catch *obvious* fakes. AI-generation detectors exist but lag behind generation tools and are advisory at best, never proof.

Because of this, skill evidence authenticity is modeled in two distinct tiers, with the system never overstating which tier a given piece of evidence has reached.

#### Authenticity Tiers

| Tier | Label shown to customers | What it means | How it's established |
|---|---|---|---|
| **Tier 1 — Reviewed** | "Skill evidence submitted" | A document/photo was submitted and passed AI pre-check + human visual review. Confirms the document is *not obviously fake* — does **not** confirm it was genuinely issued. | AI pre-check (below) + admin visual review |
| **Tier 2 — Issuer-Confirmed** | "Skill Verified — Issuer Confirmed" | The certificate number was cross-checked against the issuing institution's own records. This is the only tier that constitutes a real authenticity guarantee. | Certificate number/QR lookup against issuer API or manual institutional confirmation (CTEVT etc. — Phase 3, Section 12) |

> At MVP, only **Tier 1** is achievable for most categories, since issuer integrations (CTEVT, vendor training bodies) don't yet exist. The platform must never display Tier 1 evidence with language implying institutional confirmation. `skillStatus = VERIFIED` at MVP always means Tier 1 unless `issuerVerified = true` is also set.

#### Pipeline

```
Evidence Upload (Cloudinary — private folder)
        ↓
Document type classification (certificate / work photo / reference)
        ↓
  Certificate → OCR (AWS Textract) + field extraction (issuer name, cert number, date)
                + EXIF/compression forgery check (catches edited/screenshotted fakes only)
                + AI-image-generation flag (Groq vision — advisory signal, NOT proof)
  Work photo  → image quality + duplicate/stock-photo detection across all submissions
  Reference   → format validation only (name + phone present)
        ↓
ALWAYS routes to Skill Evidence Review Queue (5.11) for human admin decision
        ↓
Admin approve/reject → sets skillStatus + tier (Tier 1 by default)
        ↓
[Phase 3] If issuer database/API available for that institution →
  Certificate number lookup → issuerVerified = true → Tier 2 badge unlocked
```

> There is **no auto-approve path** for skill evidence at MVP — even a clean AI pre-check always routes to a human. AI flags (duplicate certs, stock photos, generation artifacts) are advisory signals that help the admin prioritize and scrutinize, never an approval mechanism. This claim is too consequential, and too easy to fake convincingly with modern AI tools, to automate fully on day one.

**Endpoints**

```
POST /api/providers/skill-evidence/upload
GET  /api/providers/me/skill-evidence
GET  /api/admin/providers/skill-evidence
PUT  /api/admin/providers/skill-evidence/:id/approve
PUT  /api/admin/providers/skill-evidence/:id/reject
POST /api/admin/providers/skill-evidence/:id/issuer-verify   (Phase 3 — sets issuerVerified)
```

**Implementation:** Reuses Cloudinary signed-upload pattern from 6.2 · OCR via AWS Textract for certificates · Groq vision model for stock-photo/duplicate/AI-generation-artifact flagging on work photos and certificates · Bull queue on Redis · SLA: AI pre-check < 2 min, admin decision < 24 hours.

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

**Implementation:** Provider embeddings stored as `JSON` column in MySQL · cosine similarity computed in application layer (Node.js) at search time · embeddings updated on profile edit via background job · target < 150ms p95 at MVP scale (upgrade to dedicated vector store post-Series A if needed).

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
Retrieval — MySQL FULLTEXT Search (vectorless)
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

MySQL native `FULLTEXT` index — no separate vector database required at MVP scale.

**Knowledge base structure:**

```sql
CREATE TABLE kb_articles (
  id          CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
  category    VARCHAR(50)   NOT NULL,  -- 'policy'|'faq'|'provider_info'|'booking_guide'|'credits'
  title       VARCHAR(500)  NOT NULL,
  content     TEXT          NOT NULL,
  lang        VARCHAR(5)    NOT NULL DEFAULT 'ne',  -- 'ne' | 'en'
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT idx_fts (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Retrieval query:**

```sql
SELECT id, title, content,
       MATCH(title, content) AGAINST (? IN NATURAL LANGUAGE MODE) AS relevance
FROM kb_articles
WHERE MATCH(title, content) AGAINST (? IN NATURAL LANGUAGE MODE)
  AND lang = ?
ORDER BY relevance DESC
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
| Identity vs. skill verification *(new)* | KB article explaining the difference, provider's own current status |
| General (Nepali) | Translated KB chunks; response in Nepali |

#### UI Placement

Not a standalone chatbot page. Contextual widget:

- Booking flow: appears after 30s inactivity on a step
- Provider profile page: "Compare or ask about this provider"
- Complaint page: structured complaint intake guide
- Provider dashboard: booking, profile, credits, and skill evidence questions
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

**Implementation:** Groq API `llama-3.3-70b-versatile` streaming · MySQL FULLTEXT search · Redis session (TTL 30 min) · KB managed via admin panel, no engineer needed for content updates.

---

### 6.5 Provider AI Copilot *(Future — Phase 2)*

**Status:** Planned. Not in MVP scope.

Planned sub-features: profile completion coach · rejection explainer · pricing advisor · review translator (Nepali ↔ English) · skill evidence coach (suggests what proof to upload based on category).

**Dependency:** Requires > 500 active providers for pricing benchmarks to be meaningful. Rejection explainer can ship earlier as a template-based feature.

---

### 6.6 Fraud & Moderation AI

**Status:** Active (MVP)

**Purpose:** Platform integrity at scale without a large moderation headcount.

**Fake Review Detector** — graph analysis on review timing + account relationships. Ring detection (A→B, B's network→C, C→A within 72 hours) flags all accounts. Graph-based, not just text-based.

**Coordinated Fraud Signal** — device fingerprint + IP clustering detects multiple accounts from the same location. Admin alert triggered. No auto-ban (false positive risk in shared-WiFi environments).

**Harmful Content Filter** — review text, complaint descriptions, and provider service descriptions pass through content moderation classifier at write time. Slurs, doxxing, threatening language caught before storage.

**Skill Evidence Authenticity Check** *(new, v2.3)* — stock-photo and duplicate-certificate detection feeding into the Skill Evidence Review Queue (6.2.1). Flags, never auto-rejects — final decision is always human.

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
| Identity verified | Free | Included in base identity KYC (6.2) |
| Skill verified | NPR 199 | Routes through Skill Evidence Review Queue (5.11 / 6.2.1) — AI pre-check + admin review of work samples or certificate |
| Background checked | NPR 499 | Criminal record check *(Phase 2 — NRN database integration)* |
| Insured | NPR 299/year | Provider uploads insurance document; platform displays insurance status |

> **Note (v2.3):** A paid Skill Verified purchase does **not** bypass review — it grants priority queue placement only. The underlying `skillStatus` field and review outcome are identical whether the evidence came in free (5.5 Step 4) or paid — payment buys speed, not approval.

> **Note (v2.4):** Skill Verified has two authenticity tiers (6.2.1). At MVP, a paid purchase typically only achieves **Tier 1** ("evidence submitted and reviewed") since most institutions lack issuer-lookup integration yet. The badge UI must show which tier was reached — paying for priority review never upgrades the tier itself; only an actual issuer confirmation (Phase 3) does.

**Provider motivation:** A "Skill verified" badge boosts trust score (via Verification Completeness, 5.8) and search ranking — it pays for itself in the first additional booking it generates.

**Customer impact:** "Background checked" directly addresses the primary trust barrier for high-value bookings (renovation, home access). This is a real, verifiable claim — not a star rating.

**Revenue characteristics:** One-time purchases with high margins (no variable cost beyond admin review time, which AI assists at scale). "Insured" badge is annual recurring — providers who let it lapse lose the badge publicly, creating strong renewal motivation.

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
| Paid bypass of skill evidence review *(new, v2.3)* | Payment may buy priority queue placement, never approval — guarantees the "Skill Verified" claim stays meaningful |

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

Providers who invest in quality (earn high trust score, submit skill evidence, climb milestone tiers) pay fewer credits to win the same bookings because their organic ranking is already strong. Quality and revenue alignment is structural — not an accident of pricing.

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
    "message": "Provider must complete identity KYC verification before accepting bookings.",
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

── IDENTITY KYC ──────────────────────────────────────────────
POST   /api/providers/profile/complete
POST   /api/providers/kyc/upload
GET    /api/providers/kyc/status

── SKILL EVIDENCE ────────────────────────────────────────────
POST   /api/providers/skill-evidence/upload
GET    /api/providers/me/skill-evidence

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
GET    /api/admin/providers/skill-evidence
PUT    /api/admin/providers/skill-evidence/:id/approve
PUT    /api/admin/providers/skill-evidence/:id/reject
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

### Prisma Datasource (MySQL)

```prisma
// schema.prisma — datasource block
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
// DATABASE_URL format:
// mysql://USER:PASSWORD@HOST:3306/bishwassetu?charset=utf8mb4
```

### Provider Core Fields *(updated, v2.3 — identity/skill split + milestone tracking)*

```prisma
model Provider {
  id                  String   @id @default(uuid()) @db.Char(36)
  userId              String   @unique @db.Char(36)

  // Identity verification track — this is the booking-access gate
  identityStatus      String   @default("INCOMPLETE") @db.VarChar(20)
  // INCOMPLETE | PENDING_DOCUMENTS | UNDER_REVIEW | VERIFIED | REJECTED

  // Skill verification track — additive trust signal, never a booking gate
  skillStatus         String   @default("UNVERIFIED") @db.VarChar(20)
  // UNVERIFIED | SELF_DECLARED | PENDING_REVIEW | VERIFIED

  canAcceptBookings   Boolean  @default(false)
  // derived/enforced from identityStatus == VERIFIED only

  yearsExperience     Int?     // self-reported, displayed as plain text only — never badged alone
  completedBookings   Int      @default(0)
  trustScore          Float    @default(0) @db.Float

  milestoneBadge      String   @default("NEW") @db.VarChar(20)
  // NEW | ESTABLISHED | TRUSTED_PRO | MASTER_PROVIDER — recomputed on booking completion

  // ... other existing fields (category, area, availability, etc.) ...

  skillEvidence       SkillEvidence[]
  badges              ProviderBadge[]
  trustScoreEvents     TrustScoreEvent[]
  kycAiDecisions       KycAiDecision[]
  creditWallet         CreditWallet?
  creditPurchases      CreditPurchase[]
  creditDeductions     CreditDeduction[]

  @@map("providers")
}
```

### Skill Evidence Table *(updated, v2.4 — added two-tier authenticity fields)*

```prisma
model SkillEvidence {
  id              String   @id @default(uuid()) @db.Char(36)
  providerId      String   @db.Char(36)
  type            String   @db.VarChar(20)   // 'certificate'|'work_photo'|'reference'
  fileUrl         String   @db.VarChar(500)  // Cloudinary signed URL (private folder)
  certNumber      String?  @db.VarChar(100)  // extracted via OCR, used for issuer lookup (Phase 3)
  issuerName      String?  @db.VarChar(200)  // extracted via OCR
  aiPrecheck      Json?    // { documentType, ocrResult?, duplicateFlag?, stockPhotoFlag?, aiGeneratedFlag? }
  reviewStatus    String   @default("PENDING") @db.VarChar(20)
  // PENDING | APPROVED | REJECTED
  authenticityTier String  @default("NONE") @db.VarChar(10)
  // NONE | TIER_1 | TIER_2 — TIER_1 set on admin approval, TIER_2 only via issuer verification
  issuerVerified  Boolean  @default(false)
  // true only when certNumber confirmed against issuing institution's own records (Phase 3)
  issuerVerifiedAt DateTime?
  rejectReason    String?  @db.VarChar(500)
  reviewedBy      String?  @db.Char(36)      // admin user ID
  isPaidBadge     Boolean  @default(false)   // true if submitted via paid Skill Verified badge purchase (7.4)
  createdAt       DateTime @default(now())
  reviewedAt      DateTime?

  provider        Provider @relation(fields: [providerId], references: [id])
  @@map("skill_evidence")
}
```

> **Note:** `reviewStatus = APPROVED` alone only ever implies `authenticityTier = TIER_1` ("not obviously fake, human-reviewed"). The system must never render Tier 1 evidence with language suggesting institutional confirmation. Only `issuerVerified = true` unlocks the "Issuer Confirmed" customer-facing label (see 6.2.1).

### Core AI & Assistant Tables

```prisma
// Knowledge base for RAG assistant
// FULLTEXT index applied via raw SQL migration (see below)
model KbArticle {
  id         String   @id @default(uuid()) @db.Char(36)
  category   String   @db.VarChar(50)  // 'policy'|'faq'|'provider_info'|'booking_guide'|'credits'
  title      String   @db.VarChar(500)
  content    String   @db.Text
  lang       String   @default("ne") @db.VarChar(5)  // 'ne' | 'en'
  updatedAt  DateTime @updatedAt

  @@map("kb_articles")
}

// Assistant session log
model AssistantSession {
  id          String   @id @default(uuid()) @db.Char(36)
  userId      String?  @db.Char(36)
  sessionId   String   @unique @db.VarChar(100)
  contextType String?  @db.VarChar(50)
  contextId   String?  @db.Char(36)
  messages    Json     // [{ role, content, retrieved_chunks }]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("assistant_sessions")
}

// Trust score event log
model TrustScoreEvent {
  id         String   @id @default(uuid()) @db.Char(36)
  providerId String   @db.Char(36)
  score      Float    @db.Float
  prevScore  Float    @db.Float
  trigger    String   @db.VarChar(50)  // 'review'|'complaint'|'vouch'|'decay'|'booking'
  inputs     Json     // full breakdown snapshot
  aiFlags    Json?
  modelVer   String?  @db.VarChar(50)
  createdAt  DateTime @default(now())

  provider   Provider @relation(fields: [providerId], references: [id])
  @@map("trust_score_events")
}

// KYC AI decision log (identity only)
model KycAiDecision {
  id            String   @id @default(uuid()) @db.Char(36)
  providerId    String   @db.Char(36)
  ocrResult     Json
  faceScore     Float?   @db.Float
  forgeryRisk   String   @db.VarChar(10)   // 'low'|'medium'|'high'
  confidence    Float    @db.Float
  decision      String   @db.VarChar(20)   // 'AUTO_APPROVE'|'HUMAN_QUEUE'
  adminOverride String?  @db.VarChar(10)   // 'APPROVE'|'REJECT'
  modelVer      String   @db.VarChar(50)
  createdAt     DateTime @default(now())

  provider      Provider @relation(fields: [providerId], references: [id])
  @@map("kyc_ai_decisions")
}

// Content moderation log
model ModerationLog {
  id         String   @id @default(uuid()) @db.Char(36)
  entityType String   @db.VarChar(20)  // 'review'|'complaint'|'profile'|'skill_evidence'
  entityId   String   @db.Char(36)
  result     String   @db.VarChar(10)  // 'PASSED'|'FLAGGED'
  category   String?  @db.VarChar(50)
  confidence Float    @db.Float
  createdAt  DateTime @default(now())

  @@map("moderation_logs")
}
```

### Credit & Boost Tables

```prisma
// Credit packs catalogue
model CreditPack {
  id        String    @id @default(uuid()) @db.Char(36)
  name      String    @db.VarChar(20)   // 'starter'|'active'|'pro'
  credits   Int
  priceNpr  Int
  features  Json      // array of feature strings
  isActive  Boolean   @default(true)
  purchases CreditPurchase[]

  @@map("credit_packs")
}

// Credit purchase records
model CreditPurchase {
  id            String     @id @default(uuid()) @db.Char(36)
  providerId    String     @db.Char(36)
  packId        String     @db.Char(36)
  creditsAdded  Int
  amountNpr     Int
  paymentMethod String     @db.VarChar(10)   // 'khalti'|'esewa'
  paymentRef    String?    @db.VarChar(100)
  status        String     @db.VarChar(10)   // 'pending'|'completed'|'failed'
  createdAt     DateTime   @default(now())

  provider      Provider   @relation(fields: [providerId], references: [id])
  pack          CreditPack @relation(fields: [packId], references: [id])
  @@map("credit_purchases")
}

// Provider credit wallet
model CreditWallet {
  id          String   @id @default(uuid()) @db.Char(36)
  providerId  String   @unique @db.Char(36)
  balance     Int      @default(0)
  totalEarned Int      @default(0)
  totalSpent  Int      @default(0)
  updatedAt   DateTime @updatedAt

  provider    Provider @relation(fields: [providerId], references: [id])
  @@map("credit_wallets")
}

// Credit deduction log
model CreditDeduction {
  id         String   @id @default(uuid()) @db.Char(36)
  providerId String   @db.Char(36)
  amount     Int
  reason     String   @db.VarChar(50)   // 'boost_booking_accepted'|'featured_slot'
  bookingId  String?  @db.Char(36)
  createdAt  DateTime @default(now())

  provider   Provider @relation(fields: [providerId], references: [id])
  @@map("credit_deductions")
}

// Trust badge purchases
model ProviderBadge {
  id          String    @id @default(uuid()) @db.Char(36)
  providerId  String    @db.Char(36)
  badgeType   String    @db.VarChar(30)   // 'skill_verified'|'background_checked'|'insured'
  status      String    @db.VarChar(10)   // 'pending'|'active'|'expired'
  verifiedBy  String?   @db.Char(36)      // admin user ID
  expiresAt   DateTime?
  amountNpr   Int
  purchasedAt DateTime  @default(now())

  provider    Provider  @relation(fields: [providerId], references: [id])
  @@map("provider_badges")
}
```

### MySQL FULLTEXT Index Migration

Prisma does not support `FULLTEXT` indexes natively for MySQL. Apply via a raw SQL migration file:

```sql
-- migrations/add_kb_fulltext_index.sql
-- Run after prisma migrate deploy

ALTER TABLE kb_articles
  ADD FULLTEXT INDEX idx_fts (title, content);
```

Add to your `package.json` post-migrate hook or run manually once after the initial migration:

```bash
mysql -u root -p bishwassetu < migrations/add_kb_fulltext_index.sql
```

> **Note:** MySQL `FULLTEXT` requires `ENGINE=InnoDB` and `utf8mb4` charset — both enforced in the Prisma datasource configuration above. Minimum word length for indexing defaults to 3 characters in MySQL; set `ft_min_word_len=2` in `my.cnf` if Nepali short words are not being indexed.

---

## 10. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 + TypeScript 5 |
| Framework | Express 4 |
| ORM | Prisma 5 (MySQL provider) |
| Primary DB | MySQL 8.0 (utf8mb4, InnoDB) |
| Cache / Queue | Redis + Bull |
| File Storage | Cloudinary (signed uploads, restricted delivery for KYC + skill evidence) |
| LLM — Assistant | Groq API — `llama-3.3-70b-versatile` (streaming SSE) |
| LLM — KYC Vision | Groq API — `llama-3.2-90b-vision-preview` / AWS Textract (OCR) |
| Face Match | AWS Rekognition CompareFaces |
| Content Moderation | Groq API — classifier prompt on `llama-3.1-8b-instant` |
| Embeddings / Reranking | JSON column in MySQL + cosine similarity in Node.js app layer |
| FTS — Assistant RAG | MySQL `FULLTEXT` index (InnoDB, utf8mb4) |
| Auth | JWT (HttpOnly cookies) + OTP |
| Payments | Khalti · eSewa |
| Notifications | Firebase FCM + Sparrow SMS |
| CI/CD | GitHub Actions |
| Hosting | Railway (MVP) |

---

## 11. Non-Functional Requirements

### Performance

| Endpoint Type | p95 Latency Target |
|---|---|
| Standard API (read) | < 200ms |
| Search + AI rerank | < 500ms |
| Assistant first token | < 1.5s |
| Identity KYC AI pipeline | < 2 minutes |
| Skill evidence AI pre-check | < 2 minutes |
| Credit purchase confirmation | < 3s |

### Security

- All file uploads (identity documents and skill evidence) virus-scanned before storage.
- PII (ID numbers, selfies) stored in Cloudinary private folders — never publicly accessible.
- Identity KYC documents served only via Cloudinary signed delivery URLs (15-minute TTL).
- Skill evidence files served only via Cloudinary signed delivery URLs (15-minute TTL) — same restricted-access pattern as identity documents.
- All admin actions logged with actor ID and timestamp.
- Rate limiting: 100 req/min authenticated · 20 req/min unauthenticated.
- OWASP Top 10 checklist completed before launch.
- Credit purchase webhooks verified via HMAC signature (Khalti/eSewa).

### Availability

- Target uptime: 99.5% (MVP) · 99.9% (post-Series A)
- AI pipeline failures degrade gracefully — identity KYC falls to human queue, skill evidence pre-check failure routes straight to human review with no flag, assistant shows "currently unavailable", boost falls back to standard organic ranking.

### Compliance

- GDPR-style data handling: soft delete, data export on request, PII minimization.
- Identity KYC documents purged 90 days after account closure.
- Skill evidence files purged 90 days after account closure (same retention policy as identity documents).
- AI decision logs retained 2 years for audit.
- Credit purchase records retained 7 years for financial compliance.

---

## 12. Future Roadmap

### Phase 2 — Month 4–6

- **6.5 Provider AI Copilot** — profile completion coach, rejection explainer, pricing advisor, review translator, skill evidence coach. Requires > 500 active providers.
- **6.7 Admin Intelligence Panel** — complaint triage AI, platform health monitor, churn prediction. Requires 3+ months data.
- **Trust Badge: Background Checked** — NRN database integration for criminal record checks.
- **Skill Evidence AI auto-approve path** — once enough admin-reviewed evidence exists to train a confidence threshold, introduce a conservative auto-approve tier (mirroring identity KYC's 6.2 design) for unambiguous cases only. This would still only ever produce Tier 1 evidence (6.2.1) — auto-approval is about review speed, not authenticity tier.
- **Mobile App** — React Native for customer and provider.
- **Credit pack gifting** — admin can grant bonus credits for onboarding incentives.

### Phase 3 — Month 7–12

- Multi-city expansion beyond Kathmandu Valley.
- B2B / Corporate contracts (7.5) — hotel and apartment building packages.
- Provider certification partnerships (CTEVT integration for certificate verification — feeds directly into Skill Evidence pipeline). **This is the mechanism that unlocks Tier 2 ("Issuer Confirmed") skill verification described in 6.2.1** — certificate numbers are cross-checked against CTEVT's own records rather than relying on document-image analysis alone.
- Group bookings (multiple providers for single job — house moves, large events).
- Trust Score portability API — providers take their verified score (and milestone badge history) to partner platforms.
- International expansion track — Stripe integration, USD/INR pricing.

---

*Document maintained by the BishwasSetu Engineering Team.*

*Version history: v1.0 (2026-06-17) — initial release. v2.0 (2026-06-23) — subscription model removed, credit-based boost system added, business model section added as Section 7, database schema extended with credit and badge tables. v2.1 (2026-06-23) — LLM stack updated to Groq API; file storage updated to Cloudinary. v2.2 (2026-06-23) — database updated from PostgreSQL 16 to MySQL 8.0 with Prisma MySQL provider; all schema types updated with MySQL-compatible `@db` annotations; PostgreSQL-specific FTS (`tsvector`/`GIN`) replaced with MySQL `FULLTEXT` index; pgvector replaced with JSON column + app-layer cosine similarity. v2.3 (2026-06-28) — replaced self-reported Experience Badge with platform-verified Milestone Badge system (New/Established/Trusted Pro/Master Provider) based on completed bookings + trust score; split provider verification into two independent, non-blocking tracks — Identity Verification (booking-access gate, unchanged KYC pipeline) and Skill Verification (additive trust signal via new Skill Evidence Review Queue); added `SkillEvidence` table and skill-evidence-related endpoints, AI pre-check pipeline (6.2.1), and admin queue; clarified that paid Skill Verified badge purchases grant review priority only, never bypass approval; updated trust score Verification Completeness signal, NFR retention/security policies, and roadmap to reflect the split. **v2.4 (2026-06-28) — introduced two-tier skill evidence authenticity model (6.2.1): Tier 1 ("Reviewed" — AI pre-check + human visual review, cannot prove genuine issuance) vs. Tier 2 ("Issuer Confirmed" — certificate number cross-checked against issuing institution's records, Phase 3/CTEVT integration); explicitly documented that EXIF/compression forgery checks and AI-generation-artifact detection are advisory signals only and cannot prove a certificate is genuine, since AI-generated and well-made fakes leave no detectable editing trace; added `certNumber`, `issuerName`, `authenticityTier`, `issuerVerified`, `issuerVerifiedAt` fields to `SkillEvidence` schema; added issuer-verify admin endpoint; updated customer-facing badge display rule (5.3), paid badge note (7.4), and roadmap (12) so the platform never implies institutional confirmation it hasn't actually performed.***