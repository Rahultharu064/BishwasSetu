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
  | 'REVIEW_RECEIVED'
  | 'COMPLAINT_FILED'
  | 'COMPLAINT_RESOLVED'
  | 'CREDIT_LOW'
  | 'CREDIT_PURCHASED'
  | 'SKILL_EVIDENCE_APPROVED'
  | 'SKILL_EVIDENCE_REJECTED'
  | 'MILESTONE_BADGE_EARNED'

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