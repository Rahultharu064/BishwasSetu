import { prisma }    from '../config/db'
import {
  notifyKycApproved,
  notifyKycRejected,
} from '../services/notificationsService'

// ── DASHBOARD SUMMARY ─────────────────────────────────────────

export const getDashboardSummary = async () => {
  const now            = new Date()
  const thirtyDaysAgo  = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo   = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    totalProviders,
    verifiedProviders,
    pendingKyc,
    totalBookings,
    completedBookings,
    openComplaints,
    criticalComplaints,
    revenueResult,
    newUsersThisWeek,
    bookingsThisMonth,
    avgTrustScore,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.provider.count(),
    prisma.provider.count({ where: { identityStatus: 'VERIFIED' } }),
    prisma.provider.count({ where: { identityStatus: 'UNDER_REVIEW' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.complaint.count({ where: { status: 'OPEN' } }),
    prisma.complaint.count({ where: { status: 'OPEN', aiCategory: 'critical' } }),
    prisma.booking.aggregate({
      where:  { status: 'COMPLETED' },
      _sum:   { commission: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.booking.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.provider.aggregate({
      where:  { identityStatus: 'VERIFIED' },
      _avg:   { trustScore: true },
    }),
  ])

  // Revenue breakdown this month
  const monthlyRevenue = await prisma.booking.aggregate({
    where:  { status: 'COMPLETED', completedAt: { gte: thirtyDaysAgo } },
    _sum:   { commission: true },
    _count: { id: true },
  })

  // Top categories by bookings
  const topCategories = await prisma.booking.groupBy({
    by:     ['categoryId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take:    5,
  })

  return {
    users: {
      total:       totalUsers,
      newThisWeek: newUsersThisWeek,
    },
    providers: {
      total:           totalProviders,
      verified:        verifiedProviders,
      pendingKycReview: pendingKyc,
      avgTrustScore:   Math.round(avgTrustScore._avg.trustScore ?? 0),
    },
    bookings: {
      total:        totalBookings,
      completed:    completedBookings,
      thisMonth:    bookingsThisMonth,
    },
    complaints: {
      open:     openComplaints,
      critical: criticalComplaints,
    },
    revenue: {
      totalCommissionNpr:   revenueResult._sum.commission ?? 0,
      monthlyCommissionNpr: monthlyRevenue._sum.commission ?? 0,
      monthlyBookings:      monthlyRevenue._count.id,
    },
  }
}

// ── REVENUE ANALYTICS ─────────────────────────────────────────

export const getRevenueAnalytics = async (params: {
  from:  string
  to:    string
}) => {
  const from = new Date(params.from)
  const to   = new Date(params.to)

  const [commission, credits, badges] = await Promise.all([
    // Booking commission
    prisma.booking.aggregate({
      where:  { status: 'COMPLETED', completedAt: { gte: from, lte: to } },
      _sum:   { commission: true },
      _count: { id: true },
    }),
    // Credit pack revenue
    prisma.creditPurchase.aggregate({
      where:  { status: 'COMPLETED', createdAt: { gte: from, lte: to } },
      _sum:   { amountNpr: true },
      _count: { id: true },
    }),
    // Badge revenue
    prisma.providerBadge.aggregate({
      where:  { status: 'ACTIVE', purchasedAt: { gte: from, lte: to } },
      _sum:   { amountNpr: true },
      _count: { id: true },
    }),
  ])

  const totalRevenue =
    (commission._sum.commission ?? 0) +
    (credits._sum.amountNpr    ?? 0) +
    (badges._sum.amountNpr     ?? 0)

  return {
    period: { from, to },
    streams: {
      commission: {
        totalNpr:      commission._sum.commission ?? 0,
        bookingsCount: commission._count.id,
      },
      credits: {
        totalNpr:      credits._sum.amountNpr ?? 0,
        purchasesCount: credits._count.id,
      },
      badges: {
        totalNpr:    badges._sum.amountNpr ?? 0,
        badgesCount: badges._count.id,
      },
    },
    totalRevenueNpr: totalRevenue,
  }
}

// ── BOOKINGS TREND (for dashboard bar chart) ──────────────────
// Daily booking volume for the last N days, zero-filled so the chart never
// has gaps. Raw SQL because Prisma's groupBy can't truncate a DateTime to a
// calendar day — DATE_FORMAT is MySQL-specific, consistent with the rest of
// this app's DB layer.

export const getBookingsTrend = async (days: number) => {
  const span = Math.min(Math.max(Math.trunc(days) || 14, 1), 90)

  const since = new Date()
  since.setUTCHours(0, 0, 0, 0)
  since.setUTCDate(since.getUTCDate() - (span - 1))

  const rows = await prisma.$queryRaw<{ day: string; total: bigint; completed: bigint }[]>`
    SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') AS day,
           COUNT(*) AS total,
           SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed
    FROM bookings
    WHERE createdAt >= ${since}
    GROUP BY day
    ORDER BY day ASC
  `

  const byDay = new Map(rows.map((r) => [r.day, r]))

  const points: { date: string; total: number; completed: number }[] = []
  for (let i = 0; i < span; i++) {
    const d = new Date(since)
    d.setUTCDate(since.getUTCDate() + i)
    const key = d.toISOString().slice(0, 10)
    const row = byDay.get(key)
    points.push({
      date:      key,
      total:     row ? Number(row.total) : 0,
      completed: row ? Number(row.completed) : 0,
    })
  }

  return points
}

// ── USER MANAGEMENT ───────────────────────────────────────────

export const getUsers = async (params: {
  role?:   string
  search?: string
  page:    number
  limit:   number
}) => {
  const { role, search, page, limit } = params
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { deletedAt: null }
  if (role) where.role = role
  if (search) {
    where.OR = [
      { name:  { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id:        true,
        name:      true,
        email:     true,
        phone:     true,
        role:      true,
        isActive:  true,
        createdAt: true,
        provider:  { select: { identityStatus: true, skillStatus: true, milestoneBadge: true, trustScore: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  return {
    users,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export const toggleUserStatus = async (userId: string, isActive: boolean) => {
  return prisma.user.update({
    where: { id: userId },
    data:  { isActive },
  })
}

// ── PROVIDER MANAGEMENT ───────────────────────────────────────

export const getProviders = async (params: {
  identityStatus?: string
  search?:    string
  page:       number
  limit:      number
}) => {
  const { identityStatus, search, page, limit } = params
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { deletedAt: null }
  if (identityStatus) where.identityStatus = identityStatus
  if (search) {
    where.OR = [
      { legalName:  { contains: search } },
      { serviceArea: { contains: search } },
    ]
  }

  const [providers, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user:       { select: { name: true, email: true, phone: true } },
        categories: { include: { category: { select: { name: true } } } },
        _count:     { select: { bookings: true } },
      },
    }),
    prisma.provider.count({ where }),
  ])

  return {
    providers,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

// ── KYC REVIEW QUEUE ──────────────────────────────────────────

export const getKycQueue = async (params: { page: number; limit: number }) => {
  const { page, limit } = params
  const skip = (page - 1) * limit

  const [pending, total] = await Promise.all([
    prisma.provider.findMany({
      where:   { identityStatus: 'UNDER_REVIEW' },
      skip,
      take:    limit,
      orderBy: { updatedAt: 'asc' },     // oldest first
      include: {
        user:        { select: { name: true, email: true, phone: true } },
        documents:   { select: { type: true, uploadedAt: true } },
        kycDecisions: {
          orderBy: { createdAt: 'desc' },
          take:    1,
          select: {
            confidence:  true,
            faceScore:   true,
            forgeryRisk: true,
            decision:    true,
            ocrResult:   true,
          },
        },
      },
    }),
    prisma.provider.count({ where: { identityStatus: 'UNDER_REVIEW' } }),
  ])

  return {
    queue: pending,
    total,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

// ── KYC APPROVE (with notification) ──────────────────────────

export const approveKyc = async (providerId: string, adminId: string) => {
  const provider = await prisma.provider.findUnique({
    where:  { id: providerId },
    select: { userId: true },
  })

  if (!provider) {
    throw { code: 'PROVIDER_NOT_FOUND', message: 'Provider not found', status: 404 }
  }

  await prisma.provider.update({
    where: { id: providerId },
    data:  { 
      identityStatus: 'VERIFIED', 
      identityRejectionReason: null,
      kycTier: 'TIER_3_VERIFIED', // Full identity verified gets Tier 3
    },
  })

  await prisma.kycAiDecision.updateMany({
    where: { providerId },
    data:  { adminOverride: 'APPROVE' },
  })

  // Notify provider
  await notifyKycApproved(provider.userId)

  return { message: 'KYC approved', providerId }
}

// ── KYC REJECT (with notification) ───────────────────────────

export const rejectKyc = async (
  providerId: string,
  reason:     string,
  adminId:    string
) => {
  if (!reason?.trim()) {
    throw { code: 'REASON_REQUIRED', message: 'Rejection reason is required', status: 400 }
  }

  const provider = await prisma.provider.findUnique({
    where:  { id: providerId },
    select: { userId: true },
  })

  if (!provider) {
    throw { code: 'PROVIDER_NOT_FOUND', message: 'Provider not found', status: 404 }
  }

  await prisma.provider.update({
    where: { id: providerId },
    data:  { identityStatus: 'REJECTED', identityRejectionReason: reason },
  })

  await prisma.kycAiDecision.updateMany({
    where: { providerId },
    data:  { adminOverride: 'REJECT' },
  })

  // Notify provider with reason
  await notifyKycRejected(provider.userId, reason)

  return { message: 'KYC rejected', providerId }
}

// ── KYC REQUEST INFO (with notification) ───────────────────────

export const requestInfoKyc = async (
  providerId: string,
  reason:     string,
  adminId:    string
) => {
  if (!reason?.trim()) {
    throw { code: 'REASON_REQUIRED', message: 'Request info reason is required', status: 400 }
  }

  const provider = await prisma.provider.findUnique({
    where:  { id: providerId },
    select: { userId: true },
  })

  if (!provider) {
    throw { code: 'PROVIDER_NOT_FOUND', message: 'Provider not found', status: 404 }
  }

  await prisma.provider.update({
    where: { id: providerId },
    data:  { 
      identityStatus: 'PENDING_DOCUMENTS', 
      identityRejectionReason: reason 
    },
  })

  await prisma.kycAiDecision.updateMany({
    where: { providerId },
    data:  { adminOverride: 'REJECT' },
  })

  // Requires a new notification type in notificationsService
  const { notifyKycRequestInfo } = await import('../services/notificationsService')
  await notifyKycRequestInfo(provider.userId, reason)

  return { message: 'KYC request info sent', providerId }
}

// ── KYC BLACKLIST ───────────────────────────────────────────────

export const blacklistKyc = async (
  providerId: string,
  adminId:    string
) => {
  const provider = await prisma.provider.findUnique({
    where:  { id: providerId },
    select: { userId: true },
  })

  if (!provider) {
    throw { code: 'PROVIDER_NOT_FOUND', message: 'Provider not found', status: 404 }
  }

  // Soft-ban by setting identityStatus to REJECTED or a specific banned flag
  // Based on PRD, "Phone + ID permanently blocked". We'll use REJECTED + a special rejection reason.
  // Given we don't have a BLACKLISTED enum value, we use REJECTED + 'BLACKLISTED' reason.
  await prisma.provider.update({
    where: { id: providerId },
    data:  { 
      identityStatus: 'REJECTED', 
      identityRejectionReason: 'BLACKLISTED',
      isAvailable: false,
    },
  })

  // Disable the underlying user account to prevent login
  await prisma.user.update({
    where: { id: provider.userId },
    data: { isActive: false },
  })

  // Wait to see if we should add BLACKLISTED to the enum? Since we can't easily modify prisma enum without another migration,
  // Let's use REJECTED + isActive=false as a strong ban.

  const { notifyKycBlacklisted } = await import('../services/notificationsService')
  await notifyKycBlacklisted(provider.userId)

  return { message: 'Provider blacklisted', providerId }
}

// ── SKILL EVIDENCE REVIEW QUEUE (v2.3) ───────────────────────
// Separate from identity KYC — non-blocking, always human-reviewed

export const getSkillEvidenceQueue = async (params: {
  status?: string
  page:    number
  limit:   number
}) => {
  const { status = 'PENDING', page, limit } = params
  const skip = (page - 1) * limit

  const [evidence, total] = await Promise.all([
    prisma.skillEvidence.findMany({
      where:   { reviewStatus: status },
      skip,
      take:    limit,
      orderBy: [
        { isPaidBadge: 'desc' },    // paid badge purchases get priority
        { createdAt:   'asc'  },    // oldest first within same priority
      ],
      include: {
        provider: {
          select: {
            id:             true,
            legalName:      true,
            trustScore:     true,
            identityStatus: true,
            skillStatus:    true,
            user:           { select: { name: true, phone: true } },
          },
        },
      },
    }),
    prisma.skillEvidence.count({ where: { reviewStatus: status } }),
  ])

  return {
    evidence,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export const approveSkillEvidence = async (
  evidenceId: string,
  adminId:    string
) => {
  const evidence = await prisma.skillEvidence.findUnique({
    where:  { id: evidenceId },
    select: { providerId: true, reviewStatus: true, type: true },
  })

  if (!evidence) {
    throw { code: 'EVIDENCE_NOT_FOUND', message: 'Skill evidence not found', status: 404 }
  }

  if (evidence.reviewStatus !== 'PENDING') {
    throw { code: 'ALREADY_REVIEWED', message: 'Evidence already reviewed', status: 400 }
  }

  // Set Tier 1 (if currently lower) or Tier 2 if it's a CTEVT certificate
  // Tier 2 is granted for certificates (PRD §3.1)
  const isCertificate = evidence.type === 'certificate'
  const newTier = isCertificate ? 'TIER_2_SKILLED' : 'TIER_1_BASIC'

  await prisma.$transaction(async (tx) => {
    await tx.skillEvidence.update({
      where: { id: evidenceId },
      data: {
        reviewStatus:     'APPROVED',
        authenticityTier: isCertificate ? 'TIER_2' : 'TIER_1',
        reviewedBy:       adminId,
        reviewedAt:       new Date(),
      },
    })

    // Update provider skillStatus to VERIFIED and promote KYC tier if needed
    // Assuming they are Tier 1 by default, promote to Tier 2 if certificate is approved
    const provider = await tx.provider.findUnique({ where: { id: evidence.providerId } })
    
    await tx.provider.update({
      where: { id: evidence.providerId },
      data:  { 
        skillStatus: 'VERIFIED',
        ...(provider?.kycTier === 'TIER_1_BASIC' && isCertificate && { kycTier: 'TIER_2_SKILLED' }),
      },
    })
  })

  // Trigger trust score recompute — skill verification now counts in completeness signal
  const { trustQueue } = await import('../jobs/queue')
  await trustQueue.add(
    'recompute-trust',
    { providerId: evidence.providerId, trigger: 'skill_evidence_approved' },
    { attempts: 3 }
  )

  return { message: `Skill evidence approved (${newTier})`, evidenceId }
}

export const rejectSkillEvidence = async (
  evidenceId: string,
  reason:     string,
  adminId:    string
) => {
  if (!reason?.trim()) {
    throw { code: 'REASON_REQUIRED', message: 'Rejection reason is required', status: 400 }
  }

  const evidence = await prisma.skillEvidence.findUnique({
    where:  { id: evidenceId },
    select: { providerId: true, reviewStatus: true },
  })

  if (!evidence) {
    throw { code: 'EVIDENCE_NOT_FOUND', message: 'Skill evidence not found', status: 404 }
  }

  await prisma.$transaction(async (tx) => {
    await tx.skillEvidence.update({
      where: { id: evidenceId },
      data: {
        reviewStatus:     'REJECTED',
        authenticityTier: 'NONE',
        rejectReason:     reason,
        reviewedBy:       adminId,
        reviewedAt:       new Date(),
      },
    })

    // Only reset skillStatus if this was the only approved evidence
    const hasOtherApproved = await tx.skillEvidence.count({
      where: {
        providerId:   evidence.providerId,
        reviewStatus: 'APPROVED',
        id:           { not: evidenceId },
      },
    })

    if (hasOtherApproved === 0) {
      await tx.provider.update({
        where: { id: evidence.providerId },
        data:  { skillStatus: 'SELF_DECLARED' },
      })
    }
  })

  return { message: 'Skill evidence rejected', evidenceId }
}



export const getTrustAnomalies = async () => {
  // Providers with anomaly flags in last trust score event
  return prisma.trustScoreEvent.findMany({
    where: {
      aiFlags:   { not : '[]' },
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
    take:    50,
    include: {
      provider: {
        select: {
          id:              true,
          legalName:       true,
          trustScore:      true,
          identityStatus:  true,
          skillStatus:     true,
          milestoneBadge:  true,
        },
      },
    },
  })
}

// ── FRAUD FLAG QUEUE ──────────────────────────────────────────

export const getFraudFlags = async (params: { page: number; limit: number }) => {
  const { page, limit } = params
  const skip = (page - 1) * limit

  const [flags, total] = await Promise.all([
    prisma.moderationLog.findMany({
      where:   { result: 'FLAGGED' },
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.moderationLog.count({ where: { result: 'FLAGGED' } }),
  ])

  return {
    flags,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export const resolveFraudFlag = async (flagId: string, adminId: string) => {
  // Mark as reviewed by updating result to 'REVIEWED'
  return prisma.moderationLog.update({
    where: { id: flagId },
    data:  { result: 'REVIEWED' },
  })
}