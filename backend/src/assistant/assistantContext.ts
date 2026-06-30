import { prisma } from '../config/db'

export interface InjectedContext {
  type:    string
  data:    Record<string, unknown>
  summary: string    // short plain-text summary for the system prompt
}

// ── Booking context ───────────────────────────────────────────

const getBookingContext = async (
  bookingId: string
): Promise<InjectedContext> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id:          true,
      status:      true,
      scheduledAt: true,
      priceNpr:    true,
      description: true,
      provider:    { select: { legalName: true, trustScore: true } },
      category:    { select: { name: true } },
    },
  })

  if (!booking) {
    return { type: 'booking', data: {}, summary: 'Booking not found.' }
  }

  return {
    type: 'booking',
    data: booking,
    summary: `
Current booking context:
- Status: ${booking.status}
- Service: ${booking.category.name}
- Provider: ${booking.provider.legalName} (trust score: ${booking.provider.trustScore})
- Scheduled: ${booking.scheduledAt.toISOString()}
- Price: NPR ${booking.priceNpr}
- Description: ${booking.description}
    `.trim(),
  }
}

// ── Provider context ──────────────────────────────────────────

const getProviderContext = async (
  providerId: string
): Promise<InjectedContext> => {
  const provider = await prisma.provider.findUnique({
    where:  { id: providerId },
    select: {
      legalName:         true,
      trustScore:        true,
      milestoneBadge:    true,
      completedBookings: true,
      skillStatus:       true,
      serviceArea:       true,
      bio:               true,
      skills:            { select: { skill: true } },
      categories:        { include: { category: { select: { name: true } } } },
      badges:            { where: { status: 'ACTIVE' }, select: { badgeType: true } },
    },
  })

  if (!provider) {
    return { type: 'provider', data: {}, summary: 'Provider not found.' }
  }

  const skills      = provider.skills.map((s) => s.skill).join(', ')
  const categories  = provider.categories.map((c) => c.category.name).join(', ')
  const badges      = provider.badges.map((b) => b.badgeType).join(', ') || 'None'

  return {
    type: 'provider',
    data: provider,
    summary: `
Provider context:
- Name: ${provider.legalName}
- Trust Score: ${provider.trustScore}/100
- Milestone Badge: ${provider.milestoneBadge}
- Completed Bookings: ${provider.completedBookings}
- Skill Status: ${provider.skillStatus}
- Service Area: ${provider.serviceArea}
- Skills: ${skills}
- Categories: ${categories}
- Verified Badges: ${badges}
- Bio: ${provider.bio ?? 'Not provided'}
    `.trim(),
  }
}

// ── Complaint context ─────────────────────────────────────────

const getComplaintContext = async (
  complaintId: string
): Promise<InjectedContext> => {
  const complaint = await prisma.complaint.findUnique({
    where:  { id: complaintId },
    select: {
      type:        true,
      status:      true,
      description: true,
      aiCategory:  true,
      resolution:  true,
      createdAt:   true,
    },
  })

  if (!complaint) {
    return { type: 'complaint', data: {}, summary: 'Complaint not found.' }
  }

  return {
    type: 'complaint',
    data: complaint,
    summary: `
Complaint context:
- Type: ${complaint.type}
- Status: ${complaint.status}
- Filed: ${complaint.createdAt.toISOString()}
- Description: ${complaint.description}
- Resolution: ${complaint.resolution ?? 'Pending'}
    `.trim(),
  }
}

// ── Credits context ───────────────────────────────────────────

const getCreditsContext = async (
  providerId: string
): Promise<InjectedContext> => {
  const wallet = await prisma.creditWallet.findUnique({
    where:  { providerId },
    select: { balance: true, totalEarned: true, totalSpent: true },
  })

  return {
    type: 'credits',
    data: wallet ?? {},
    summary: `
Credits context:
- Current balance: ${wallet?.balance ?? 0} credits
- Total earned: ${wallet?.totalEarned ?? 0}
- Total spent: ${wallet?.totalSpent ?? 0}
    `.trim(),
  }
}

// ── Main context fetcher ──────────────────────────────────────

export const fetchContext = async (
  contextType: string,
  contextId?:  string,
  userId?:     string
): Promise<InjectedContext | null> => {
  try {
    switch (contextType) {
      case 'booking':
        return contextId ? getBookingContext(contextId) : null

      case 'provider':
        return contextId ? getProviderContext(contextId) : null

      case 'complaint':
        return contextId ? getComplaintContext(contextId) : null

      case 'credits':
        // contextId is providerId for credits
        return contextId ? getCreditsContext(contextId) : null

      default:
        return null
    }
  } catch {
    return null   // context failure must never crash the assistant
  }
}