import { prisma } from '../config/db'
import { groq, GROQ_MODELS } from '../config/groq'
import {
  notifyComplaintFiled,
  notifyComplaintResolved,
} from '../services/notificationsService'
import { logAdminAction } from '../services/auditLogService'
import type { CreateComplaintInput, ResolveComplaintInput } from '../validators/complaintValidator'

const REFUNDABLE_ESCROW_STATUSES = ['HELD', 'DISPUTED']


const triageComplaint = async (
  type:        string,
  description: string
): Promise<{ severity: string; suggestedAction: string }> => {
  try {
    const completion = await groq.chat.completions.create({
      model:       GROQ_MODELS.MODERATION,
      max_tokens:  150,
      temperature: 0,
      messages: [
        {
          role:    'system',
          content: `You are a complaint triage system for a home services marketplace.
Classify the complaint severity and suggest an action.
Return ONLY valid JSON: { "severity": "low|medium|high|critical", "suggestedAction": "one sentence" }
- critical: fraud, physical abuse, safety threat
- high: financial dispute, no-show, abusive language
- medium: service quality issues, overcharging
- low: minor inconvenience, miscommunication`,
        },
        {
          role:    'user',
          content: `Type: ${type}\nDescription: ${description}`,
        },
      ],
    })

    const raw     = completion.choices[0]?.message?.content ?? '{}'
    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return { severity: 'medium', suggestedAction: 'Review manually' }
  }
}

// ── CREATE complaint ───────────────────────────────────────────

export const createComplaint = async (
  customerId: string,
  input:      CreateComplaintInput
) => {
  const { bookingId, type, description } = input

  // Verify booking belongs to customer and is completed
  const booking = await prisma.booking.findUnique({
    where:  { id: bookingId },
    select: {
      customerId:  true,
      providerId:  true,
      status:      true,
      scheduledAt: true,
      category:    { select: { name: true } },
      provider:    { select: { user: { select: { id: true } } } },
    },
  })

  if (!booking) {
    throw { code: 'BOOKING_NOT_FOUND', message: 'Booking not found', status: 404 }
  }

  if (booking.customerId !== customerId) {
    throw { code: 'FORBIDDEN', message: 'Not your booking', status: 403 }
  }

  if (!['COMPLETED', 'IN_PROGRESS'].includes(booking.status)) {
    throw {
      code:    'COMPLAINT_NOT_ALLOWED',
      message: 'Complaints can only be filed for in-progress or completed bookings',
      status:  400,
    }
  }

  // Check no existing complaint for this booking
  const existing = await prisma.complaint.findUnique({ where: { bookingId } })
  if (existing) {
    throw { code: 'COMPLAINT_EXISTS', message: 'A complaint already exists for this booking', status: 409 }
  }

  // AI triage
  const triage = await triageComplaint(type, description)

  // Create complaint
  const complaint = await prisma.complaint.create({
    data: {
      bookingId,
      customerId,
      providerId:  booking.providerId,
      type,
      description,
      aiCategory:  triage.severity,
      status:      'OPEN',
    },
  })

  // Notify provider
  await notifyComplaintFiled(
    booking.provider.user.id,
    booking.scheduledAt.toLocaleDateString('en-NP')
  )

  return {
    complaint,
    triage,
    message: triage.severity === 'critical' || triage.severity === 'high'
      ? 'Complaint filed. Due to its severity, it has been escalated for urgent review.'
      : 'Complaint filed. Our team will review within 24 hours.',
  }
}

// ── GET single complaint ───────────────────────────────────────

export const getComplaint = async (
  complaintId: string,
  userId:      string,
  role:        string
) => {
  const complaint = await prisma.complaint.findUnique({
    where:   { id: complaintId },
    include: {
      booking:  { include: { category: true } },
      customer: { select: { name: true, phone: true } },
      provider: { select: { legalName: true, trustScore: true } },
    },
  })

  if (!complaint) {
    throw { code: 'COMPLAINT_NOT_FOUND', message: 'Complaint not found', status: 404 }
  }

  const isOwner   = complaint.customerId === userId
  const isAdmin   = ['ADMIN', 'MODERATOR'].includes(role)

  if (!isOwner && !isAdmin) {
    throw { code: 'FORBIDDEN', message: 'Access denied', status: 403 }
  }

  return complaint
}

// ── GET customer complaints ───────────────────────────────────

export const getCustomerComplaints = async (
  customerId: string,
  params: { page: number; limit: number }
) => {
  const { page, limit } = params
  const skip = (page - 1) * limit

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where:   { customerId },
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      include: {
        provider: { select: { legalName: true } },
        booking:  { select: { scheduledAt: true } },
      },
    }),
    prisma.complaint.count({ where: { customerId } }),
  ])

  return {
    complaints,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

// ── RESOLVE complaint (Admin) ─────────────────────────────────

export const resolveComplaint = async (
  complaintId: string,
  adminId:     string,
  input:       ResolveComplaintInput
) => {
  const { resolution, action } = input

  const complaint = await prisma.complaint.findUnique({
    where:  { id: complaintId },
    select: {
      status:     true,
      customerId: true,
      providerId: true,
      bookingId:  true,
      provider:   { select: { user: { select: { id: true } } } },
    },
  })

  if (!complaint) {
    throw { code: 'COMPLAINT_NOT_FOUND', message: 'Complaint not found', status: 404 }
  }

  if (complaint.status === 'RESOLVED' || complaint.status === 'DISMISSED') {
    throw { code: 'ALREADY_RESOLVED', message: 'Complaint is already closed', status: 400 }
  }

  // REFUND: actually move the escrow, don't just relabel the complaint
  let refundIssued = false
  if (action === 'REFUND') {
    const escrow = await prisma.escrowPayment.findUnique({ where: { bookingId: complaint.bookingId } })
    if (escrow && REFUNDABLE_ESCROW_STATUSES.includes(escrow.status)) {
      await prisma.$transaction([
        prisma.escrowPayment.update({
          where: { id: escrow.id },
          data:  { status: 'REFUNDED', refundedAt: new Date() },
        }),
        prisma.booking.update({
          where: { id: complaint.bookingId },
          data:  { status: 'CANCELLED', cancelReason: resolution },
        }),
      ])
      refundIssued = true
    }
  }

  // Apply action to provider
  if (action === 'SUSPENSION') {
    await prisma.provider.update({
      where: { id: complaint.providerId },
      data:  { identityStatus: 'REJECTED', // temporarily locks their bookings
    }})
  }

  if (action === 'BAN') {
    await prisma.user.update({
      where: { id: complaint.provider.user.id },
      data:  { isActive: false },
    })
  }

  // Update complaint
  const updated = await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status:     action === 'DISMISSED' ? 'DISMISSED' : 'RESOLVED',
      resolution,
      resolvedBy: adminId,
      resolvedAt: new Date(),
    },
  })

  // Check provider complaint threshold (3+ upheld in 90 days → auto-suspend)
  await checkProviderComplaintThreshold(complaint.providerId)

  // Notify customer
  await notifyComplaintResolved(complaint.customerId, resolution)

  await logAdminAction({
    adminId:    adminId,
    action:     action === 'DISMISSED' ? 'COMPLAINT_DISMISSED' : 'COMPLAINT_RESOLVED',
    targetType: 'complaint',
    targetId:   complaintId,
    details:    { action, resolution, refundIssued },
  })

  const message =
    action === 'REFUND'
      ? refundIssued
        ? 'Complaint resolved — escrow refunded and booking cancelled.'
        : 'Complaint resolved, but no held escrow was found to refund (cash booking or funds already released) — process the refund manually via ops.'
      : `Complaint ${action === 'DISMISSED' ? 'dismissed' : 'resolved'}`

  return { complaint: updated, action, refundIssued, message }
}

// ── Auto-suspend on threshold ─────────────────────────────────

const checkProviderComplaintThreshold = async (providerId: string) => {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  const upheldCount = await prisma.complaint.count({
    where: {
      providerId,
      status:    'RESOLVED',
      resolvedAt: { gte: ninetyDaysAgo },
    },
  })

  if (upheldCount >= 3) {
    await prisma.provider.update({
      where: { id: providerId },
      data:  { identityStatus: 'REJECTED' },
    })
    console.log(`⚠️  Provider ${providerId} auto-suspended: ${upheldCount} upheld complaints in 90 days`)
  }
}

// ── Admin: get all complaints ─────────────────────────────────

export const getAdminComplaints = async (params: {
  status?:   string
  severity?: string
  page:      number
  limit:     number
}) => {
  const { status, severity, page, limit } = params
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (status)   where.status     = status
  if (severity) where.aiCategory = severity

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      skip,
      take:    limit,
      orderBy: [
        { aiCategory: 'desc' },   // critical first
        { createdAt:  'desc' },
      ],
      include: {
        customer: { select: { name: true, phone: true } },
        provider: { select: { legalName: true, trustScore: true } },
        booking:  { include: { category: true } },
      },
    }),
    prisma.complaint.count({ where }),
  ])

  return {
    complaints,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}