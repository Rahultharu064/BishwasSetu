import { prisma }                   from '../config/db'
import { sendPushNotification }     from '../utils/firebase'
import { sendSms }                  from '../utils/sms'

export type NotificationEvent =
  | 'BOOKING_REQUESTED'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_COMPLETED'
  | 'BOOKING_CANCELLED'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'KYC_REQUEST_INFO'
  | 'KYC_BLACKLISTED'
  | 'SYSTEM_ALERT'
  | 'REVIEW_RECEIVED'
  | 'COMPLAINT_FILED'
  | 'COMPLAINT_RESOLVED'
  | 'CREDIT_LOW'
  | 'CREDIT_PURCHASED'
  | 'SKILL_EVIDENCE_APPROVED'
  | 'SKILL_EVIDENCE_REJECTED'
  | 'MILESTONE_BADGE_EARNED'
  // ── §5.1 Escrow-Based Milestone Payments ──
  | 'ESCROW_FUNDED'
  | 'ESCROW_RELEASED'
  | 'ESCROW_REFUNDED'
  | 'ESCROW_DISPUTED'
  // ── §5.2 Service Guarantee Credits ──
  | 'GUARANTEE_ACTIVATED'
  | 'GUARANTEE_CLAIM_FILED'
  | 'GUARANTEE_CLAIM_RESOLVED'
  | 'REVENUE_POINTS_AWARDED'
  // ── §5.3 Emergency Dispatch Mode ──
  | 'EMERGENCY_OFFER'
  | 'EMERGENCY_ACCEPTED'
  | 'EMERGENCY_EXPIRED'
  | 'FAST_RESPONDER_BADGE'
  // ── §5.4 Hyper-Local Neighborhood Tags ──
  | 'NEIGHBORHOOD_TAG_EARNED'

interface NotifyParams {
  event:      NotificationEvent
  userId:     string               // who to notify
  meta?:      Record<string, string>
}

// ── Message templates ─────────────────────────────────────────

const templates: Record<
  NotificationEvent,
  (meta: Record<string, string>) => { title: string; body: string; sms?: string }
> = {
  BOOKING_REQUESTED: (m) => ({
    title: 'New booking request',
    body:  `${m.customerName} has requested ${m.service} on ${m.date}.`,
    sms:   `BishwasSetu: New booking from ${m.customerName} for ${m.service}. Login to accept.`,
  }),
  BOOKING_ACCEPTED: (m) => ({
    title: 'Booking confirmed!',
    body:  `${m.providerName} has accepted your booking for ${m.service}.`,
    sms:   `BishwasSetu: Your ${m.service} booking is confirmed with ${m.providerName} on ${m.date}.`,
  }),
  BOOKING_REJECTED: (m) => ({
    title: 'Booking not accepted',
    body:  `${m.providerName} could not accept your booking. Please try another provider.`,
    sms:   `BishwasSetu: Your booking with ${m.providerName} was not accepted. Please book another provider.`,
  }),
  BOOKING_COMPLETED: (m) => ({
    title: 'Service completed',
    body:  `${m.service} has been marked complete. Please rate your experience.`,
    sms:   `BishwasSetu: ${m.service} completed. Please leave a review within 48 hours.`,
  }),
  BOOKING_CANCELLED: (m) => ({
    title: 'Booking cancelled',
    body:  `Your booking for ${m.service} on ${m.date} has been cancelled.`,
  }),
  KYC_APPROVED: (_m) => ({
    title: 'KYC Verified! 🎉',
    body:  'Congratulations! Your identity has been verified. You can now accept bookings.',
    sms:   'BishwasSetu: Your KYC has been approved. You can now accept bookings on the platform.',
  }),
  KYC_REJECTED: (m) => ({
    title: 'KYC not approved',
    body:  `Your KYC was not approved. Reason: ${m.reason}. Please re-upload your documents.`,
    sms:   `BishwasSetu: Your KYC was not approved. Reason: ${m.reason}. Please login to re-upload.`,
  }),
  KYC_REQUEST_INFO: (m) => ({
    title: 'More info needed for KYC',
    body:  `We need more information to process your KYC. Reason: ${m.reason}. Please review your documents.`,
    sms:   `BishwasSetu: We need more info for your KYC. Reason: ${m.reason}. Login to update documents.`,
  }),
  KYC_BLACKLISTED: (_m) => ({
    title: 'Account Suspended',
    body:  `Your account has been suspended due to policy violations.`,
    sms:   `BishwasSetu: Your account has been permanently suspended for violating our terms of service.`,
  }),
  SYSTEM_ALERT: (m) => ({
    title: m.title ?? 'System Alert',
    body:  m.message,
  }),
  REVIEW_RECEIVED: (m) => ({
    title: 'New review received',
    body:  `${m.customerName} gave you a ${m.rating}-star review.`,
  }),
  COMPLAINT_FILED: (m) => ({
    title: 'Complaint filed against you',
    body:  `A complaint has been filed for your booking on ${m.date}. Our team will review it.`,
  }),
  COMPLAINT_RESOLVED: (m) => ({
    title: 'Complaint resolved',
    body:  `Your complaint has been resolved: ${m.resolution}`,
    sms:   `BishwasSetu: Your complaint has been resolved. ${m.resolution}`,
  }),
  CREDIT_LOW: (m) => ({
    title: 'Low credits — recharge now',
    body:  `You have only ${m.balance} credits left. Recharge to keep your boost active.`,
    sms:   `BishwasSetu: Low credits (${m.balance} remaining). Recharge to maintain boost visibility.`,
  }),
  CREDIT_PURCHASED: (m) => ({
    title: 'Credits added! ✅',
    body:  `${m.credits} credits have been added to your wallet. New balance: ${m.balance}.`,
  }),
  SKILL_EVIDENCE_APPROVED: (_m) => ({
    title: 'Skill evidence approved! 🎓',
    body:  'Your skill evidence has been reviewed and approved. Your "Skill Verified" badge is now active.',
    sms:   'BishwasSetu: Your skill evidence has been approved. Skill Verified badge is now visible on your profile.',
  }),
  SKILL_EVIDENCE_REJECTED: (m) => ({
    title: 'Skill evidence not approved',
    body:  `Your skill evidence was not approved. Reason: ${m.reason}. You can re-submit at any time.`,
    sms:   `BishwasSetu: Skill evidence not approved. Reason: ${m.reason}. Please login to re-submit.`,
  }),
  MILESTONE_BADGE_EARNED: (m) => ({
    title: `Milestone reached! ${m.badge} 🏆`,
    body:  `Congratulations — you have reached the ${m.badge} milestone. Keep it up!`,
    sms:   `BishwasSetu: You have reached the ${m.badge} milestone! Login to see your updated profile.`,
  }),

  // ── §5.1 Escrow-Based Milestone Payments ──────────────────────

  ESCROW_FUNDED: (m) => ({
    title: 'Payment secured in escrow',
    body:  `NPR ${m.amount} for ${m.service} is held safely in escrow. It will be released when the job is complete.`,
    sms:   `BishwasSetu: NPR ${m.amount} secured in escrow for ${m.service}. Funds release on job completion.`,
  }),
  ESCROW_RELEASED: (m) => ({
    title: 'Payment released! 💰',
    body:  `NPR ${m.amount} has been released to your account for booking ${m.bookingId}.`,
    sms:   `BishwasSetu: NPR ${m.amount} released for booking ${m.bookingId}. Thank you for staying on-platform!`,
  }),
  ESCROW_REFUNDED: (m) => ({
    title: 'Refund processed',
    body:  `NPR ${m.amount} for ${m.service} has been refunded to your ${m.gateway} account.`,
    sms:   `BishwasSetu: NPR ${m.amount} refunded to your ${m.gateway} account for ${m.service}.`,
  }),
  ESCROW_DISPUTED: (m) => ({
    title: 'Payment under dispute',
    body:  `The escrow payment for booking ${m.bookingId} is under dispute. Our team will review within 48 hours.`,
    sms:   `BishwasSetu: Escrow for booking ${m.bookingId} is under dispute. Our team will contact you within 48 hours.`,
  }),

  // ── §5.2 Service Guarantee Credits ────────────────────────────

  GUARANTEE_ACTIVATED: (m) => ({
    title: '7-day Service Guarantee active ✅',
    body:  `Your ${m.service} job is covered by our workmanship guarantee until ${m.expiresAt}.`,
  }),
  GUARANTEE_CLAIM_FILED: (m) => ({
    title: 'Guarantee claim filed',
    body:  `A workmanship claim has been filed for your ${m.service} job. Please respond within 24 hours.`,
    sms:   `BishwasSetu: A guarantee claim was filed for your ${m.service} job. Login to respond within 24 hours.`,
  }),
  GUARANTEE_CLAIM_RESOLVED: (m) => ({
    title: 'Guarantee claim resolved',
    body:  `Your claim has been resolved: ${m.resolution}`,
    sms:   `BishwasSetu: Your guarantee claim has been resolved. ${m.resolution}`,
  }),
  REVENUE_POINTS_AWARDED: (m) => ({
    title: 'Verified Revenue Points earned! ⭐',
    body:  `You earned ${m.points} Verified Revenue Points. Total: ${m.total}. Higher points = better search ranking.`,
  }),

  // ── §5.3 Emergency Dispatch Mode ──────────────────────────────

  EMERGENCY_OFFER: (m) => ({
    title: 'Emergency job nearby! 🚨',
    body:  `${m.category} needed ${m.distanceKm} km away. Accept within 5 minutes for a Fast Responder badge.`,
    sms:   `BishwasSetu EMERGENCY: ${m.category} job ${m.distanceKm}km from you. Open the app to accept now.`,
  }),
  EMERGENCY_ACCEPTED: (m) => ({
    title: 'Pro on the way!',
    body:  `${m.providerName} accepted your emergency request and is ${m.distanceKm} km away. ETA: ${m.eta} min.`,
    sms:   `BishwasSetu: ${m.providerName} is coming for your emergency ${m.category} job. ETA ${m.eta} min. Contact via the app.`,
  }),
  EMERGENCY_EXPIRED: (_m) => ({
    title: 'No providers available',
    body:  `We couldn't find an available pro right now. Try a standard booking or retry shortly.`,
    sms:   `BishwasSetu: No pros available for your emergency request right now. Please try a standard booking.`,
  }),
  FAST_RESPONDER_BADGE: (_m) => ({
    title: 'Fast Responder badge earned! ⚡',
    body:  'You accepted an emergency job within 5 minutes. Your Fast Responder badge is now visible on your profile.',
    sms:   'BishwasSetu: Fast Responder badge earned! It is now visible on your profile and boosts emergency rankings.',
  }),

  // ── §5.4 Hyper-Local Neighborhood Tags ────────────────────────

  NEIGHBORHOOD_TAG_EARNED: (m) => ({
    title: `New neighborhood tag: ${m.area} 📍`,
    body:  `You've completed ${m.count} verified jobs in ${m.area}. This now appears on your profile for local customers.`,
  }),
}

// ── Main dispatch function ─────────────────────────────────────

export const notify = async (params: NotifyParams): Promise<void> => {
  const { event, userId, meta = {} } = params

  // 1. Get user device token + phone
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { phone: true },
  })

  if (!user) return

  const template = templates[event]
  if (!template) return

  const { title, body, sms } = template(meta)

  // 2. Send push notification
  // NOTE: FCM token storage not in schema yet — add fcmToken to User model
  // For now, SMS is primary channel
  // await sendPushNotification({ token: user.fcmToken, title, body, data: meta })

  // 3. Send SMS for critical events
  if (sms && user.phone) {
    await sendSms(user.phone, sms)
  }

  // 4. Store in-app notification (future — add Notification model if needed)
  console.log(`📣 [${event}] → user:${userId} | ${title}`)
}

// ── Convenience wrappers ──────────────────────────────────────

export const notifyBookingRequested = (
  providerId:   string,
  customerName: string,
  service:      string,
  date:         string
) => notify({ event: 'BOOKING_REQUESTED', userId: providerId, meta: { customerName, service, date } })

export const notifyBookingAccepted = (
  customerId:   string,
  providerName: string,
  service:      string,
  date:         string
) => notify({ event: 'BOOKING_ACCEPTED', userId: customerId, meta: { providerName, service, date } })

export const notifyBookingRejected = (
  customerId:   string,
  providerName: string,
  service:      string
) => notify({ event: 'BOOKING_REJECTED', userId: customerId, meta: { providerName, service } })

export const notifyBookingCompleted = (
  customerId: string,
  service:    string
) => notify({ event: 'BOOKING_COMPLETED', userId: customerId, meta: { service } })

export const notifyKycApproved = (userId: string) =>
  notify({ event: 'KYC_APPROVED', userId })

export const notifyKycRejected = (userId: string, reason: string) =>
  notify({ event: 'KYC_REJECTED', userId, meta: { reason } })

export const notifyKycRequestInfo = (userId: string, reason: string) =>
  notify({ event: 'KYC_REQUEST_INFO', userId, meta: { reason } })

export const notifyKycBlacklisted = (userId: string) =>
  notify({ event: 'KYC_BLACKLISTED', userId })

export const notifyReviewReceived = (
  providerId:   string,
  customerName: string,
  rating:       string
) => notify({ event: 'REVIEW_RECEIVED', userId: providerId, meta: { customerName, rating } })

export const notifyComplaintFiled = (
  providerId: string,
  date:       string
) => notify({ event: 'COMPLAINT_FILED', userId: providerId, meta: { date } })

export const notifyComplaintResolved = (
  customerId:  string,
  resolution:  string
) => notify({ event: 'COMPLAINT_RESOLVED', userId: customerId, meta: { resolution } })

export const notifyCreditLow = (
  providerId: string,
  balance:    string
) => notify({ event: 'CREDIT_LOW', userId: providerId, meta: { balance } })

export const notifySkillEvidenceApproved = (userId: string) =>
  notify({ event: 'SKILL_EVIDENCE_APPROVED', userId })

export const notifySkillEvidenceRejected = (userId: string, reason: string) =>
  notify({ event: 'SKILL_EVIDENCE_REJECTED', userId, meta: { reason } })

export const notifyMilestoneBadgeEarned = (userId: string, badge: string) =>
  notify({ event: 'MILESTONE_BADGE_EARNED', userId, meta: { badge } })

// ── §5.1 Escrow wrappers ──────────────────────────────────────

export const notifyEscrowFunded = (
  customerId: string,
  amount:     string,   // NPR, formatted (e.g. "1,500.00")
  service:    string
) => notify({ event: 'ESCROW_FUNDED', userId: customerId, meta: { amount, service } })

export const notifyEscrowReleased = (
  providerUserId: string,
  amount:         string,
  bookingId:      string
) => notify({ event: 'ESCROW_RELEASED', userId: providerUserId, meta: { amount, bookingId } })

export const notifyEscrowRefunded = (
  customerId: string,
  amount:     string,
  service:    string,
  gateway:    string    // "Khalti" | "eSewa"
) => notify({ event: 'ESCROW_REFUNDED', userId: customerId, meta: { amount, service, gateway } })

export const notifyEscrowDisputed = (
  userId:    string,    // notify both parties — call once per user
  bookingId: string
) => notify({ event: 'ESCROW_DISPUTED', userId, meta: { bookingId } })

// ── §5.2 Guarantee wrappers ───────────────────────────────────

export const notifyGuaranteeActivated = (
  customerId: string,
  service:    string,
  expiresAt:  string
) => notify({ event: 'GUARANTEE_ACTIVATED', userId: customerId, meta: { service, expiresAt } })

export const notifyGuaranteeClaimFiled = (
  providerUserId: string,
  service:        string
) => notify({ event: 'GUARANTEE_CLAIM_FILED', userId: providerUserId, meta: { service } })

export const notifyGuaranteeClaimResolved = (
  customerId: string,
  resolution: string
) => notify({ event: 'GUARANTEE_CLAIM_RESOLVED', userId: customerId, meta: { resolution } })

export const notifyRevenuePointsAwarded = (
  providerUserId: string,
  points:         string,
  total:          string
) => notify({ event: 'REVENUE_POINTS_AWARDED', userId: providerUserId, meta: { points, total } })

// ── §5.3 Emergency wrappers ───────────────────────────────────

export const notifyEmergencyOffer = (
  providerUserId: string,
  category:       string,
  distanceKm:     string,
  requestId:      string
) => notify({ event: 'EMERGENCY_OFFER', userId: providerUserId, meta: { category, distanceKm, requestId } })

export const notifyEmergencyAccepted = (
  customerId:   string,
  providerName: string,
  category:     string,
  distanceKm:   string,
  eta:          string
) => notify({ event: 'EMERGENCY_ACCEPTED', userId: customerId, meta: { providerName, category, distanceKm, eta } })

export const notifyEmergencyExpired = (customerId: string) =>
  notify({ event: 'EMERGENCY_EXPIRED', userId: customerId })

export const notifyFastResponderBadge = (providerUserId: string) =>
  notify({ event: 'FAST_RESPONDER_BADGE', userId: providerUserId })

// ── §5.4 Neighborhood wrappers ────────────────────────────────

export const notifyNeighborhoodTagEarned = (
  providerUserId: string,
  area:           string,
  count:          string
) => notify({ event: 'NEIGHBORHOOD_TAG_EARNED', userId: providerUserId, meta: { area, count } })
