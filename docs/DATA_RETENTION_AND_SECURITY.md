# KYC Data Retention & Security Policy

**Scope:** identity documents collected during provider verification —
government IDs, passports, and video/photo KYC selfies. These are the most
sensitive records the platform holds; a breach would expose real people to
identity theft. This policy exists so we handle them lawfully and minimally
**before** we accept a single real citizenship ID.

> Status: v1 (pilot). Owner: platform/ops. Review before enabling Tier 3 KYC.

---

## 1. Principles

1. **Data minimization** — keep a raw identity image only as long as it is
   operationally needed. Once verification is decided and its retention window
   passes, the image is destroyed; only the *outcome* (VERIFIED / REJECTED) is
   kept.
2. **Restricted access** — KYC images are never public. They are stored as
   Cloudinary `authenticated` assets and only reachable through short-lived
   signed URLs generated for an authenticated admin/moderator.
3. **Purpose limitation** — KYC images are used solely for identity/skill
   verification and fraud review. They are never used for marketing, model
   training, or shared with third parties outside a lawful request.

## 2. Storage & access controls (implemented)

| Control | Where | Status |
|---|---|---|
| Private storage | KYC uploads go to the `bishwassetu/kyc` folder with Cloudinary `type: authenticated` | `src/services/kycService.ts` |
| Signed, time-limited delivery | Admin views documents via 15-minute signed URLs (`getSignedUrl`) | `src/utils/cloudinary.ts`, `src/services/kycService.ts` |
| Role-gated retrieval | Only `ADMIN` / `MODERATOR` can request document URLs | `src/routes/kycRoute.ts` |
| Status-only for provider | Providers see verification status, never document URLs | `src/services/kycService.ts` (`getKycStatus`) |
| Transport security | HTTPS enforced at the edge; HttpOnly cookies for auth | `src/app.ts` (helmet), auth middleware |

## 3. Retention windows (implemented)

Enforced by the daily retention worker `src/jobs/kycRetentionJob.ts`
(scheduled in `src/server.ts`). Windows are env-configurable:

| Track | Retention window | Env var | Default | What is purged |
|---|---|---|---|---|
| Rejected submissions | days after rejection | `KYC_REJECTED_RETENTION_DAYS` | 30 | ID + selfie images (Cloudinary asset + DB row) |
| Approved / verified | days after verification | `KYC_VERIFIED_RETENTION_DAYS` | 90 | raw ID + selfie images; verification status is retained on the provider record |

The worker deletes the Cloudinary asset first, then the database row, per
document, so one failed asset does not block the batch. The provider's
`identityStatus` is **not** changed — we keep the verification decision, we
just stop holding the sensitive image.

## 4. Deletion on request / account removal

- When a provider is blacklisted or their account is removed, their KYC
  documents should be purged on the next retention run (they no longer sit in
  an active-retention state). A blacklist retains only the minimal identifiers
  needed to block re-registration (phone / ID number hash), never the image.
- A provider may request erasure of their KYC images; ops can purge on demand
  by removing the `KycDocument` rows and their Cloudinary assets.

## 5. Gaps / TODO before Tier 3 at scale

- [ ] Encryption-at-rest attestation from the storage provider (Cloudinary)
      documented; evaluate customer-managed keys for ID images.
- [ ] Audit log of every admin access to a signed KYC URL (who viewed which
      document, when).
- [ ] Purge KYC images immediately on blacklist rather than waiting for the
      daily run.
- [ ] Data Processing Agreement / privacy notice shown to providers at upload
      time, stating what is collected, why, and for how long.
- [ ] Legal review against Nepal data-protection requirements before holding
      citizenship IDs and video-KYC selfies at volume.
