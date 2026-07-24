# GharSewa Nepal — UI/UX Design Specification (v1.0)

**Companion to:** PRD v2.0 (July 2026)
**Status:** Production-Ready Design Blueprint
**Platforms:** Mobile-first Web App (PWA) · Admin Web Dashboard
**Design Philosophy:** Trust-first, friction-right, low-bandwidth resilient

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Design System (Foundations)](#2-design-system-foundations)
3. [Component Library](#3-component-library)
4. [Information Architecture & Navigation](#4-information-architecture--navigation)
5. [Customer Experience — Screen Specs](#5-customer-experience--screen-specs)
6. [Provider Experience — Screen Specs](#6-provider-experience--screen-specs)
7. [Tiered KYC Onboarding Flow (UX)](#7-tiered-kyc-onboarding-flow-ux)
8. [Trust Score & Badge UI System](#8-trust-score--badge-ui-system)
9. [Booking, Escrow & Payment UX](#9-booking-escrow--payment-ux)
10. [Emergency Dispatch Mode UX](#10-emergency-dispatch-mode-ux)
11. [AI/RAG Assistant UX](#11-airag-assistant-ux)
12. [Admin Dashboard — Anti-Fraud Review UX](#12-admin-dashboard--anti-fraud-review-ux)
13. [Notifications & SMS Fallback UX](#13-notifications--sms-fallback-ux)
14. [Localization (Nepali/English)](#14-localization-nepalienglish)
15. [Accessibility Standards](#15-accessibility-standards)
16. [Performance & Low-Bandwidth UX](#16-performance--low-bandwidth-ux)
17. [Empty, Loading & Error States](#17-empty-loading--error-states)
18. [UX Metrics & Instrumentation](#18-ux-metrics--instrumentation)

---

## 1. Design Principles

| # | Principle | What It Means in Practice |
|---|-----------|---------------------------|
| P1 | **Trust is visible, not implied** | Trust scores, badges, and verification tiers are always shown at decision points (cards, profiles, booking confirmation) — never buried in a details page |
| P2 | **Friction-right, not friction-free** | Low friction for Tier 1 provider signup and browsing; deliberate friction (confirmation, escrow explainer) at money and identity moments |
| P3 | **One-thumb, one-hand** | All primary actions live in the bottom 40% of the screen. Target: usable on a Redmi 9A in a moving micro-bus |
| P4 | **Works on 3G** | Every screen has a skeleton state, image lazy-loading, and a degraded (SMS/offline) path |
| P5 | **Nepali-first bilingual** | Language toggle persistent in header; Nepali labels (नविन, अनुभवी, प्रवीन) are first-class, never an afterthought |
| P6 | **Urgency is a first-class flow** | Emergency Dispatch is one tap from home — never behind menus (PRD §5.3) |
| P7 | **No dark patterns** | No auto-renew, no pre-booking DMs, no fake urgency timers (mirrors PRD §7 exclusions) |

---

## 2. Design System (Foundations)

### 2.1 Color Tokens (max 5 colors)

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#0E7C5B` (Deep Teal-Green) | Primary CTAs, verified states, brand. Evokes trust + Nepali landscape |
| `--accent-urgent` | `#E8542F` (Vermilion) | Emergency Dispatch button, complaint alerts, destructive actions |
| `--foreground` | `#1A1D1C` (Near-black) | Body text, headings |
| `--muted` | `#6B7280` (Gray) | Secondary text, placeholders, dividers |
| `--background` | `#FAFAF7` (Warm off-white) | Page backgrounds, cards use pure `#FFFFFF` |

**Semantic derivatives:** `--success = primary`, `--destructive = accent-urgent`, `--warning = #B45309` (amber, used only in admin flag UI).

Rules:
- Trust badges NEVER use gradient fills — solid color + icon only (counterfeit resistance & rendering consistency on low-end GPUs).
- Escrow/money UI always pairs `--primary` with a lock icon — a consistent "money is safe" visual signature.

### 2.2 Typography

| Role | Font | Sizes |
|------|------|-------|
| Headings + UI | **Mukta** (excellent Devanagari + Latin support, variable weight) | 24/20/17px, weight 600–700 |
| Body | **Mukta** (single family — reduces font payload on 3G) | 15px base, `line-height: 1.5` |
| Numerals (prices, trust scores) | Mukta Tabular figures | 17–28px, weight 700 |

- Minimum body size: **15px** (Devanagari legibility requires +1px vs Latin).
- Never use decorative fonts. One font family total = ~90KB saved per load.

### 2.3 Spacing, Radius, Elevation

| Token | Value |
|-------|-------|
| Spacing scale | 4 / 8 / 12 / 16 / 24 / 32px (Tailwind: `p-1` – `p-8`) |
| Radius | `--radius: 0.75rem` cards · `9999px` pills/badges |
| Elevation | 2 levels only: `shadow-sm` (cards) · `shadow-lg` (modals, bottom sheets) |
| Tap targets | Minimum **48×48px**, 8px gap between adjacent targets |

### 2.4 Iconography

- Library: **Lucide** (consistent stroke, tree-shakeable)
- Sizes: 16px inline · 20px buttons · 24px navigation
- Canonical icons: `ShieldCheck` (verified) · `Lock` (escrow) · `Zap` (emergency) · `Star` (reviews) · `MapPin` (neighborhood tags) · `Camera` (proof-of-work)
- Never emojis as icons.

---

## 3. Component Library

Built on **shadcn/ui** primitives. Custom domain components:

| Component | Anatomy | Used In |
|-----------|---------|---------|
| `<ProviderCard>` | Photo (56px) · Name · Tier badge · Trust score ring · Neighborhood tag · Price-from · Rating (count) · CTA | Search, home, dispatch results |
| `<TrustScoreRing>` | Circular progress (0–100), color-stepped: <50 gray, 50–69 amber, 70+ primary. Tap → breakdown sheet | Cards, profiles |
| `<TierBadge>` | Pill: Tier 1 (gray outline "Basic") · Tier 2 (blue "Skilled ✓") · Tier 3 (primary filled "Verified & Insured 🛡") | Everywhere provider identity appears |
| `<ExperienceBadge>` | नविन / अनुभवी / प्रवीन pill with bilingual tooltip | Profiles, cards |
| `<EscrowStatusBar>` | 4-step horizontal stepper: Paid → Held → Job Done → Released, with lock icon | Booking detail |
| `<BookingLifecycleTimeline>` | Vertical timeline with timestamps + status chips | Booking detail, admin |
| `<ProofOfWorkGallery>` | 3-up photo grid, AI-verified checkmark overlay per photo | Profiles, job completion |
| `<NeighborhoodTag>` | `MapPin` + "7 jobs in Maharajgunj this month" — GPS-verified tooltip | Cards, profiles |
| `<KYCStepper>` | Vertical tier progression with locked/unlocked states | Provider onboarding |
| `<AdminReviewPanel>` | Side-by-side doc viewer + AI flag list + 4-action bar (Accept/Reject/Blacklist/Request Info) | Admin dashboard |
| `<CreditBalanceChip>` | Coin icon + count, tap → purchase sheet | Provider header |
| `<AssistantSheet>` | Bottom sheet chat w/ streaming tokens, context chips, SMS fallback banner | Global FAB |
| `<EmergencyButton>` | Full-width vermilion button, `Zap` icon, subtle pulse animation | Home screen |

---

## 4. Information Architecture & Navigation

### 4.1 Customer App — Bottom Tab Bar (4 tabs + FAB)

```
[Home]  [Bookings]  [⚡ Emergency FAB]  [Messages]  [Profile]
```

| Tab | Contents |
|-----|----------|
| Home | Search, category grid, featured providers, neighborhood activity |
| Bookings | Active (escrow status) · Past · Complaints |
| ⚡ Emergency | Center FAB — launches Emergency Dispatch Mode (PRD §5.3) |
| Messages | Post-booking chats only (PRD §6.3 harassment fix) + AI Assistant thread |
| Profile | Addresses, payment methods, language, guarantee claims |

### 4.2 Provider App — Bottom Tab Bar

```
[Jobs]  [Earnings]  [Boost]  [Profile]
```

| Tab | Contents |
|-----|----------|
| Jobs | Available (tier-filtered) · Active · Emergency requests (priority banner) |
| Earnings | Escrow pending · Released · Payout history (Khalti/eSewa) |
| Boost | Credit balance, packs, analytics, ranking status |
| Profile | KYC tier stepper, trust score breakdown, badges, portfolio |

### 4.3 Admin Dashboard — Left Sidebar

```
Verification Queue → Fraud Flags → Providers → Bookings → Complaints → Payouts → Analytics → KB/RAG Content
```

Verification Queue is the default landing view (PRD §3.3: human approval for first 500 providers).

---

## 5. Customer Experience — Screen Specs

### 5.1 Home

| Zone | Content | UX Rules |
|------|---------|----------|
| Header | Location selector (ward-level) · Language toggle (ने/EN) · Notification bell | Location persists; drives neighborhood tags |
| Hero | Search bar: "What do you need fixed?" placeholder rotates by category | Search suggestions cached offline |
| Emergency strip | `<EmergencyButton>` — "⚡ Find Me a Pro Now" | Always above the fold. 12% commission tier disclosed only at price confirmation, not here |
| Category grid | 8 icons (Plumber, Electrician, Cleaner…) 2×4 grid | Icons + bilingual labels |
| Trust strip | "1,000+ Verified Providers · Escrow-Protected Payments · 7-Day Guarantee" | Social proof, updates from live counts |
| Nearby activity | Horizontal scroll of `<ProviderCard>` filtered by GPS ward | Powered by geofenced completions (PRD §5.4) |

### 5.2 Search & Results

- **Filters (bottom sheet):** Tier (default: Tier 2+), price range, rating, distance, "Fast Responder" badge, availability today.
- **Sort:** Trust Score (default) · Distance · Price. Paid boosts appear in a labeled "Featured" slot (max 1 per page) — never silently mixed into organic ranking (PRD §7).
- **Card ordering rule:** Organic rank = trust score × proximity. Credit boosts affect only the Featured slot + tie-breaks, preserving trust integrity.

### 5.3 Provider Profile (the conversion-critical screen)

Vertical layout, in order of decision importance:

1. **Identity block** — Photo, name, `<TierBadge>`, `<ExperienceBadge>`, `<TrustScoreRing>` (tap → breakdown per PRD §4.1 weights: Reviews 40%, Timeliness 20%, Complaints −20%, Verification 10%, Proof-of-Work 10%)
2. **Neighborhood proof** — `<NeighborhoodTag>` list ("Worked for 7 homes in Maharajgunj this month")
3. **Proof-of-Work gallery** — AI-verified job photos with ✓ overlays
4. **Services & pricing** — Table of services with "from NPR X" ranges
5. **Reviews** — Recency-weighted order matching scoring model; complaint-held reviews show "Under review" chip
6. **Guarantee banner** — "🛡 7-Day Workmanship Guarantee on all bookings" (PRD §5.2)
7. **Sticky bottom CTA** — `[Book Now]` (primary, full-width) + `[Schedule Later]` (ghost)

**No phone number, no pre-booking chat** — anti-disintermediation by design. Contact unlocks only after booking acceptance.

### 5.4 Booking Flow (4 steps, progress dots)

| Step | Screen | Key UX |
|------|--------|--------|
| 1 | Service & details | Service selector · problem description · photo upload (optional, helps quoting) |
| 2 | Schedule & address | Date/time slots · saved addresses · map pin fine-tune |
| 3 | Price & escrow explainer | Itemized estimate · commission-inclusive price (no surprise customer fees per PRD §7) · **Escrow explainer card:** "Your money is held safely. The provider is paid only when you confirm the job is done." with `Lock` icon |
| 4 | Pay | Khalti / eSewa selector · single-tap confirm · < 3s confirmation target |

Success screen: booking ID, escrow status "🔒 Held Securely," provider ETA, guarantee badge.

### 5.5 Active Booking Detail

- `<EscrowStatusBar>`: **Paid → Held → Job Done → Released**
- Live provider status: Accepted → En Route (GPS) → Arrived (geofence auto-confirm feeds timeliness score) → Working → Awaiting Your Confirmation
- **"Job Complete" button** — the escrow release moment. Requires:
  - Confirmation dialog: "This releases NPR X to [Provider]. Satisfied with the work?"
  - Optional but encouraged: rate + review inline (single screen, ≤ 30s to complete)
  - Provider's proof-of-work photos shown here for the customer to verify against
- **"Report a Problem"** — secondary ghost button → complaint flow; pauses escrow release, triggers review hold (PRD §4.1)

### 5.6 Complaint Flow

3-step guided form (category → description + photos → desired resolution). Shows guarantee eligibility automatically if within 7 days. Status tracker mirrors booking timeline. AI Assistant is offered contextually with complaint schema pre-injected (PRD §8).

---

## 6. Provider Experience — Screen Specs

### 6.1 Jobs Tab

- **Emergency requests** render as a vermilion-bordered priority card at top with 5-minute countdown ring ("Accept in 4:32 to earn Fast Responder ⚡")
- Standard jobs list filtered by tier: Tier 1 providers see only < NPR 1,000 jobs, with a persistent upsell banner: "Unlock all jobs — add your CTEVT certificate → Tier 2"
- Job card: category, distance, budget range, time window, customer rating

### 6.2 Job Execution Flow

| Stage | Provider UI |
|-------|-------------|
| Accept | Slide-to-accept (prevents pocket-accepts) |
| En route | One-tap "I'm on my way" → shares live ETA |
| Arrival | Auto-detected by geofence; manual fallback button |
| Complete | **Mandatory proof-of-work capture:** camera-only (no gallery upload — anti stock-photo fraud), min 1 / max 3 photos, AI quality check inline ("Photo too blurry — retake") |
| Payment | "Waiting for customer confirmation" state with escrow amount shown locked |

### 6.3 Earnings Tab

- Three buckets with amounts: **In Escrow** (locked icon) · **Released** · **Paid Out**
- Verified Revenue Points counter with tooltip: "On-platform earnings boost your search ranking" (PRD §5.2)
- Payout: Khalti/eSewa linked account, payout history table

### 6.4 Boost Tab (Credits)

- `<CreditBalanceChip>` prominent at top
- Pack cards (PRD §6.3): Starter 99 / **Active 249 "Best Value" ribbon** / Pro 499
- Pro pack copy explicitly states: "Direct message customers **after** they accept your booking"
- **No auto-renew UI exists anywhere** (PRD §7). Purchase is always an explicit, single transaction with a confirmation step
- Analytics: profile views, search impressions, boost-attributed bookings (simple bar charts)

---

## 7. Tiered KYC Onboarding Flow (UX)

The signature "friction-right" flow. Modeled as a **game-like tier ladder**, not a bureaucratic form.

### 7.1 Tier Ladder Screen (`<KYCStepper>`)

```
● Tier 1 — BASIC          ✓ Complete
│  Phone OTP · Profile photo · 3 work photos
│  → You can accept jobs under NPR 1,000
│
● Tier 2 — SKILLED        ← You are here
│  Upload CTEVT / professional certificate
│  → Unlock ALL standard jobs + Skilled badge
│
○ Tier 3 — VERIFIED & INSURED   🔒
   Citizenship/Passport + Video selfie
   → High-value jobs · Trust badge · Insurance
```

Each tier card shows: requirements checklist, **what it unlocks** (benefit-first copy), and estimated review time ("Usually approved within 4 hours").

### 7.2 Tier 1 — Basic (target: < 5 minutes)

1. Phone number → OTP (auto-read SMS)
2. Selfie capture (camera-only, face-detection frame overlay, natural-light hint)
3. 3 work photos (camera or gallery for Tier 1; inline AI feedback: "Great — this clearly shows your work")
4. Category + service area selection
5. Done → "You can start accepting small jobs NOW while you level up"

### 7.3 Tier 2 — Skilled

- Certificate capture with document frame overlay + edge detection
- AI review status screen: `UNDER_REVIEW` with animated progress + honest copy ("A human will double-check the AI's review")
- Rejection screen always shows: reason code in plain language + exactly what to fix + one-tap re-submit (PRD §3.2 lifecycle)

### 7.4 Tier 3 — Verified & Insured

1. ID capture (front/back), OCR name auto-fill with edit confirmation ("Is this your name? — राम बहादुर")
2. **Video KYC selfie:** guided liveness (turn head left/right, blink) with clear privacy copy: "This video is used once for verification and stored encrypted"
3. Review pending state → push + SMS on approval (PRD §3.3 Accept action)

### 7.5 Status Lifecycle UI Mapping (PRD §3.2)

| Status | UI Treatment |
|--------|--------------|
| `INCOMPLETE` | Progress ring on profile tab + checklist of missing fields |
| `PENDING_DOCUMENTS` | Amber banner with the *specific* document requested (from admin Request Info) |
| `UNDER_REVIEW` | Neutral banner + estimated time; provider can still work at current tier |
| `VERIFIED` | Celebration moment: confetti-free, dignified — full-screen badge reveal + share card |
| `REJECTED` | Plain-language reason + fix guidance + re-submit CTA. Never a dead end |

---

## 8. Trust Score & Badge UI System

### 8.1 Trust Score Breakdown Sheet

Tapping any `<TrustScoreRing>` opens a bottom sheet with the exact PRD §4.1 model, made human:

| Row | Display |
|-----|---------|
| ⭐ Customer reviews (40%) | Stars + "weighted toward recent jobs" |
| ⏱ On-time arrival (20%) | "% on-time, GPS-verified" |
| ⚠ Complaints (−20%) | "X complaints per 100 bookings" |
| ✓ Verification (10%) | Tier shown: Tier 3 = 10/10, Tier 2 = 6/10, Tier 1 = 2/10 |
| 📷 Proof-of-Work (10%) | "% of jobs with AI-verified photos" |

Full transparency = customers trust the score; providers know exactly how to improve.

### 8.2 Badge Visual Hierarchy

| Badge | Visual | Placement |
|-------|--------|-----------|
| Verified & Insured (Tier 3) | Solid primary shield pill | Next to name, first position |
| Skilled (Tier 2) | Blue outline pill | Next to name |
| Experience (नविन/अनुभवी/प्रवीन) | Neutral pill, Nepali-first with EN tooltip | Below name |
| Fast Responder ⚡ | Small vermilion lightning chip | Card corner |
| Paid badges (Skill Verified NPR 199, Background Checked NPR 499, Insured NPR 299/yr) | Icon row on profile only — never on search cards (prevents pay-to-appear-trustworthy in ranking context) | Profile "Credentials" section |

---

## 9. Booking, Escrow & Payment UX

### 9.1 Escrow Mental Model

Consistent 4-state language across ALL surfaces (customer, provider, admin, SMS):

```
🔒 PAID & HELD  →  🔧 JOB IN PROGRESS  →  ✋ AWAITING CONFIRMATION  →  ✅ RELEASED
```

- Customer copy: "Your NPR 2,500 is held safely by GharSewa"
- Provider copy: "NPR 2,500 secured for you — complete the job to receive it"
- Disputed state: "⏸ On Hold — under review" (amber), links to complaint status

### 9.2 Commission Transparency

- Customer sees one all-inclusive price (no separate booking fee line — PRD §7)
- Provider sees itemized: Job value − commission (8/10/12% per PRD §6.1 tiers, rate shown) = Your earning
- Emergency jobs show the 12% rate to providers *before* accept, framed as: "Priority job — higher visibility, 12% platform fee"

### 9.3 Payment Failure UX

- Khalti/eSewa failure → retry with alternate wallet in ≤ 2 taps; booking slot held 10 minutes with visible timer
- All payment states recoverable from Bookings tab (no orphaned payments)

---

## 10. Emergency Dispatch Mode UX

The highest-stakes flow — design for panic states (burst pipe, sparking outlet).

| Step | Screen | Time Budget |
|------|--------|-------------|
| 1 | Tap ⚡ FAB → category picker (6 large tiles, icons dominant) | 5s |
| 2 | Auto-located address confirm (one tap) + optional photo of the problem | 10s |
| 3 | **Matching screen:** radar animation + "Finding your nearest verified pro…" with live status ("3 pros notified") | ≤ 60s |
| 4 | Match card: provider photo, tier badge, trust score, ETA, fixed callout fee → `[Confirm & Pay Callout]` | 10s |
| 5 | Live tracking map + call button (masked number relay) | — |

Rules:
- Only Tier 2+ providers eligible for emergency matching (safety floor)
- If no match in 90s: honest fallback — "No pros available right now. We've queued your request and will SMS you the moment one accepts" + option to browse scheduled bookings
- Panic-state design: max 1 decision per screen, oversized buttons, no upsells anywhere in this flow

---

## 11. AI/RAG Assistant UX

- **Entry points:** persistent FAB (all customer screens), contextual "Ask about this" chips on booking detail, complaint form, and credit purchase screens — each injecting the matching context per PRD §8 table
- **Chat sheet anatomy:** context chip row at top ("📦 Booking #4521 loaded"), streaming responses (SSE, first token < 1.5s target), suggested follow-up chips, Nepali/English auto-detection with reply in the user's language
- **Escalation:** after 2 failed resolutions or on explicit request → "Talk to a human" handoff with the full transcript attached (supports the > 60% self-resolution KPI without trapping users)
- **SMS fallback (PRD §8 connectivity note):** when connection drops mid-stream, banner offers: "Weak connection — get answers by SMS instead" → user texts keyword to Sparrow SMS shortcode; response templates for top 20 intents
- **Trust boundaries:** assistant never confirms payments, releases escrow, or changes bookings without an explicit in-app confirmation tap — AI advises, users act

---

## 12. Admin Dashboard — Anti-Fraud Review UX

### 12.1 Verification Queue (default view)

- Table: applicant, tier requested, AI risk score (0–100, color-coded), wait time, assigned reviewer
- Sort default: AI-flagged first, then FIFO. SLA indicator turns amber at 3h, red at 4h (median < 4h KPI)
- Keyboard-first: `J/K` navigate, `Enter` opens review panel — reviewers process dozens per hour

### 12.2 Review Panel (`<AdminReviewPanel>`)

**Three-column layout:**

| Left: Documents | Center: AI Analysis | Right: Decision |
|-----------------|--------------------|--------------------|
| Zoomable ID front/back, selfie, video KYC player, work photos | Automated checks as pass/fail rows (PRD §3.3): Duplicate check · OCR name match (side-by-side diff) · Face match % (threshold 95% highlighted) · Photo quality flags · IP/GPS geo-check map pin | Red/Green flag checklist (PRD table rendered as toggleable checklist) + 4 action buttons |

**Action buttons (PRD §3.3 exactly):**

| Button | Style | Behavior |
|--------|-------|----------|
| ✅ Accept | Primary | Requires all critical AI checks green OR explicit override reason. Fires FCM + Sparrow SMS |
| ⏸ Request Info | Ghost | Forces selection of *specific* missing item(s) → templated SMS |
| ❌ Reject | Outline destructive | Requires reason code selection (drives the provider's fix-it screen) |
| 🚫 Blacklist | Destructive, double-confirm modal | Requires typed confirmation + evidence note. Blocks phone + ID permanently |

Every decision is logged with reviewer ID + timestamp (audit trail).

### 12.3 Fraud Flags & Leakage Monitoring

- Pattern alerts: repeat cancellations after first meeting (off-platform leakage signal, PRD §5.2), duplicate device fingerprints, review-burst anomalies (trust inflation)
- Complaint-triggered review holds queue with escrow amounts at stake shown

---

## 13. Notifications & SMS Fallback UX

| Event | Push (FCM) | SMS (Sparrow) | In-App |
|-------|-----------|----------------|--------|
| KYC approved/rejected | ✓ | ✓ (PRD §3.3 requirement) | Banner |
| Booking accepted / provider en route | ✓ | ✓ if push undelivered in 60s | Timeline |
| Escrow released / payout sent | ✓ | ✓ (money events always dual-channel) | Earnings |
| Emergency match found | ✓ high-priority | ✓ | Full-screen |
| Credit pack expiring | ✓ | — | Boost tab chip |

Rules: money and identity events are **always** dual-channel. Marketing pushes: max 2/week, opt-out in one tap. SMS templates ≤ 160 chars, bilingual variants.

---

## 14. Localization (Nepali/English)

- Toggle in header on every screen; persists per account
- Devanagari rendering QA on low-end Android WebViews (Mukta chosen for this)
- Numerals: Latin digits for prices/scores everywhere (banking convention in Nepal); Nepali script for badge names and cultural terms
- Dates: BS (Bikram Sambat) shown alongside AD in booking confirmations
- All templated SMS, reason codes, and AI assistant replies maintained in both languages in the KB/RAG content admin section

---

## 15. Accessibility Standards

| Requirement | Standard |
|-------------|----------|
| Contrast | WCAG 2.1 AA (4.5:1 body, 3:1 large text) — verified for all 5 tokens |
| Touch targets | ≥ 48×48px |
| Screen readers | Semantic HTML, ARIA labels on trust rings ("Trust score 78 out of 100"), badge tooltips readable |
| Motion | Radar/pulse animations respect `prefers-reduced-motion` |
| Forms | Visible labels (no placeholder-only), inline validation, error text + icon (not color alone) |
| Focus | Visible focus rings on admin dashboard (keyboard-first workflows) |

---

## 16. Performance & Low-Bandwidth UX

Aligned to PRD §9.1 latency targets:

| Technique | Detail |
|-----------|--------|
| Skeleton screens | Every list/profile screen; no blank whites, no spinners > 1s |
| Image strategy | Cloudinary auto-format (WebP/AVIF), width-capped variants: 56px avatars, 400px gallery; blur-up placeholders |
| Offline resilience | Bookings tab + active booking cached; queued actions ("Job Complete" tap) sync on reconnect with visible "pending sync" chip |
| Perceived speed | Optimistic UI on accept/confirm actions with rollback toasts |
| Bundle discipline | Single font family, route-level code splitting, admin dashboard fully separate bundle |
| p95 budgets in UX terms | Search results paint < 500ms · Assistant first token < 1.5s · Payment confirm < 3s with determinate progress |

---

## 17. Empty, Loading & Error States

| State | Pattern |
|-------|---------|
| Empty search results | Illustration-free, helpful: "No plumbers in your ward yet — expand radius?" + one-tap radius expand |
| Provider with 0 reviews | "New provider — protected by escrow & 7-day guarantee" (converts uncertainty into a trust message) |
| Network error | Cached content + amber offline banner; retry button, never a dead white screen |
| Payment failure | Specific reason + alternate wallet CTA + slot-hold timer |
| KYC rejection | Reason + fix + re-submit (never terminal — PRD §3.2) |
| Emergency no-match | Honest fallback + SMS queue promise (§10) |

---

## 18. UX Metrics & Instrumentation

Every KPI in PRD §2 maps to an instrumented UX funnel:

| PRD KPI | UX Instrumentation |
|---------|--------------------|
| KYC approval < 4h median | Time-per-tier funnel, drop-off per step, doc retake rate |
| Booking conversion > 25% of profile views | Profile scroll depth, CTA visibility, step 1–4 abandonment |
| RAG resolution > 60% | Thread resolution tagging, escalation rate, thumbs feedback |
| Complaint rate < 2–3% | Complaint entry point heatmap, guarantee claim rate |
| Trust score integrity | Score-breakdown sheet open rate (transparency engagement), review-after-release completion rate |
| Anti-leakage | Post-first-booking rebook rate on-platform vs. churn cohort analysis |

**Review cadence:** weekly funnel review for onboarding + booking; monthly heuristic audit of the Emergency flow (panic-state usability testing with real users in Kathmandu, Pokhara, and one Tier-2 city).

---

*GharSewa Nepal · UI/UX Specification v1.0 · Companion to PRD v2.0 · July 2026*