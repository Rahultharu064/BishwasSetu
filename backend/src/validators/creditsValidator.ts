import { z } from 'zod'

export const PurchaseCreditsSchema = z.object({
  packId:        z.string().uuid(),
  paymentMethod: z.enum(['KHALTI', 'ESEWA']),
  // Payment gateway token/ref returned after frontend payment flow
  paymentRef:    z.string().min(1),
  // For eSewa — order ID used during payment initiation
  orderId:       z.string().optional(),
})

export const ActivateBoostSchema = z.object({
  placementType: z.enum(['priority_ranking', 'homepage_featured', 'direct_message']),
  durationSlots: z.number().int().min(1).max(100),
  bookingId:     z.string().uuid().optional(),
}).refine(
  (data) => {
    // direct_message requires a bookingId (PRD §6.3)
    if (data.placementType === 'direct_message' && !data.bookingId) {
      return false
    }
    return true
  },
  { message: 'bookingId is required for direct_message boost', path: ['bookingId'] }
)

export type PurchaseCreditsInput = z.infer<typeof PurchaseCreditsSchema>
export type ActivateBoostInput   = z.infer<typeof ActivateBoostSchema>