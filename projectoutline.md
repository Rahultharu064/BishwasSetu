🏠
GharSewa Nepal
Trust Infrastructure for Nepal's Home Services Economy


Document Type	Product Requirements Document (PRD) — v2.0
Status	Updated — Tiered KYC + Solutions Incorporated
Date	July 11, 2026
Platform	GharSewa Nepal — Home Services Marketplace
Revision Notes	Updated KYC model, Weak-Point resolutions, Anti-fraud workflow
 
1. Executive Summary

GharSewa Nepal is a trust-indexed home services marketplace connecting verified local service providers (plumbers, electricians, cleaners, etc.) with customers across Nepal. This PRD v2.0 reflects key strategic updates: a tiered, friction-right provider verification model that replaces the single citizenship-gate approach; escrow-based payment controls to prevent disintermediation; and AI-assisted proof-of-work validation. These changes address the core sustainability risks identified during product review.
Stakeholder Value Propositions
Stakeholder	Core Value Delivered
Customer	Book verified providers with transparent trust scores and real accountability
Provider	Build a portable, verified professional reputation and find consistent work
Platform	Become the trust infrastructure for Nepal's home services economy

2. Product Goals & Key Metrics

2.1 Performance Goals
Goal	Target
Provider KYC approval time	Median < 4 hours (AI-assisted pipeline)
Customer booking conversion	> 25% of provider profile views
Trust Score false positive rate	< 5% of flagged reviews
RAG Assistant resolution rate	> 60% of queries without human support

2.2 Growth Milestones
Metric	Month 3	Month 6	Month 12
Verified providers	200	1,000	3,000
Monthly bookings	500	3,000	10,000
Average trust score	> 70	> 75	> 78
Complaint rate	< 5%	< 3%	< 2%
AI Assistant CSAT	—	> 4.0/5	> 4.3/5
Monthly revenue (NPR)	—	200,000	570,000

3. Provider Onboarding — Tiered KYC Model  ⭐ UPDATED

🔄 KEY CHANGE:  The previous single-gate Citizenship ID requirement has been replaced with a three-tier, skill-first verification model. Identity documents are now used to prove accountability — not professionalism. This reduces onboarding friction while maintaining platform integrity.

3.1 Three-Tier Provider Status Model
Tier	Status	Requirements	Unlocks	Trust Level
Tier 1	BASIC PROVIDER	Phone OTP + Profile Photo + 3 Work Photos	Browse jobs; accept Low-Value bookings (NPR < 1,000)	Low
Tier 2	SKILLED PROVIDER	Tier 1 + CTEVT/Professional Certificate (AI-reviewed)	Accept all standard bookings; Skilled badge displayed	Medium
Tier 3	VERIFIED & INSURED	Tier 2 + Citizenship/Passport + Video KYC selfie	Full access; High-value jobs; Trust badge; Insurance eligibility	Very High

💡 Philosophy:  A CTEVT certificate + 3 work photos = stronger professional signal than a Citizenship ID alone. The Citizenship ID is the final step for accountability and high-value job access — not the first barrier.

3.2 Legacy Status Lifecycle (Retained)
The following status codes remain valid across all three tiers:
Status Code	Description
INCOMPLETE	Profile fields not filled
PENDING_DOCUMENTS	Professional info saved, documents not uploaded
UNDER_REVIEW	Submitted, awaiting AI + human review
VERIFIED	Full access unlocked
REJECTED	Rejection reason shown with re-submission option

3.3 Admin Approval & Anti-Fraud Workflow
For the first 500 providers, all final approvals require a human admin click. AI flags problems; humans make the final call. Below is the complete anti-fraud checklist.
Automated Pre-Screening (AI Pipeline)
•	Duplicate Check — same Citizenship ID or phone used in a previous REJECTED account triggers auto-hold.
•	OCR Consistency — name in form vs. name extracted from ID must match (Groq Llama-3.2-Vision).
•	Selfie vs. ID Face Match — AWS Rekognition; threshold > 95% confidence.
•	Work Photo Quality Check — Llama-3.2-Vision flags blurry, stock, or irrelevant images.
•	IP / GPS Geo-check — registration location must be within Nepal's borders.
Admin Red Flag Checklist
Signal	Red Flag (Likely Fake)	Green Flag (Legitimate)
Profile Photo	Celebrity/stock image, no face visible, very low resolution	Clear natural-light selfie matching ID photo
Document Quality	Edges cut off, text appears digitally edited/photoshopped	Full document visible; security features present
Location	Registration IP outside Nepal	IP and GPS match declared service area
Work History	Claims 10 years experience but ID shows age 22	Age and experience years are logically consistent
Work Photos	All photos are identical or sourced from Google Images	Unique, contextual photos of actual completed work

Admin Actions
Action	When to Use	System Result
✅  ACCEPT	ID clear, face match > 95%, category matches documents	Status → VERIFIED; FCM push + Sparrow SMS sent to provider
❌  REJECT	Blurry docs, tampered ID, inappropriate photo	Status → REJECTED with reason code; provider can re-submit
🚫  BLACKLIST	Confirmed stolen identity or repeat scammer	Phone + ID number permanently blocked; shadow-ban applied
⏸  REQUEST INFO	Documents are incomplete but not fraudulent	Status → PENDING_DOCUMENTS; specific request sent via SMS

3.4 What Each Verification Type Actually Proves
Verification Type	What It Proves	Impact on Professionalism
Citizenship ID	Legal identity — traceable by police	Low — only proves accountability
CTEVT / Professional Cert	Formal technical training completed	High — proves craft knowledge
Work Portfolio (3 photos)	Practical, hands-on skill	Very High — proves real execution
Customer Reviews	Reliability, punctuality, soft skills	High — proves repeat quality
Video KYC	Live person matches ID; anti-spoofing	Medium — fraud prevention only

4. Trust Score System — Updated Model

4.1 Scoring Signals & Weights
Signal	Weight	Notes
Review average (recency-weighted)	40%	Recency decay applied; peer-to-peer vouches excluded
Booking timeliness (on-time rate)	20%	GPS geofence confirms provider arrival time
Complaint ratio (complaints / bookings)	-20%	Auto-deduction; complaint triggers review hold
Verification completeness	10%	Tier 3 = full 10%; Tier 2 = 6%; Tier 1 = 2%
Proof-of-Work (job photos uploaded)	10%	REPLACES Community Vouches — AI quality-checked

⚠️ CHANGE:  Community Vouches (10%) have been replaced by Proof-of-Work Photo Score (10%). In Nepal's 'Afno Manche' culture, social circle vouches are easily manipulated. AI-verified job completion photos provide an objective, fraud-resistant signal.

4.2 Experience Badges
Badge	Nepali Name	Condition
New	नविन (Navin)	< 1 year on platform
Experienced	अनुभवी (Anubhavi)	1–2 years on platform
Expert	प्रवीन (Prabin)	> 2 years on platform

4.3 Trust Badge Fees
Badge	Fee	Verification Step
Citizenship Verified	Free	Included in Tier 3 KYC
Skill Verified	NPR 199	AI assessment + admin review of work samples or CTEVT certificate
Background Checked	NPR 499	Criminal record check (Phase 2 — NRN database integration)
Insured	NPR 299/year	Provider uploads insurance document; platform displays status

5. Anti-Disintermediation Features  ⭐ NEW

The single largest sustainability threat for GharSewa is platform leakage — customers and providers exchanging numbers and transacting in cash after the first meeting. The following features are designed to make on-platform transactions the clearly preferred path for both parties.
5.1 Escrow-Based Milestone Payments
•	Customer pays the platform before the job begins.
•	Funds are held in escrow and released to the provider only when the customer taps 'Job Complete.'
•	Integrations: Khalti + eSewa (already in tech stack).
•	Impact: Forces all transactions on-platform; justifies 8–12% commission with financial security.
5.2 Service Guarantee Credits
•	On-platform bookings display a 7-day Workmanship Guarantee badge.
•	Off-platform cash deals receive no warranty and are explicitly noted in the app.
•	Provider incentive: On-platform revenue earns 'Verified Revenue Points' that boost search ranking.
•	Off-platform behavior detected via complaint patterns triggers account review.
5.3 Emergency Dispatch Mode  ⭐ NEW
Most home service needs in Nepal are urgent. A dedicated 'Find Me a Pro Now' mode:
•	Single button that matches the customer with the nearest available, verified provider.
•	Bypasses the profile-browsing friction that causes abandonment.
•	Carries a higher commission tier (12%) justified by speed and convenience.
•	Provider earns a 'Fast Responder' badge if they accept within 5 minutes.
5.4 Hyper-Local 'Neighborhood' Tags  ⭐ NEW
Replaces generic 'Community Vouch' with area-specific social proof:
•	Provider profiles display: 'Has worked for 7 homes in Maharajgunj this month.'
•	Powered by GPS-verified job completions (geofencing data).
•	Leverages Nepal's high neighbor-trust culture without enabling nepotism manipulation.

6. Revenue Model

6.1 Commission Structure
Booking Value	Commission Rate
NPR 0 – 1,000	8%
NPR 1,001 – 5,000	10%
NPR 5,001+	12%

6.2 Revenue Streams
Stream	Type	Month 6 (NPR)	Month 12 (NPR)
Transaction commission	Variable per booking	150,000	450,000
Credit pack sales	On-demand purchases	30,000	80,000
Trust badge fees	One-time + annual	15,000	40,000
B2B contracts	Recurring (Phase 2)	—	—
Total		~195,000	~570,000

6.3 Credit Packs
Pack	Price	Credits	Primary Value
Starter	NPR 99	50	1 week priority ranking + basic analytics
Active (best value)	NPR 249	150	3 weeks priority ranking + homepage featured slot + full analytics + AI tips
Pro	NPR 499	350	6 weeks priority ranking + 2× search boost + direct message after booking (not before)

⚠️ UPDATE:  The Pro Pack 'Direct Message before booking' feature has been changed to 'Direct Message after booking acceptance.' Pre-booking DM enabled customer harassment, contradicting the platform's anti-harassment policy.

6.4 B2B Packages (Phase 2)
Package	Monthly Fee	Included
Building Manager	NPR 1,999	Up to 20 requests/month · 4-hour response SLA · dedicated dashboard
Hotel / Hospitality	NPR 4,999	Unlimited requests · dedicated provider pool · 2-hour SLA · invoice billing
Enterprise	Custom	Negotiated volume · white-label booking portal · API access

7. Excluded Revenue Mechanisms

Mechanism	Reason Excluded
Monthly provider subscription	Charges during idle months → resentment → churn → supply collapse
Paid organic ranking override	Breaks trust signal → customers get low-quality results → platform credibility collapses
Lead selling (auction model)	Multiple providers contact same customer simultaneously → harassment → demand collapse
Third-party advertising	Destroys trust brand — customers on a 'trusted' platform should not see competitor ads
Customer-side booking fees	Adds friction at conversion moment → booking abandonment
Auto-renewing credit charges	Provider must control their own spend — no auto-charge under any circumstance

8. AI / RAG Assistant

User Intent	Injected Context
Booking help	Current booking object, provider profile, lifecycle docs
Provider comparison	Shortlisted provider profiles + trust breakdowns
Complaint filing	Complaint form schema, policy articles, past complaint status
Credits / boost	Current credit balance, pack options, boost analytics
Policy / FAQ	Top-ranked KB chunks
General (Nepali)	Translated KB chunks; response in Nepali

📱 CONNECTIVITY NOTE:  Groq Llama-3.3-70B SSE streaming requires stable 4G. An SMS-based fallback via Sparrow SMS must handle queries for users on 3G or low-end devices. This is critical for Tier 2/3 city adoption.

9. Technology Stack

Layer	Technology
Runtime	Node.js 20 + TypeScript 5
Framework	Express 4
ORM	Prisma 5 (MySQL provider)
Primary DB	MySQL 8.0 (utf8mb4, InnoDB)
Cache / Queue	Redis + Bull
File Storage	Cloudinary (signed uploads, restricted delivery for KYC)
LLM — Assistant	Groq API — llama-3.3-70b-versatile (streaming SSE)
LLM — KYC Vision	Groq API — llama-3.2-90b-vision-preview / AWS Textract (OCR)
Face Match	AWS Rekognition CompareFaces
Content Moderation	Groq API — classifier on llama-3.1-8b-instant
Embeddings / Reranking	JSON column in MySQL + cosine similarity (Node.js app layer)
FTS — RAG	MySQL FULLTEXT index (InnoDB, utf8mb4)
Auth	JWT (HttpOnly cookies) + OTP
Payments	Khalti · eSewa
Notifications	Firebase FCM + Sparrow SMS
CI/CD	GitHub Actions
Hosting	Railway (MVP)

9.1 API Latency Targets
Endpoint Type	p95 Latency Target
Standard API (read)	< 200 ms
Search + AI rerank	< 500 ms
Assistant first token (SSE)	< 1.5 s
KYC AI pipeline	< 2 minutes
Credit purchase confirmation	< 3 s

10. Identified Weak Points & Resolutions

Weak Point	Risk Level	Resolution Adopted in v2.0
Trust Score inflation via social circles	High	Community Vouches replaced by Proof-of-Work photo scoring (AI-verified)
KYC OCR failure on Nepali documents	High	Video KYC added; OCR is supplementary, not the sole gate
Platform leakage / cash disintermediation	High	Escrow payments + Service Guarantee makes on-platform the trusted default
Citizenship ID ≠ Professional skill	Medium	Tiered model: skill/certificate = Tier 2; ID = Tier 3 only
Pro pack pre-booking DM → harassment	Medium	DM window moved to post-booking-acceptance only
Connectivity issues (3G/low-end devices)	Medium	SMS fallback via Sparrow SMS for assistant queries
Insurance badge: low adoption in Nepal	Low	Kept as optional trust booster; platform explores group micro-insurance in Phase 2


GharSewa Nepal  ·  PRD v2.0  ·  Confidential  ·  July 2026
