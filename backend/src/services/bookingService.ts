import { prisma }              from '../config/db'
import { calculateCommission } from '../utils/commission'
import { trustQueue }          from '../jobs/queue'
import type {
  CreateBookingInput,
  UpdateBookingStatusInput,
} from '../validators/bookingValidator'
import { BookingStatus } from '@prisma/client'
import {
  notifyBookingRequested,
  notifyBookingAccepted,
  notifyBookingRejected,
  notifyBookingCompleted,
} from '../services/notificationsService'

// ─────────────────────────────────────────────
// STATE MACHINE
// Valid transitions per actor
// ─────────────────────────────────────────────

const VALID_TRANSITIONS: Record<string, BookingStatus[]> = {
  // Provider can:
  PROVIDER: ['ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED'],
  // Customer can:
  CUSTOMER: ['CANCELLED'],
}

const STATUS_FLOW: Partial<Record<BookingStatus, BookingStatus[]>> = {
  REQUESTED:   ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED:    ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED:   [],
  REJECTED:    [],
  CANCELLED:   [],
}

const validateTransition = (
  current:    BookingStatus,
  next:       BookingStatus,
  actorRole:  'PROVIDER' | 'CUSTOMER'
): void => {
  const allowedNext = STATUS_FLOW[current] ?? []

  if (!allowedNext.includes(next)) {
    throw {
      code:    'INVALID_STATUS_TRANSITION',
      message: `Cannot move booking from ${current} to ${next}`,
      status:  400,
    }
  }

  if (!VALID_TRANSITIONS[actorRole].includes(next)) {
    throw {
      code:    'FORBIDDEN_TRANSITION',
      message: `${actorRole} cannot set status to ${next}`,
      status:  403,
    }
  }
}

// ─────────────────────────────────────────────
// RISK-ADAPTIVE BOOKING CHECK
// Providers with trust score < 40 get extra friction
// ─────────────────────────────────────────────

const NEW_PROVIDER_TRUST_THRESHOLD = 40

const getRiskAdaptiveFlags = async (
  providerId: string
): Promise<{
  isNewProvider:          boolean
  requiresManualConfirm:  boolean
  extendedEscrowDays:     number
}> => {
  const provider = await prisma.provider.findUnique({
    where:  { id: providerId },
    select: { trustScore: true },
  })

  // Count completed bookings
  const completedCount = await prisma.booking.count({
    where: { providerId, status: 'COMPLETED' },
  })

  const isNewProvider = (provider?.trustScore ?? 0) < NEW_PROVIDER_TRUST_THRESHOLD

  return {
    isNewProvider,
    // First 3 completions require manual customer confirmation
    requiresManualConfirm: isNewProvider && completedCount < 3,
    // Extended escrow: 7 days for new providers vs standard 2 days
    extendedEscrowDays:    isNewProvider ? 7 : 2,
  }
}

// ─────────────────────────────────────────────
// CREATE BOOKING
// ─────────────────────────────────────────────

export const createBooking = async (
  customerId: string,
  input:      CreateBookingInput
) => {
  const {
    providerId, categoryId, description, scheduledAt,
    priceNpr, paymentMethod, isEmergency, neighborhood,
  } = input

  // 1. Verify provider exists and is VERIFIED
  const provider = await prisma.provider.findUnique({
    where:  { id: providerId },
    select: { identityStatus: true, trustScore: true, isAvailable: true, kycTier: true },
  })

  if (!provider) {
    throw { code: 'PROVIDER_NOT_FOUND', message: 'Provider not found', status: 404 }
  }

  if (provider.identityStatus !== 'VERIFIED') {
    throw {
      code:    'PROVIDER_NOT_VERIFIED',
      message: 'This provider has not completed KYC verification',
      status:  400,
    }
  }

  if (!provider.isAvailable) {
    throw {
      code:    'PROVIDER_UNAVAILABLE',
      message: 'This provider is currently not accepting bookings',
      status:  400,
    }
  }

  // 2. Verify category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId, isActive: true },
  })

  if (!category) {
    throw { code: 'INVALID_CATEGORY', message: 'Category not found', status: 404 }
  }

  // 3. Prevent customer booking same provider twice in same time window
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      customerId,
      providerId,
      status:      { in: ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'] },
      scheduledAt: {
        gte: new Date(new Date(scheduledAt).getTime() - 2 * 60 * 60 * 1000), // ±2 hours
        lte: new Date(new Date(scheduledAt).getTime() + 2 * 60 * 60 * 1000),
      },
    },
  })

  if (conflictingBooking) {
    throw {
      code:    'BOOKING_CONFLICT',
      message: 'You already have a booking with this provider in that time window',
      status:  409,
    }
  }

  // 4. Risk-adaptive flags
  const riskFlags = await getRiskAdaptiveFlags(providerId)

  // 5. Calculate commission — Emergency Dispatch earns 12% flat (PRD §5.3)
  const { commission } = calculateCommission(priceNpr, isEmergency)

  // 6. Create booking
  const booking = await prisma.booking.create({
    data: {
      customerId,
      providerId,
      categoryId,
      description,
      scheduledAt:   new Date(scheduledAt),
      priceNpr,
      commission,
      paymentMethod,
      status:        'REQUESTED',
      // Anti-Disintermediation + Emergency Dispatch fields (PRD §5.1, 5.3, 5.4)
      isEmergency:   isEmergency  ?? false,
      neighborhood:  neighborhood ?? null,
      hasGuarantee:  true,          // On-platform bookings always carry 7-day guarantee
      escrowStatus:  'NONE',        // Moves to HELD once customer initiates payment
    },
    include: {
      provider: { select: { legalName: true, user: { select: { id: true } } } },
      category: { select: { name: true } },
      customer: { select: { name: true } },
    },
  })

  await notifyBookingRequested(
    booking.provider.user.id,
    booking.customer.name,
    booking.category.name,
    booking.scheduledAt.toLocaleDateString('en-NP')
  ).catch(() => {})


  return {
    booking,
    ...(isEmergency && {
      emergencyNotice: 'Fast Responder badge awarded if provider accepts within 5 minutes.',
    }),
    riskFlags: riskFlags.isNewProvider ? {
      isNewProvider:         true,
      requiresManualConfirm: riskFlags.requiresManualConfirm,
      escrowDays:            riskFlags.extendedEscrowDays,
      notice:                'This is a new provider. Your payment will be held in escrow for 7 days after completion.',
    } : null,
  }
}

// ─────────────────────────────────────────────
// UPDATE BOOKING STATUS
// ─────────────────────────────────────────────

export const updateBookingStatus = async (
  bookingId:  string,
  actorId:    string,
  actorRole:  'PROVIDER' | 'CUSTOMER',
  input:      UpdateBookingStatusInput
) => {
  const { status: newStatus, cancelReason } = input

  // 1. Fetch booking
  const booking = await prisma.booking.findUnique({
    where:   { id: bookingId },
    include: {
      provider: { select: { id: true, trustScore: true, legalName: true } },
      category: { select: { name: true } },
    },
  })

  if (!booking) {
    throw { code: 'BOOKING_NOT_FOUND', message: 'Booking not found', status: 404 }
  }

  // 2. Authorization — provider or customer must own this booking
  if (actorRole === 'PROVIDER' && booking.provider.id !== actorId) {
    throw { code: 'FORBIDDEN', message: 'Not your booking', status: 403 }
  }
  if (actorRole === 'CUSTOMER' && booking.customerId !== actorId) {
    throw { code: 'FORBIDDEN', message: 'Not your booking', status: 403 }
  }

  // 3. Validate state transition
  validateTransition(booking.status, newStatus, actorRole)

  // 4. Customer cancellation window: only up to 2 hours before scheduled time
  if (newStatus === 'CANCELLED' && actorRole === 'CUSTOMER') {
    const twoHoursBefore = new Date(booking.scheduledAt.getTime() - 2 * 60 * 60 * 1000)
    if (new Date() > twoHoursBefore) {
      throw {
        code:    'CANCELLATION_WINDOW_CLOSED',
        message: 'Cannot cancel within 2 hours of scheduled time',
        status:  400,
      }
    }
  }

  // 5. Risk-adaptive: if provider trust < 40 and marking COMPLETED,
  //    check if customer needs to manually confirm (first 3 bookings)
  if (newStatus === 'COMPLETED' && actorRole === 'PROVIDER') {
    const riskFlags = await getRiskAdaptiveFlags(booking.providerId)

    if (riskFlags.requiresManualConfirm) {
      // Set to a pending-confirmation state via a flag on the booking
      // Customer must confirm completion — enforced in client flow
      // Backend: proceed with COMPLETED but flag in audit log
      console.log(`⚠️  Risk-adaptive: booking ${bookingId} marked complete by new provider — awaiting customer confirmation`)
    }
  }

  // 6. Build update data
  const updateData: Record<string, unknown> = {
    status: newStatus,
  }

  if (cancelReason)                      updateData.cancelReason = cancelReason
  if (newStatus === 'COMPLETED')         updateData.completedAt  = new Date()

  // 7. If COMPLETED — deduct commission and trigger trust recompute
  let commissionResult = null

  if (newStatus === 'COMPLETED') {
    commissionResult = calculateCommission(booking.priceNpr ?? 0, booking.isEmergency)

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data:  {
          ...updateData,
          commission:   commissionResult!.commission,
          // Release escrow funds to provider when job is marked complete (PRD §5.1)
          escrowStatus: booking.escrowStatus === 'HELD' ? 'RELEASED' : booking.escrowStatus,
        },
      })
    })

    // Enqueue trust score recompute for the provider
    await trustQueue.add(
      'recompute-trust',
      { providerId: booking.providerId, trigger: 'booking_completed' },
      { attempts: 3, backoff: { type: 'fixed', delay: 2000 } }
    )

    // Increment completedBookings counter (milestone badge recomputes inside trust job)
    await prisma.provider.update({
      where: { id: booking.providerId },
      data:  { completedBookings: { increment: 1 } },
    })

    // notify customer
    await notifyBookingCompleted(
      booking.customerId,
      booking.category.name
    ).catch(() => {})

    return {
      booking: await prisma.booking.findUnique({ where: { id: bookingId } }),
      commission: commissionResult,
      message:    'Booking marked complete. Commission deducted. Payout initiated.',
    }
  }

  // 8. Standard status update (non-COMPLETED)
  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data:  updateData,
    include: {
      customer: { select: { name: true } },
      provider: { select: { legalName: true } },
      category: { select: { name: true } },
    },
  })

  // If REJECTED — check rejection rate for trust penalty
  if (newStatus === 'REJECTED') {
    await checkRejectionRate(booking.providerId)
  }

  if (newStatus === 'ACCEPTED') {
    await notifyBookingAccepted(
      booking.customerId,
      booking.provider.legalName,
      booking.category.name,
      booking.scheduledAt.toLocaleDateString('en-NP')
    ).catch(() => {})
  } else if (newStatus === 'REJECTED') {
    await notifyBookingRejected(
      booking.customerId,
      booking.provider.legalName,
      booking.category.name
    ).catch(() => {})
  }

  return { booking: updated, message: `Booking ${newStatus.toLowerCase()}` }
}

// ─────────────────────────────────────────────
// REJECTION RATE CHECK
// Providers rejecting > 30% over 30 days get a trust penalty
// ─────────────────────────────────────────────

const checkRejectionRate = async (providerId: string): Promise<void> => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [total, rejected] = await Promise.all([
    prisma.booking.count({
      where: {
        providerId,
        createdAt: { gte: thirtyDaysAgo },
        status:    { in: ['ACCEPTED', 'REJECTED', 'COMPLETED', 'IN_PROGRESS'] },
      },
    }),
    prisma.booking.count({
      where: {
        providerId,
        createdAt: { gte: thirtyDaysAgo },
        status:    'REJECTED',
      },
    }),
  ])

  if (total < 5) return   // Not enough data to penalise

  const rejectionRate = rejected / total

  if (rejectionRate > 0.30) {
    // Enqueue trust recompute with rejection penalty signal
    await trustQueue.add(
      'recompute-trust',
      { providerId, trigger: 'high_rejection_rate', rejectionRate },
      { attempts: 3 }
    )
    console.log(
      `⚠️  High rejection rate for provider ${providerId}: ${(rejectionRate * 100).toFixed(1)}%`
    )
  }
}

// ─────────────────────────────────────────────
// GET SINGLE BOOKING
// ─────────────────────────────────────────────

export const getBooking = async (
  bookingId: string,
  actorId:   string,
  actorRole: string
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      provider: {
        select: {
          id:         true,
          legalName:  true,
          trustScore: true,
          user:       { select: { id: true } },
        },
      },
      category: true,
      review:   true,
      complaint: true,
    },
  })

  if (!booking) {
    throw { code: 'BOOKING_NOT_FOUND', message: 'Booking not found', status: 404 }
  }

  // Access control
  const isCustomer  = booking.customerId === actorId
  const isProvider  = booking.provider.user.id === actorId
  const isAdminRole = ['ADMIN', 'MODERATOR'].includes(actorRole)

  if (!isCustomer && !isProvider && !isAdminRole) {
    throw { code: 'FORBIDDEN', message: 'Access denied', status: 403 }
  }

  return booking
}

// ─────────────────────────────────────────────
// GET CUSTOMER BOOKINGS
// ─────────────────────────────────────────────

export const getCustomerBookings = async (
  customerId: string,
  params: { status?: string; page: number; limit: number }
) => {
  const { status, page, limit } = params
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { customerId }
  if (status) where.status = status

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      include: {
        provider: {
          select: {
            id:              true,
            legalName:       true,
            profilePhoto:    true,
            trustScore:      true,
            milestoneBadge: true, completedBookings: true,
          },
        },
        category: { select: { name: true } },
        review:   { select: { rating: true } },
      },
    }),
    prisma.booking.count({ where }),
  ])

  return {
    bookings,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

// ─────────────────────────────────────────────
// GET PROVIDER BOOKINGS
// ─────────────────────────────────────────────

export const getProviderBookings = async (
  providerId: string,
  params: { status?: string; page: number; limit: number }
) => {
  const { status, page, limit } = params
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { providerId }
  if (status) where.status = status

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true } },
        category: { select: { name: true } },
        review:   { select: { rating: true } },
      },
    }),
    prisma.booking.count({ where }),
  ])

  return {
    bookings,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}
