import { prisma } from '../config/db'

export interface AuthenticityResult {
  score:   number     // 0–1, higher = more authentic
  passed:  boolean    // true if score ≥ threshold
  flags:   string[]   // specific signals that lowered the score
}

const AUTHENTICITY_THRESHOLD = 0.50

export const scoreAuthenticity = async (params: {
  customerId:  string
  providerId:  string
  bookingId:   string
  comment:     string | undefined
  submittedAt: Date
  bookingCompletedAt: Date
}): Promise<AuthenticityResult> => {
  const {
    customerId, providerId, bookingId,
    comment, submittedAt, bookingCompletedAt,
  } = params

  const flags: string[] = []
  let score = 1.0

  // ── Signal 1: Time-to-submit ─────────────────────────────────
  // Reviews submitted within 30 seconds are suspicious
  const secondsToSubmit =
    (submittedAt.getTime() - bookingCompletedAt.getTime()) / 1000

  if (secondsToSubmit < 30) {
    flags.push('Review submitted suspiciously fast (< 30s after completion)')
    score -= 0.30
  } else if (secondsToSubmit < 120) {
    score -= 0.10
  }

  // ── Signal 2: Review ring detection ──────────────────────────
  // Check if this customer has reviewed multiple providers in the same
  // 72-hour window, and those providers reviewed each other
  const seventyTwoHoursAgo = new Date(submittedAt.getTime() - 72 * 60 * 60 * 1000)

  const recentReviews = await prisma.review.findMany({
    where: {
      customerId,
      createdAt: { gte: seventyTwoHoursAgo },
      id:        { not: bookingId },
    },
    select: { providerId: true },
  })

  if (recentReviews.length >= 4) {
    flags.push(`Customer submitted ${recentReviews.length} reviews in 72 hours`)
    score -= 0.25
  }

  // ── Signal 3: Duplicate comment detection ─────────────────────
  // Check if the same comment text was used in another review by this customer
  if (comment && comment.length > 20) {
    const duplicate = await prisma.review.findFirst({
      where: {
        customerId,
        comment: { contains: comment.slice(0, 30) },
        bookingId: { not: bookingId },
      },
    })

    if (duplicate) {
      flags.push('Duplicate comment text detected from same customer')
      score -= 0.30
    }
  }

  // ── Signal 4: Customer has never booked this provider before ──
  // (Should never happen — review is gated on booking — but defensive check)
  const bookingExists = await prisma.booking.findFirst({
    where: {
      id:         bookingId,
      customerId,
      providerId,
      status:     'COMPLETED',
    },
  })

  if (!bookingExists) {
    flags.push('No completed booking found for this customer-provider pair')
    score -= 0.50
  }

  // ── Signal 5: Generic/empty comment on 5-star review ─────────
  if (!comment || comment.length < 15) {
    // Not a hard flag — short reviews are common
    score -= 0.05
  }

  const finalScore = Math.max(0, Math.min(1, score))

  return {
    score:  finalScore,
    passed: finalScore >= AUTHENTICITY_THRESHOLD,
    flags,
  }
}