import { prisma }               from '../config/db'
import { verifyKhaltiPayment, verifyEsewaPayment } from '../utils/payment'
import type { PurchaseCreditsInput, ActivateBoostInput } from '../validators/creditsValidator'

// Cost in credits per placement type
const BOOST_COSTS: Record<string, number> = {
  priority_ranking:  5,    // per accepted booking through boost
  homepage_featured: 10,   // per accepted booking through boost
  direct_message:    3,    // per message sent
}

// ── GET wallet balance ─────────────────────────────────────────

export const getWallet = async (providerId: string) => {
  const wallet = await prisma.creditWallet.findUnique({
    where: { providerId },
  })

  if (!wallet) {
    throw { code: 'WALLET_NOT_FOUND', message: 'Credit wallet not found', status: 404 }
  }

  return wallet
}

// ── GET credit history ─────────────────────────────────────────

export const getCreditHistory = async (
  providerId: string,
  params: { page: number; limit: number }
) => {
  const { page, limit } = params
  const skip = (page - 1) * limit

  const [purchases, deductions] = await Promise.all([
    prisma.creditPurchase.findMany({
      where:   { providerId },
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      include: { pack: { select: { name: true, credits: true } } },
    }),
    prisma.creditDeduction.findMany({
      where:   { providerId },
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return { purchases, deductions }
}

// ── GET available credit packs ─────────────────────────────────

export const getCreditPacks = async () => {
  return prisma.creditPack.findMany({
    where:   { isActive: true },
    orderBy: { priceNpr: 'asc' },
  })
}

// ── PURCHASE credit pack ───────────────────────────────────────

export const purchaseCredits = async (
  providerId: string,
  input:      PurchaseCreditsInput
) => {
  const { packId, paymentMethod, paymentRef, orderId } = input

  // 1. Fetch pack
  const pack = await prisma.creditPack.findUnique({
    where: { id: packId, isActive: true },
  })

  if (!pack) {
    throw { code: 'PACK_NOT_FOUND', message: 'Credit pack not found or inactive', status: 404 }
  }

  // 2. Check for duplicate payment ref (idempotency)
  const existing = await prisma.creditPurchase.findFirst({
    where: { paymentRef, status: 'COMPLETED' },
  })

  if (existing) {
    throw {
      code:    'DUPLICATE_PAYMENT',
      message: 'This payment has already been processed',
      status:  409,
    }
  }

  // 3. Create PENDING purchase record
  const purchase = await prisma.creditPurchase.create({
    data: {
      providerId,
      packId,
      creditsAdded:  pack.credits,
      amountNpr:     pack.priceNpr,
      paymentMethod,
      paymentRef,
      status:        'PENDING',
    },
  })

  // 4. Verify payment with gateway
  let verified     = false
  let transactionId: string | null = null

  if (paymentMethod === 'KHALTI') {
    const result = await verifyKhaltiPayment(paymentRef, pack.priceNpr)
    verified      = result.verified
    transactionId = result.transactionId
  } else if (paymentMethod === 'ESEWA') {
    const result = await verifyEsewaPayment(paymentRef, pack.priceNpr, orderId ?? purchase.id)
    verified      = result.verified
    transactionId = result.transactionId
  }

  if (!verified) {
    // Mark purchase as failed
    await prisma.creditPurchase.update({
      where: { id: purchase.id },
      data:  { status: 'FAILED' },
    })
    throw {
      code:    'PAYMENT_VERIFICATION_FAILED',
      message: 'Payment could not be verified. Please try again or contact support.',
      status:  402,
    }
  }

  // 5. Credit the wallet (transaction — atomic)
  const [updatedPurchase, wallet] = await prisma.$transaction([
    prisma.creditPurchase.update({
      where: { id: purchase.id },
      data:  { status: 'COMPLETED', paymentRef: transactionId ?? paymentRef },
    }),
    prisma.creditWallet.update({
      where: { providerId },
      data: {
        balance:     { increment: pack.credits },
        totalEarned: { increment: pack.credits },
      },
    }),
  ])

  return {
    purchase:      updatedPurchase,
    newBalance:    wallet.balance,
    creditsAdded:  pack.credits,
    message:       `${pack.credits} credits added to your wallet.`,
  }
}

// ── ACTIVATE boost placement ───────────────────────────────────

export const activateBoost = async (
  providerId: string,
  input:      ActivateBoostInput
) => {
  const { placementType, durationSlots, bookingId } = input
  const costPerSlot = BOOST_COSTS[placementType] ?? 5
  const totalCost   = durationSlots * costPerSlot

  // PRD §6.3: direct_message requires an ACCEPTED booking
  if (placementType === 'direct_message') {
    if (!bookingId) {
      throw { code: 'MISSING_BOOKING_ID', message: 'Booking ID required for direct message', status: 400 }
    }
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        providerId,
        status: { in: ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'] },
      },
    })
    if (!booking) {
      throw {
        code:    'INVALID_BOOKING',
        message: 'Direct messaging is only allowed after accepting a booking (Anti-Disintermediation)',
        status:  403,
      }
    }
  }

  // Check wallet balance
  const wallet = await prisma.creditWallet.findUnique({
    where: { providerId },
  })

  if (!wallet || wallet.balance < totalCost) {
    throw {
      code:    'INSUFFICIENT_CREDITS',
      message: `Insufficient credits. Need ${totalCost}, have ${wallet?.balance ?? 0}.`,
      status:  400,
    }
  }

  // NOTE: credits are NOT deducted now.
  // They are deducted only when a booking is accepted through this boost slot.
  // This is the core mechanic: performance-based, not time-based.

  // Store boost activation in Redis with TTL
  // Key: boost:{providerId}:{placementType}
  // Value: { slotsRemaining, costPerSlot }
  const { redis } = await import('../config/redis')
  if (!redis) {
    throw { code: 'REDIS_UNAVAILABLE', message: 'Boost service unavailable (Redis not connected)', status: 503 }
  }

  const boostKey = `boost:${providerId}:${placementType}`
  const existing = await redis.get(boostKey)

  const currentSlots   = existing ? JSON.parse(existing).slotsRemaining : 0
  const newSlots       = currentSlots + durationSlots

  await redis.set(
    boostKey,
    JSON.stringify({ slotsRemaining: newSlots, costPerSlot, providerId, placementType }),
    'EX',
    60 * 60 * 24 * 90   // 90 days — credits never expire
  )

  return {
    placementType,
    slotsAdded:      durationSlots,
    slotsRemaining:  newSlots,
    creditsCost:     `${totalCost} credits will be deducted as slots are used`,
    message:         `Boost activated. Credits deduct only when bookings are accepted.`,
  }
}

// ── DEDUCT credits (internal — called when booking accepted via boost) ──

export const deductCredits = async (params: {
  providerId:    string
  reason:        'BOOST_BOOKING_ACCEPTED' | 'FEATURED_SLOT'
  bookingId?:    string
  placementType: string
}) => {
  const { providerId, reason, bookingId, placementType } = params

  const { redis } = await import('../config/redis')
  if (!redis) return   // Redis not available — skip boost deduction

  const boostKey  = `boost:${providerId}:${placementType}`
  const boostData = await redis.get(boostKey)

  if (!boostData) return   // no active boost — no deduction

  const boost      = JSON.parse(boostData)
  const costPerSlot = boost.costPerSlot as number

  const wallet = await prisma.creditWallet.findUnique({
    where: { providerId },
  })

  if (!wallet || wallet.balance < costPerSlot) {
    // Insufficient balance — deactivate boost
    await redis.del(boostKey)
    console.log(`⚠️  Boost deactivated for provider ${providerId} — insufficient credits`)
    return
  }

  // Atomic deduction
  await prisma.$transaction([
    prisma.creditWallet.update({
      where: { providerId },
      data: {
        balance:    { decrement: costPerSlot },
        totalSpent: { increment: costPerSlot },
      },
    }),
    prisma.creditDeduction.create({
      data: {
        providerId,
        amount:    costPerSlot,
        reason,
        bookingId,
      },
    }),
  ])

  // Update remaining slots
  const newSlots = boost.slotsRemaining - 1

  if (newSlots <= 0) {
    await redis.del(boostKey)
    console.log(`ℹ️  Boost slots exhausted for provider ${providerId}:${placementType}`)
  } else {
    await redis.set(
      boostKey,
      JSON.stringify({ ...boost, slotsRemaining: newSlots }),
      'KEEPTTL'
    )
  }

  // Low credit warning — notify when balance drops to 10
  const updatedWallet = await prisma.creditWallet.findUnique({
    where: { providerId },
  })
  if (updatedWallet && updatedWallet.balance <= 10) {
    // TODO: fire push notification "Low credits — recharge to keep boost active" (Step 10)
    console.log(`🔔 Low credit warning for provider ${providerId}: ${updatedWallet.balance} credits`)
  }
}

// ── GET boost analytics ────────────────────────────────────────

export const getBoostAnalytics = async (providerId: string) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [totalDeductions, boostedBookings, creditsSpent] = await Promise.all([
    // Total deductions in last 30 days
    prisma.creditDeduction.count({
      where: { providerId, createdAt: { gte: thirtyDaysAgo } },
    }),

    // Bookings won through boost
    prisma.booking.count({
      where: {
        providerId,
        isBoosted: true,
        status:    { in: ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'] },
        createdAt: { gte: thirtyDaysAgo },
      },
    }),

    // Credits spent in last 30 days
    prisma.creditDeduction.aggregate({
      where:  { providerId, createdAt: { gte: thirtyDaysAgo } },
      _sum:   { amount: true },
    }),
  ])

  // Cost per booking via boost
  const totalSpent = creditsSpent._sum.amount ?? 0
  const costPerBooking = boostedBookings > 0
    ? Math.round(totalSpent / boostedBookings)
    : 0

  // Current active boosts from Redis
  const { redis } = await import('../config/redis')
  const boostTypes = ['priority_ranking', 'homepage_featured', 'direct_message']
  const activeBoosts: Record<string, number> = {}

  if (redis) {
    for (const type of boostTypes) {
      const data = await redis.get(`boost:${providerId}:${type}`)
      if (data) {
        activeBoosts[type] = JSON.parse(data).slotsRemaining
      }
    }
  }

  return {
    last30Days: {
      creditsSpent:     totalSpent,
      bookingsViaBoost: boostedBookings,
      costPerBooking,
      deductions:       totalDeductions,
    },
    activeBoosts,
    wallet: await prisma.creditWallet.findUnique({ where: { providerId } }),
  }
}