# BishwasSetu 🤝
### *Home Services & Community Trust Platform*

BishwasSetu is a trust-based home services marketplace for Nepal, connecting customers with verified local service providers (plumbers, electricians, cleaners, and more). The platform is built around escrow-protected payments, AI-assisted identity verification, a dynamic trust-score engine, and a bilingual (Nepali/English) experience end to end.

---

## ✨ Implemented Features

### 🔐 Authentication & Access Control
- JWT access + refresh tokens (rotating refresh tokens, HttpOnly cookie), with silent refresh-and-retry on the frontend.
- Email **or** phone registration/login with OTP 2FA (email via Nodemailer, SMS via Sparrow SMS, dev-mode console fallback).
- Four roles with RBAC: **Customer**, **Provider**, **Moderator**, **Admin**.
- Separate direct-credential **Admin Console login** (`/admin-auth`) for staff accounts — no public registration, no OTP step, own rate limiter.

### 📂 Service Marketplace & Discovery
- Category → sub-category → service browsing, full-text search, and location/verification-based provider search.
- **AI Smart Match**: nearest verified providers for a described job, ranked by distance, trust score, and availability.

### 📅 Booking & Job Lifecycle
- End-to-end booking flow with guarded status transitions (Pending → Accepted → Completed/Cancelled).
- Real-time status push to both parties over Socket.IO.
- In-booking messaging (chat thread per booking).

### 🛡️ Verification & Trust
- **KYC pipeline**: document upload (Cloudinary), EXIF checks, and an AI-assisted decision step (`KycAiDecision`) with a confidence score, backed by human review, request-info, and blacklist actions.
- **Skill Evidence queue**: human-reviewed proof-of-skill submissions, independent of identity KYC.
- **Trust Score Engine**: event-driven scoring job (reviews, timeliness, completions, complaints) — fully implemented, not a placeholder.
- **Trust Badges**: paid/verified badges (document-backed) plus system-earned performance badges, both with an admin approval queue.
- **Fraud & anomaly detection**: trust anomaly feed and fraud-flag resolution in the admin console.
- **Content moderation**: automated moderation pass on reviews and provider replies.

### 💳 Escrow-Protected Payments
- **Khalti** and **eSewa** integration (initiate, verify, release) — currently wired to sandbox/dev credentials.
- Held-in-escrow payments released to providers on job completion, with a commission ledger and revenue analytics dashboard.
- Saved payment-method preference per user.

### 🧾 Workmanship Guarantee
- 7-day guarantee window per completed, escrow-paid booking, with a customer-facing claims flow.

### 🚨 Emergency Dispatch
- One-tap emergency request broadcast to nearby providers, offer/accept/decline flow, and a background dispatch job with expiry handling.

### 🏘️ Neighborhood Trust Stats
- Per-provider "jobs completed in your area" stats, surfaced on provider profiles.

### 🚫 Off-Platform Leakage Detection
- Flags patterns suggesting a booking is being taken off-platform to dodge commission, surfaced to admins for review.

### 📣 Complaints
- Customer-filed complaints tied to a booking, admin resolution workflow (refund / warning / dismissal) with an audit trail.

### 🤖 AI Assistant
- RAG-based chat assistant (Groq) grounded in a knowledge-base, streamed token-by-token over SSE.
- Automatic Nepali/English language detection, with cited KB sources per answer.
- Context-aware: injects the signed-in user's own bookings/complaints/provider info, and explicitly refuses to leak other users' data.

### 💰 Credits & Provider Boost
- Provider credit wallet, credit-pack purchases, deduction history, and paid visibility boosts.

### 🛠️ Admin Console
- Dashboard (KYC queue depth, active users, verified providers, bookings, commission, complaints), KYC/skill-evidence/badge review queues, provider & user management, complaint resolution, trust & fraud review, and revenue analytics — all gated behind `ADMIN`/`MODERATOR` roles.

### 🌐 Platform-wide
- Full Nepali ⇄ English UI toggle (persisted).
- Push-notification backend (Firebase Cloud Messaging) already wired into escrow release, credits, and emergency-dispatch events — ready to serve a future mobile client.
- Hardened API layer: Helmet, CORS allow-list, HPP protection, input sanitization, per-route Redis-backed rate limiting with in-memory fallback, request-ID tracing, structured (Winston) logging.
- Background job queue (Bull + Redis) for KYC processing, trust scoring, moderation, emergency dispatch, escrow release, and data-retention cleanup.

---

## 🚧 Not Yet Implemented

- **Mobile app** — no client exists yet. The backend already exposes FCM push-notification plumbing for one.
- **CI/CD pipeline** — no automated build/test/deploy workflow configured yet.
- **Production payment credentials** — Khalti/eSewa are integrated but currently point at sandbox endpoints; production key rollout is pending.
- **Broader automated test coverage** — a handful of backend unit tests exist (booking status guards, commission math, feature gates, JWT); most services and the entire frontend are untested.
- **Phone number verification hardening** — Sparrow SMS delivery has no delivery-status callback or retry queue yet; failures are logged and swallowed.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **UI primitives**: Base UI + a small custom component set (`components/ui`), `class-variance-authority`, `lucide-react` icons
- **State**: React Context (auth, language/i18n, toast) — no Redux; server state fetched via a thin typed `fetch` client
- **Realtime**: Socket.IO client for booking/chat updates
- **i18n**: Custom Nepali/English translation layer (`lib/i18n.ts`)

### Backend
- **Runtime**: Node.js, Express 5, TypeScript (`tsx` in dev)
- **Database**: MySQL via Prisma ORM
- **Validation**: Zod
- **Auth**: JWT (access + rotating refresh tokens), bcrypt password hashing, email/SMS OTP 2FA
- **Realtime**: Socket.IO
- **Queues/Jobs**: Bull + Redis (KYC pipeline, trust scoring, moderation, emergency dispatch, escrow release, retention cleanup)
- **AI**: Groq SDK (RAG-based assistant), heuristic KYC document scoring
- **Payments**: Khalti & eSewa ePay v2
- **Media**: Cloudinary (KYC documents, badge evidence)
- **Notifications**: Nodemailer (email), Sparrow SMS, Firebase Admin (FCM push)
- **Security**: Helmet, CORS, HPP, express-rate-limit (+ `rate-limit-redis`), Winston logging
- **Testing**: Vitest

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL](https://www.mysql.com/)
- [Redis](https://redis.io/) (rate limiting, job queues)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rahultharu064/BishwasSetu.git
   cd BishwasSetu
   ```

2. **Backend setup**
   ```bash
   cd backend
   npm install
   # Create a .env file — see below for the variables it needs
   npx prisma migrate dev
   npm run db:seed   # creates a starter admin account + sample data
   npm run dev
   ```

3. **Frontend setup**
   ```bash
   cd ../frontend
   npm install
   # Create a .env.local with NEXT_PUBLIC_API_URL pointing at the backend
   npm run dev
   ```

### Backend environment variables
```
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=
JWT_REFRESH_EXPIRES=
REDIS_URL=
EMAIL_USER=
EMAIL_PASS=
SPARROW_SMS_TOKEN=
SPARROW_SMS_FROM=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
KHALTI_SECRET_KEY=
ESEWA_SECRET_KEY=
ESEWA_PRODUCT_CODE=
GROQ_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
```

### Default seeded accounts
Running `npm run db:seed` creates a staff account for the Admin Console:
- **Admin login** (`/admin-login`): `admin@bishwasetu.com` / `admin123`

Change or remove this before deploying anywhere public.

---

## 🤝 Contributing
We welcome contributions to make BishwasSetu even better! Please feel free to open issues or submit pull requests.

## 📄 License
This project is licensed under the MIT License.
