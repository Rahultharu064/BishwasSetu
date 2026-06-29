import { prisma } from '../config/db'
import { Prisma } from '@prisma/client'
import { groq, GROQ_MODELS } from '../config/groq'

// ── Weight constants (from PRD Section 5.8) ───────────────────
const WEIGHTS = {
  REVIEW_AVG:          0.40,
  TIMELINESS:          0.20,
  COMPLAINT_PENALTY:  -0.20,
  VERIFICATION:        0.10,
  VOUCHES:             0.10,
}

const DECAY_RATE_PER_MONTH  = 2      // points per month after 60 days idle
const DECAY_IDLE_THRESHOLD  = 60     // days before decay starts
const HIGH_REJECTION_PENALTY = 5     // trust points deducted for >30% rejection rate

export interface TrustBreakdown {
  reviewAvg:          number
  reviewCount:        number
  timelinessRate:     number
  complaintRatio:     number
  verificationScore:  number
  vouchScore:         number
  decayPenalty:       number
  rejectionPenalty:   number
  rawScore:           number
  finalScore:         number
}

// ── Compute base trust score ──────────────────────────────────

export const computeTrustScore = async (
  providerId: string
): Promise<TrustBreakdown> => {

  const now = new Date()

  // 1. Reviews (recency-weighted)
  const reviews = await prisma.review.findMany({
    where:   { providerId, isVisible: true },
    select:  { rating: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  let reviewAvg = 0
  if (reviews.length > 0) {
    // Recency weighting: recent reviews count more
    // Weight = 1 / (1 + months since review)
    let weightedSum   = 0
    let totalWeight   = 0

    for (const r of reviews) {
      const monthsAgo = (now.getTime() - r.createdAt.getTime()) /
                        (1000 * 60 * 60 * 24 * 30)
      const weight    = 1 / (1 + monthsAgo)
      weightedSum    += r.rating * weight
      totalWeight    += weight
    }

    // Normalize to 0–1 scale (rating is 1–5)
    reviewAvg = totalWeight > 0
      ? (weightedSum / totalWeight - 1) / 4
      : 0
  }

  // 2. Timeliness (on-time acceptance rate)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [totalRequested, acceptedOnTime] = await Promise.all([
    prisma.booking.count({
      where: {
        providerId,
        createdAt: { gte: thirtyDaysAgo },
        status:    { in: ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'] },
      },
    }),
    prisma.booking.count({
      where: {
        providerId,
        status:    'ACCEPTED',
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
  ])

  const timelinessRate = totalRequested > 0
    ? acceptedOnTime / totalRequested
    : 0.5   // neutral default if no data

  // 3. Complaint ratio
  const [totalBookings, upheldComplaints] = await Promise.all([
    prisma.booking.count({
      where: { providerId, status: 'COMPLETED' },
    }),
    prisma.complaint.count({
      where: { providerId, status: 'RESOLVED' },
    }),
  ])

  const complaintRatio = totalBookings > 0
    ? Math.min(upheldComplaints / totalBookings, 1)
    : 0

  // 4. Verification score
  const provider = await prisma.provider.findUnique({
    where:  { id: providerId },
    select: {
      identityStatus: true,   // identity KYC — booking-access gate
      skillStatus:    true,   // skill evidence — additive trust signal
      badges:         { where: { status: 'ACTIVE' }, select: { badgeType: true } },
      skills:         { select: { skill: true } },
      bio:            true,
      profilePhoto:   true,
    },
  })

  let verificationScore = 0
  // Identity verification — base requirement (50%)
  if (provider?.identityStatus === 'VERIFIED')  verificationScore += 0.50
  // Skill verification — additional credibility layer (20%)
  if (provider?.skillStatus === 'VERIFIED')      verificationScore += 0.20
  // Profile completeness signals
  if ((provider?.badges.length ?? 0) > 0)        verificationScore += 0.15
  if (provider?.bio)                              verificationScore += 0.10
  if (provider?.profilePhoto)                     verificationScore += 0.05
  verificationScore = Math.min(verificationScore, 1.0)

  // 5. Community vouch score
  const vouches = await prisma.vouch.findMany({
    where: { voucheeId: providerId },
    select: { weight: true },
  })

  const vouchScore = vouches.length > 0
    ? Math.min(vouches.reduce((sum, v) => sum + v.weight, 0) / 5, 1)
    : 0   // capped at 5 full-trust vouches = 100%

  // 6. Decay penalty
  const lastBooking = await prisma.booking.findFirst({
    where:   { providerId, status: { in: ['ACCEPTED', 'COMPLETED'] } },
    orderBy: { createdAt: 'desc' },
    select:  { createdAt: true },
  })

  let decayPenalty = 0
  if (lastBooking) {
    const daysIdle = (now.getTime() - lastBooking.createdAt.getTime()) /
                     (1000 * 60 * 60 * 24)

    if (daysIdle > DECAY_IDLE_THRESHOLD) {
      const monthsIdle = (daysIdle - DECAY_IDLE_THRESHOLD) / 30
      decayPenalty     = Math.round(monthsIdle * DECAY_RATE_PER_MONTH)
    }
  }

  // 7. Rejection penalty
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const [recentTotal, recentRejected] = await Promise.all([
    prisma.booking.count({
      where: {
        providerId,
        createdAt: { gte: ninetyDaysAgo },
        status:    { in: ['ACCEPTED', 'REJECTED', 'COMPLETED'] },
      },
    }),
    prisma.booking.count({
      where: {
        providerId,
        createdAt: { gte: ninetyDaysAgo },
        status:    'REJECTED',
      },
    }),
  ])

  const rejectionPenalty =
    recentTotal >= 5 && recentRejected / recentTotal > 0.30
      ? HIGH_REJECTION_PENALTY
      : 0

  // 8. Compute raw score (0–100)
  const rawScore = (
    reviewAvg     * WEIGHTS.REVIEW_AVG         * 100 +
    timelinessRate * WEIGHTS.TIMELINESS         * 100 +
    complaintRatio * WEIGHTS.COMPLAINT_PENALTY  * 100 +
    verificationScore * WEIGHTS.VERIFICATION   * 100 +
    vouchScore    * WEIGHTS.VOUCHES             * 100
  )

  const finalScore = Math.max(
    0,
    Math.min(100, Math.round(rawScore - decayPenalty - rejectionPenalty))
  )

  return {
    reviewAvg:         Math.round(reviewAvg * 500) / 100,   // display as x/5
    reviewCount:       reviews.length,
    timelinessRate:    Math.round(timelinessRate * 100),
    complaintRatio:    Math.round(complaintRatio * 100),
    verificationScore: Math.round(verificationScore * 100),
    vouchScore:        Math.round(vouchScore * 100),
    decayPenalty,
    rejectionPenalty,
    rawScore:          Math.round(rawScore),
    finalScore,
  }
}

// ── Recompute and persist trust score ────────────────────────

export const recomputeAndSave = async (
  providerId: string,
  trigger:    string,
  aiFlags?:   Record<string, unknown>
): Promise<number> => {
  // Get current score
  const current = await prisma.provider.findUnique({
    where:  { id: providerId },
    select: { trustScore: true },
  })

  const prevScore = current?.trustScore ?? 0

  // Compute new score
  const breakdown = await computeTrustScore(providerId)
  const newScore  = breakdown.finalScore

  // Atomic update
  await prisma.$transaction([
    prisma.provider.update({
      where: { id: providerId },
      data:  { trustScore: newScore },
    }),
    prisma.trustScoreEvent.create({
      data: {
        providerId,
        score:     newScore,
        prevScore,
        trigger,
        inputs:    breakdown as object,
        aiFlags:   aiFlags ?? null,
        modelVer:  'bishwassetu-trust-v1',
      },
    }),
  ])

  // Recompute milestone badge (uses current completedBookings + new trustScore)
  const providerData = await prisma.provider.findUnique({
    where:  { id: providerId },
    select: { completedBookings: true },
  })

  if (providerData) {
    const { resolveMilestoneBadge } = await import('../utils/badge')
    const newBadge = resolveMilestoneBadge(providerData.completedBookings, newScore)

    await prisma.provider.update({
      where: { id: providerId },
      data:  { milestoneBadge: newBadge },
    })
  }

  console.log(
    `📊 Trust recompute [${trigger}] provider:${providerId} ` +
    `${prevScore} → ${newScore} (Δ${newScore - prevScore >= 0 ? '+' : ''}${newScore - prevScore})`
  )

  return newScore
}

// ── GET trust score with breakdown (public API) ───────────────

export const getTrustScore = async (providerId: string) => {
  const [provider, lastEvent, anomaly] = await Promise.all([
    prisma.provider.findUnique({
      where:  { id: providerId },
      select: {
        trustScore:       true,
        identityStatus:   true,
        skillStatus:      true,
        milestoneBadge:   true,
        completedBookings: true,
      },
    }),
    prisma.trustScoreEvent.findFirst({
      where:   { providerId },
      orderBy: { createdAt: 'desc' },
      select:  { inputs: true, aiFlags: true, createdAt: true, trigger: true },
    }),
    prisma.trustScoreEvent.findFirst({
      where:   { providerId, aiFlags: { not: Prisma.AnyNull } },
      orderBy: { createdAt: 'desc' },
      select:  { aiFlags: true },
    }),
  ])

  if (!provider) {
    throw { code: 'PROVIDER_NOT_FOUND', message: 'Provider not found', status: 404 }
  }

  if (provider.identityStatus !== 'VERIFIED') {
    return { score: null, status: 'pending', message: 'Trust score available after identity KYC approval' }
  }

  return {
    score:       provider.trustScore,
    breakdown:   lastEvent?.inputs ?? null,
    aiFlags:     anomaly?.aiFlags  ?? null,
    lastComputed: lastEvent?.createdAt ?? null,
    lastTrigger:  lastEvent?.trigger   ?? null,
  }
}

// ── GET trust score trend (last 10 events) ────────────────────

export const getTrustTrend = async (providerId: string) => {
  return prisma.trustScoreEvent.findMany({
    where:   { providerId },
    orderBy: { createdAt: 'desc' },
    take:    10,
    select:  { score: true, trigger: true, createdAt: true },
  })
}