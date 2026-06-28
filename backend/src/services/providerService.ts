import { prisma } from '../config/db'
import { resolveExperienceBadge } from '../utils/badge'
import { uploadToCloudinary } from '../utils/cloudinary'
import type { CompleteProfileInput, UpdateProviderInput } from '../validators/providervalidator'

// ── GET /providers/me ─────────────────────────────────────────

export const getMyProfile = async (providerId: string) => {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: {
      user:         { select: { id: true, name: true, email: true, phone: true } },
      skills:       true,
      categories:   { include: { category: true } },
      availability: true,
      badges:       { where: { status: 'ACTIVE' } },
      wallet:       true,
    },
  })

  if (!provider) {
    throw { code: 'PROVIDER_NOT_FOUND', message: 'Provider not found', status: 404 }
  }

  return provider
}

// ── POST /providers/profile/complete ─────────────────────────

export const completeProfile = async (
  providerId: string,
  input:      CompleteProfileInput
) => {
  const {
    legalName, bio, serviceArea,
    experienceYears, skills, categoryIds, availability,
  } = input

  const badge = resolveExperienceBadge(experienceYears)

  // Verify categories exist
  const validCategories = await prisma.category.findMany({
    where: { id: { in: categoryIds }, isActive: true },
    select: { id: true },
  })

  if (validCategories.length !== categoryIds.length) {
    throw { code: 'INVALID_CATEGORY', message: 'One or more category IDs are invalid', status: 400 }
  }

  // Transaction: update provider + replace skills/categories/availability
  const provider = await prisma.$transaction(async (tx) => {
    // Update core profile
    const updated = await tx.provider.update({
      where: { id: providerId },
      data: {
        legalName,
        bio,
        serviceArea,
        experienceYears,
        experienceBadge: badge,
        // Move status to PENDING_DOCUMENTS if INCOMPLETE
        kycStatus: 'PENDING_DOCUMENTS',
      },
    })

    // Replace skills
    await tx.providerSkill.deleteMany({ where: { providerId } })
    await tx.providerSkill.createMany({
      data: skills.map((skill) => ({ providerId, skill })),
    })

    // Replace categories
    await tx.providerCategory.deleteMany({ where: { providerId } })
    await tx.providerCategory.createMany({
      data: categoryIds.map((categoryId) => ({ providerId, categoryId })),
    })

    // Replace availability
    await tx.providerAvailability.deleteMany({ where: { providerId } })
    await tx.providerAvailability.createMany({
      data: availability.map((slot) => ({ providerId, ...slot })),
    })

    return updated
  })

  return {
    providerId:      provider.id,
    kycStatus:       provider.kycStatus,
    experienceBadge: provider.experienceBadge,
    message:         'Profile saved. Please upload KYC documents.',
  }
}

// ── PUT /providers/me ─────────────────────────────────────────

export const updateProfile = async (
  providerId: string,
  input:      UpdateProviderInput
) => {
  const { skills, categoryIds, availability, experienceYears, ...rest } = input

  const updateData: Record<string, unknown> = { ...rest }

  if (experienceYears !== undefined) {
    updateData.experienceYears  = experienceYears
    updateData.experienceBadge  = resolveExperienceBadge(experienceYears)
  }

  await prisma.$transaction(async (tx) => {
    await tx.provider.update({
      where: { id: providerId },
      data:  updateData,
    })

    if (skills) {
      await tx.providerSkill.deleteMany({ where: { providerId } })
      await tx.providerSkill.createMany({
        data: skills.map((skill) => ({ providerId, skill })),
      })
    }

    if (categoryIds) {
      await tx.providerCategory.deleteMany({ where: { providerId } })
      await tx.providerCategory.createMany({
        data: categoryIds.map((categoryId) => ({ providerId, categoryId })),
      })
    }

    if (availability) {
      await tx.providerAvailability.deleteMany({ where: { providerId } })
      await tx.providerAvailability.createMany({
        data: availability.map((slot) => ({ providerId, ...slot })),
      })
    }
  })

  return { message: 'Profile updated successfully' }
}

// ── GET /providers/me/dashboard ───────────────────────────────

export const getDashboard = async (providerId: string) => {
  const [provider, bookingStats, recentBookings, wallet] = await Promise.all([
    prisma.provider.findUnique({
      where:  { id: providerId },
      select: {
        id:              true,
        legalName:       true,
        trustScore:      true,
        kycStatus:       true,
        experienceBadge: true,
        profilePhoto:    true,
        badges:          { where: { status: 'ACTIVE' }, select: { badgeType: true } },
      },
    }),

    // Booking counts by status
    prisma.booking.groupBy({
      by:     ['status'],
      where:  { providerId },
      _count: { status: true },
    }),

    // 5 most recent bookings
    prisma.booking.findMany({
      where:   { providerId },
      orderBy: { createdAt: 'desc' },
      take:    5,
      include: {
        customer: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),

    // Credit wallet
    prisma.creditWallet.findUnique({
      where: { providerId },
    }),
  ])

  if (!provider) {
    throw { code: 'PROVIDER_NOT_FOUND', message: 'Provider not found', status: 404 }
  }

  // Compute total earnings (sum of completed booking commissions)
  const earningsResult = await prisma.booking.aggregate({
    where:  { providerId, status: 'COMPLETED' },
    _sum:   { priceNpr: true, commission: true },
    _count: { id: true },
  })

  const totalRevenue    = earningsResult._sum.priceNpr   ?? 0
  const totalCommission = earningsResult._sum.commission  ?? 0
  const totalEarnings   = totalRevenue - totalCommission
  const totalCompleted  = earningsResult._count.id

  // Trust score trend (last 10 events)
  const trustTrend = await prisma.trustScoreEvent.findMany({
    where:   { providerId },
    orderBy: { createdAt: 'desc' },
    take:    10,
    select:  { score: true, trigger: true, createdAt: true },
  })

  // Flatten booking stats
  const stats = bookingStats.reduce(
    (acc, s) => ({ ...acc, [s.status]: s._count.status }),
    {} as Record<string, number>
  )

  return {
    provider,
    stats: {
      requested:  stats.REQUESTED  ?? 0,
      accepted:   stats.ACCEPTED   ?? 0,
      inProgress: stats.IN_PROGRESS ?? 0,
      completed:  totalCompleted,
      rejected:   stats.REJECTED   ?? 0,
    },
    earnings: {
      totalRevenue,
      totalCommission,
      totalEarnings,
    },
    recentBookings,
    creditBalance: wallet?.balance ?? 0,
    trustTrend:    trustTrend.reverse(),   // oldest → newest
  }
}

// ── GET /providers/:id (public profile) ───────────────────────

export const getPublicProfile = async (providerId: string) => {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId, kycStatus: 'VERIFIED' },
    include: {
      user:       { select: { name: true } },
      skills:     true,
      categories: { include: { category: true } },
      availability: true,
      badges:     { where: { status: 'ACTIVE' } },
      reviews: {
        where:   { isVisible: true },
        orderBy: { createdAt: 'desc' },
        take:    10,
        include: { customer: { select: { name: true } } },
      },
    },
  })

  if (!provider) {
    throw { code: 'PROVIDER_NOT_FOUND', message: 'Provider not found', status: 404 }
  }

  // Get trust score breakdown
  const lastEvent = await prisma.trustScoreEvent.findFirst({
    where:   { providerId },
    orderBy: { createdAt: 'desc' },
    select:  { inputs: true, aiFlags: true, last_computed: true },
  })

  return { provider, trustBreakdown: lastEvent?.inputs ?? null }
}

// ── GET /providers (search + AI rank) ────────────────────────

export const searchProviders = async (params: {
  q?:          string
  category?:   string
  serviceArea?: string
  trustMin?:   number
  sort?:       string
  page:        number
  limit:       number
}) => {
  const { q, category, serviceArea, trustMin = 0, page = 1, limit = 10 } = params
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {
    kycStatus:  'VERIFIED',
    trustScore: { gte: trustMin },
    deletedAt:  null,
  }

  if (serviceArea) where.serviceArea = { contains: serviceArea }

  if (category) {
    where.categories = {
      some: { category: { name: { contains: category } } },
    }
  }

  const [providers, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      skip,
      take: limit,
      orderBy: { trustScore: 'desc' },   // base: trust score
      include: {
        user:       { select: { name: true } },
        skills:     true,
        categories: { include: { category: true } },
        badges:     { where: { status: 'ACTIVE' } },
      },
    }),
    prisma.provider.count({ where }),
  ])

  // If query string provided — rerank by embedding cosine similarity
  // (embedding reranking logic is in src/utils/cosine.ts — Step 6)
  // For now returns trust-score-ranked results

  return {
    providers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// ── Upload profile photo ──────────────────────────────────────

export const uploadProfilePhoto = async (
  providerId: string,
  buffer:     Buffer,
  mimetype:   string
) => {
  const ext      = mimetype.split('/')[1]
  const filename = `provider_${providerId}_avatar_${Date.now()}`

  const result = await uploadToCloudinary(
    buffer,
    'bishwassetu/avatars',
    filename,
    { transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] }
  )

  await prisma.provider.update({
    where: { id: providerId },
    data:  { profilePhoto: result.secureUrl },
  })

  return { profilePhoto: result.secureUrl }
}