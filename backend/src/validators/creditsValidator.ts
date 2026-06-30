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
})

export type PurchaseCreditsInput = z.infer<typeof PurchaseCreditsSchema>
export type ActivateBoostInput   = z.infer<typeof ActivateBoostSchema>