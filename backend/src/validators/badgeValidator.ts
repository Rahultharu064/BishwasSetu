import { z } from 'zod'

export const PurchaseBadgeSchema = z.object({
  badgeType: z.enum(['SKILL_VERIFIED', 'BACKGROUND_CHECKED', 'INSURED']),
  paymentMethod: z.enum(['KHALTI', 'ESEWA']),
  // Gateway reference obtained after the frontend payment flow (Khalti pidx /
  // eSewa base64 data). Verified server-side before the badge is created.
  paymentRef: z.string().min(1),
  // Insurance document (Cloudinary) — required for the Insured badge, uploaded
  // via POST /badges/document first.
  documentUrl: z.string().url().optional(),
  documentId: z.string().max(200).optional(),
})

export const RejectBadgeSchema = z.object({
  reason: z.string().min(3).max(500).trim(),
})

export type PurchaseBadgeInput = z.infer<typeof PurchaseBadgeSchema>
export type RejectBadgeInput = z.infer<typeof RejectBadgeSchema>
