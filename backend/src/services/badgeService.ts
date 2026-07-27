/**
 * Trust Badge service — PRD §4.3.
 *
 * Lifecycle: provider pays a fee → payment verified with the gateway → badge
 * created as PENDING → admin verifies (→ ACTIVE, with an expiry for annual
 * badges) or rejects (→ REJECTED). A daily job expires lapsed badges.
 *
 * Badges are display-only trust signals; they never alter the numeric trust
 * score (kept performance-earned per PRD §7).
 */
import { prisma } from '../config/db'
import { features } from '../config/features'
import { verifyKhaltiPayment, verifyEsewaPayment } from '../utils/payment'
import { uploadToCloudinary, getSignedUrl } from '../utils/cloudinary'
import { BADGE_CATALOG, isPurchasableBadge, type PurchasableBadge } from '../config/badgeCatalog'
import type { PurchaseBadgeInput } from '../validators/badgeValidator'

const featureGuard = () => {
  if (!features.trustBadges) {
    throw { code: 'FEATURE_DISABLED', message: 'Trust badges are not available right now', status: 503 }
  }
}

// ── GET /badges/catalog ────────────────────────────────────────
export const getBadgeCatalog = async () => {
  featureGuard()
  return Object.values(BADGE_CATALOG)
}

// ── GET /badges/me ─────────────────────────────────────────────
export const getMyBadges = async (providerId: string) => {
  const badges = await prisma.providerBadge.findMany({
    where: { providerId },
    orderBy: { purchasedAt: 'desc' },
    select: {
      id: true,
      badgeType: true,
      status: true,
      amountNpr: true,
      expiresAt: true,
      rejectionReason: true,
      reviewedAt: true,
      purchasedAt: true,
    },
  })
  return badges
}

// ── POST /badges/document (insurance doc upload) ───────────────
export const uploadBadgeDocument = async (
  providerId: string,
  buffer: Buffer,
  mimetype: string
) => {
  featureGuard()
  const ext = mimetype.split('/')[1] ?? 'file'
  const filename = `badge_${providerId}_insurance_${Date.now()}`
  const result = await uploadToCloudinary(buffer, 'bishwassetu/badges', filename, {
    type: 'authenticated', // restricted delivery — signed URLs only
  })
  return {
    documentUrl: result.secureUrl,
    documentId: result.publicId,
    fileType: ext,
  }
}

// ── POST /badges/purchase ──────────────────────────────────────
export const purchaseBadge = async (
  providerId: string,
  input: PurchaseBadgeInput
) => {
  featureGuard()

  const { badgeType, paymentMethod, paymentRef, documentUrl, documentId } = input

  if (!isPurchasableBadge(badgeType)) {
    throw { code: 'INVALID_BADGE', message: 'This badge cannot be purchased', status: 400 }
  }
  const spec = BADGE_CATALOG[badgeType as PurchasableBadge]

  // Insurance requires a supporting document.
  if (spec.requiresDocument && !documentUrl) {
    throw {
      code: 'DOCUMENT_REQUIRED',
      message: 'Upload your insurance document before purchasing the Insured badge',
      status: 400,
    }
  }

  // Idempotency — a gateway ref is processed once.
  const dupPayment = await prisma.providerBadge.findFirst({
    where: { paymentRef },
  })
  if (dupPayment) {
    throw { code: 'DUPLICATE_PAYMENT', message: 'This payment has already been processed', status: 409 }
  }

  // Block a second badge of the same type while one is ACTIVE or PENDING.
  const existing = await prisma.providerBadge.findFirst({
    where: { providerId, badgeType, status: { in: ['ACTIVE', 'PENDING'] } },
  })
  if (existing) {
    throw {
      code: 'BADGE_ALREADY_HELD',
      message:
        existing.status === 'ACTIVE'
          ? `You already hold the ${spec.label} badge`
          : `Your ${spec.label} badge is already awaiting verification`,
      status: 409,
    }
  }

  // Verify the payment server-side (never trust the client).
  const verification =
    paymentMethod === 'KHALTI'
      ? await verifyKhaltiPayment(paymentRef)
      : await verifyEsewaPayment(paymentRef)

  if (!verification.verified) {
    throw {
      code: 'PAYMENT_VERIFICATION_FAILED',
      message: 'Payment could not be verified. Please try again or contact support.',
      status: 402,
    }
  }

  // Guard against underpayment (amountPaisa is in paisa; fee is in NPR).
  if (verification.amountPaisa != null && verification.amountPaisa < spec.priceNpr * 100) {
    throw {
      code: 'UNDERPAID',
      message: `Payment of NPR ${spec.priceNpr} is required for the ${spec.label} badge.`,
      status: 402,
    }
  }

  const badge = await prisma.providerBadge.create({
    data: {
      providerId,
      badgeType,
      status: 'PENDING',
      amountNpr: spec.priceNpr,
      paymentMethod,
      paymentRef: verification.gatewayTxnId ?? paymentRef,
      documentUrl: documentUrl ?? null,
      documentId: documentId ?? null,
    },
    select: { id: true, badgeType: true, status: true, amountNpr: true, purchasedAt: true },
  })

  return {
    badge,
    message: `${spec.label} badge purchased. It will appear on your profile once our team verifies it (usually within a day).`,
  }
}

// ── ADMIN: GET /badges/admin/pending ───────────────────────────
export const getPendingBadges = async (params: { page: number; limit: number }) => {
  const { page, limit } = params
  const skip = (page - 1) * limit

  const [badges, total] = await Promise.all([
    prisma.providerBadge.findMany({
      where: { status: 'PENDING' },
      skip,
      take: limit,
      orderBy: { purchasedAt: 'asc' }, // oldest first — FIFO review queue
      include: {
        provider: {
          select: {
            id: true,
            legalName: true,
            kycTier: true,
            trustScore: true,
            user: { select: { name: true, phone: true } },
          },
        },
      },
    }),
    prisma.providerBadge.count({ where: { status: 'PENDING' } }),
  ])

  // Refresh signed URLs for any attached (restricted) documents.
  const items = badges.map((b) => ({
    ...b,
    documentUrl: b.documentId ? getSignedUrl(b.documentId) : b.documentUrl,
    catalog: isPurchasableBadge(b.badgeType) ? BADGE_CATALOG[b.badgeType] : null,
  }))

  return { badges: items, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }
}

// ── ADMIN: PUT /badges/admin/:id/verify ────────────────────────
export const verifyBadge = async (badgeId: string, adminId: string) => {
  const badge = await prisma.providerBadge.findUnique({ where: { id: badgeId } })
  if (!badge) throw { code: 'BADGE_NOT_FOUND', message: 'Badge not found', status: 404 }
  if (badge.status !== 'PENDING') {
    throw { code: 'INVALID_STATE', message: `Cannot verify a ${badge.status} badge`, status: 409 }
  }

  const spec = isPurchasableBadge(badge.badgeType) ? BADGE_CATALOG[badge.badgeType] : null
  const expiresAt =
    spec?.validityDays != null
      ? new Date(Date.now() + spec.validityDays * 24 * 60 * 60 * 1000)
      : null

  const updated = await prisma.providerBadge.update({
    where: { id: badgeId },
    data: { status: 'ACTIVE', verifiedBy: adminId, reviewedAt: new Date(), expiresAt },
    select: { id: true, badgeType: true, status: true, expiresAt: true, providerId: true },
  })

  return { badge: updated, message: `${spec?.label ?? badge.badgeType} badge is now active.` }
}

// ── ADMIN: PUT /badges/admin/:id/reject ────────────────────────
export const rejectBadge = async (badgeId: string, adminId: string, reason: string) => {
  const badge = await prisma.providerBadge.findUnique({ where: { id: badgeId } })
  if (!badge) throw { code: 'BADGE_NOT_FOUND', message: 'Badge not found', status: 404 }
  if (badge.status !== 'PENDING') {
    throw { code: 'INVALID_STATE', message: `Cannot reject a ${badge.status} badge`, status: 409 }
  }

  const updated = await prisma.providerBadge.update({
    where: { id: badgeId },
    data: { status: 'REJECTED', verifiedBy: adminId, reviewedAt: new Date(), rejectionReason: reason },
    select: { id: true, badgeType: true, status: true, rejectionReason: true, providerId: true },
  })

  return { badge: updated, message: 'Badge verification rejected. The provider has been notified.' }
}

// ── Internal: expire lapsed badges (called by the maintenance job) ──
export const expireLapsedBadges = async (): Promise<number> => {
  const res = await prisma.providerBadge.updateMany({
    where: { status: 'ACTIVE', expiresAt: { not: null, lt: new Date() } },
    data: { status: 'EXPIRED' },
  })
  return res.count
}
