import { prisma } from '../config/db'
import type { Role } from '@prisma/client'

export interface InjectedContext {
  type:    string
  data:    Record<string, unknown>
  summary: string    // short plain-text summary for the system prompt
}

/** Whoever is asking — undefined for a guest. */
export interface Requester {
  id?:         string
  role?:       Role
  providerId?: string
}

const ACCESS_DENIED: InjectedContext = {
  type:    'denied',
  data:    {},
  summary: 'The requested context is not accessible to this user. Do not reveal any details about it — if asked, say you can only discuss the signed-in user\'s own bookings, complaints, or provider info.',
}

export const isStaff = (requester: Requester) =>
  requester.role === 'ADMIN' || requester.role === 'MODERATOR'

// ── Booking context ───────────────────────────────────────────
// Private to the two parties on the booking (customer + assigned provider),
// plus staff. Everyone else — including guests — gets a denial, never data.

const getBookingContext = async (
  bookingId: string,
  requester: Requester
): Promise<InjectedContext> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id:          true,
      customerId:  true,
      providerId:  true,
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

  const owns =
    isStaff(requester) ||
    booking.customerId === requester.id ||
    booking.providerId === requester.providerId
  if (!owns) return ACCESS_DENIED

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
// A provider's public profile — same info anyone can see on their listing
// page, so this stays open to guests too.

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
// Private to the complainant + the provider it's about, plus staff.

const getComplaintContext = async (
  complaintId: string,
  requester:   Requester
): Promise<InjectedContext> => {
  const complaint = await prisma.complaint.findUnique({
    where:  { id: complaintId },
    select: {
      customerId:  true,
      providerId:  true,
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

  const owns =
    isStaff(requester) ||
    complaint.customerId === requester.id ||
    complaint.providerId === requester.providerId
  if (!owns) return ACCESS_DENIED

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
// A provider's own credit wallet — never another provider's.

const getCreditsContext = async (
  providerId: string,
  requester:  Requester
): Promise<InjectedContext> => {
  const owns = isStaff(requester) || providerId === requester.providerId
  if (!owns) return ACCESS_DENIED

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
// `requester` is the authenticated caller (empty object for a guest) —
// every context type except the public provider profile is scoped so a
// user can only ever see their own data, never another user's.

export const fetchContext = async (
  contextType: string,
  contextId:   string | undefined,
  requester:   Requester
): Promise<InjectedContext | null> => {
  try {
    switch (contextType) {
      case 'booking':
        return contextId ? getBookingContext(contextId, requester) : null

      case 'provider':
        return contextId ? getProviderContext(contextId) : null

      case 'complaint':
        return contextId ? getComplaintContext(contextId, requester) : null

      case 'credits':
        // contextId is providerId for credits
        return contextId ? getCreditsContext(contextId, requester) : null

      default:
        return null
    }
  } catch {
    return null   // context failure must never crash the assistant
  }
}
