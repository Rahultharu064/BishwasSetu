import { prisma }             from '../config/db'
import { moderateContent }    from '../utils/reviewModeration'
import { scoreAuthenticity }  from '../utils/reviewAuthenticity'
import { moderationQueue, trustQueue } from '../jobs/queue'
import type { CreateReviewInput, ProviderReplyInput } from '../validators/reviewValidator'

// ── POST /reviews ─────────────────────────────────────────────

export const createReview = async (
  customerId: string,
  input:      CreateReviewInput
) => {
  const { bookingId, rating, comment } = input

  // 1. Verify booking belongs to this customer and is COMPLETED
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      customerId:  true,
      providerId:  true,
      status:      true,
      completedAt: true,
    },
  })

  if (!booking) {
    throw { code: 'BOOKING_NOT_FOUND', message: 'Booking not found', status: 404 }
  }

  if (booking.customerId !== customerId) {
    throw { code: 'FORBIDDEN', message: 'Not your booking', status: 403 }
  }

  if (booking.status !== 'COMPLETED') {
    throw {
      code:    'BOOKING_NOT_COMPLETED',
      message: 'You can only review a completed booking',
      status:  400,
    }
  }

  // 2. Enforce 48-hour review window
  const hoursElapsed = booking.completedAt
    ? (Date.now() - booking.completedAt.getTime()) / (1000 * 60 * 60)
    : 0

  if (hoursElapsed > 48) {
    throw {
      code:    'REVIEW_WINDOW_EXPIRED',
      message: 'Review window has closed (48 hours after completion)',
      status:  400,
    }
  }

  // 3. Check review doesn't already exist
  const existingReview = await prisma.review.findUnique({
    where: { bookingId },
  })

  if (existingReview) {
    throw {
      code:    'REVIEW_ALREADY_EXISTS',
      message: 'You have already reviewed this booking',
      status:  409,
    }
  }

  // 4. Create review — hidden until moderation + authenticity pass
  const review = await prisma.review.create({
    data: {
      bookingId,
      customerId,
      providerId:   booking.providerId,
      rating,
      comment,
      isVisible:    false,    // hidden until AI screening passes
      isAuthentic:  null,     // null = pending
    },
  })

  // 5. Enqueue async moderation + authenticity job
  await moderationQueue.add(
    'screen-review',
    {
      reviewId:           review.id,
      text:               comment ?? `${rating} star review`,
      customerId,
      providerId:         booking.providerId,
      bookingId,
      submittedAt:        new Date().toISOString(),
      bookingCompletedAt: booking.completedAt?.toISOString(),
    },
    { attempts: 3, backoff: { type: 'fixed', delay: 2000 } }
  )

  return {
    reviewId: review.id,
    status:   'pending_screening',
    message:  'Review submitted. It will appear after verification.',
  }
}

// ── POST /reviews/:id/reply ───────────────────────────────────

export const addProviderReply = async (
  reviewId:   string,
  providerId: string,
  input:      ProviderReplyInput
) => {
  const review = await prisma.review.findUnique({
    where:  { id: reviewId },
    select: {
      providerId:    true,
      providerReply: true,
      isVisible:     true,
    },
  })

  if (!review) {
    throw { code: 'REVIEW_NOT_FOUND', message: 'Review not found', status: 404 }
  }

  if (review.providerId !== providerId) {
    throw { code: 'FORBIDDEN', message: 'Not your review', status: 403 }
  }

  if (!review.isVisible) {
    throw {
      code:    'REVIEW_NOT_VISIBLE',
      message: 'Cannot reply to a review that is pending moderation',
      status:  400,
    }
  }

  if (review.providerReply) {
    throw {
      code:    'REPLY_ALREADY_EXISTS',
      message: 'You have already replied to this review',
      status:  409,
    }
  }

  // Moderate the reply too
  const modResult = await moderateContent(input.reply)

  if (!modResult.passed) {
    throw {
      code:    'CONTENT_MODERATION_FAILED',
      message: 'Your reply contains inappropriate content. Please revise it.',
      status:  400,
    }
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data:  { providerReply: input.reply },
  })

  return { review: updated, message: 'Reply added' }
}

// ── GET /providers/:id/reviews ────────────────────────────────

export const getProviderReviews = async (
  providerId: string,
  params: { page: number; limit: number; rating?: number }
) => {
  const { page, limit, rating } = params
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {
    providerId,
    isVisible: true,
  }
  if (rating) where.rating = rating

  const [reviews, total, stats] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id:             true,
        rating:         true,
        comment:        true,
        providerReply:  true,
        isAuthentic:    true,
        createdAt:      true,
        customer:       { select: { name: true } },
      },
    }),
    prisma.review.count({ where }),
    // Rating distribution
    prisma.review.groupBy({
      by:     ['rating'],
      where:  { providerId, isVisible: true },
      _count: { rating: true },
    }),
  ])

  const distribution = [1, 2, 3, 4, 5].reduce(
    (acc, r) => ({
      ...acc,
      [r]: stats.find((s) => s.rating === r)?._count.rating ?? 0,
    }),
    {} as Record<number, number>
  )

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  return {
    reviews,
    stats: { total, avgRating: Math.round(avgRating * 10) / 10, distribution },
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

// ── Internal: process review after screening ──────────────────
// Called by the Bull worker after moderation + authenticity checks

export const processReviewScreening = async (params: {
  reviewId:           string
  text:               string
  customerId:         string
  providerId:         string
  bookingId:          string
  submittedAt:        string
  bookingCompletedAt: string | undefined
}) => {
  const {
    reviewId, text, customerId, providerId,
    bookingId, submittedAt, bookingCompletedAt,
  } = params

  // 1. Content moderation
  const modResult = await moderateContent(text)

  // 2. Authenticity scoring
  const authResult = await scoreAuthenticity({
    customerId,
    providerId,
    bookingId,
    comment:            text,
    submittedAt:        new Date(submittedAt),
    bookingCompletedAt: bookingCompletedAt
      ? new Date(bookingCompletedAt)
      : new Date(),
  })

  // 3. Decision
  const isVisible   = modResult.passed && authResult.passed
  const isAuthentic = authResult.passed

  // 4. Update review
  await prisma.review.update({
    where: { id: reviewId },
    data: {
      isVisible,
      isAuthentic,
      authenticityScore: authResult.score,
    },
  })

  // 5. Log to moderation log
  await prisma.moderationLog.create({
    data: {
      entityType: 'review',
      entityId:   reviewId,
      result:     modResult.passed ? 'PASSED' : 'FLAGGED',
      category:   modResult.category,
      confidence: modResult.confidence,
    },
  })

  // 6. If review is visible → trigger trust score recompute
  if (isVisible) {
    await trustQueue.add(
      'recompute-trust',
      { providerId, trigger: 'review_submitted' },
      { attempts: 3 }
    )
  }

  console.log(
    `📝 Review ${reviewId}: ` +
    `moderation=${modResult.passed ? 'PASSED' : 'FLAGGED'}, ` +
    `authenticity=${authResult.score.toFixed(2)}, ` +
    `visible=${isVisible}`
  )

  return { isVisible, isAuthentic, modResult, authResult }
}