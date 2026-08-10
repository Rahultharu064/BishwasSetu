import { z } from 'zod'

export const CreateBookingSchema = z.object({
  providerId:    z.string().uuid(),
  categoryId:    z.string().uuid(),
  description:   z.string().min(10).max(1000).trim(),
  scheduledAt:   z.string().datetime({ message: 'Must be a valid ISO datetime' })
    .refine((d) => new Date(d) > new Date(), {
      message: 'Scheduled time must be in the future',
    }),
  priceNpr:      z.coerce.number().min(100).max(500000),
  paymentMethod: z.enum(['KHALTI', 'ESEWA', 'CASH']).default('CASH'),
  // Emergency Dispatch Mode (PRD §5.3) — bypasses scheduling friction
  isEmergency:   z.boolean().optional().default(false),
  // Hyper-Local Neighbourhood Tag (PRD §5.4) — e.g. 'Maharajgunj'
  neighborhood:  z.string().max(100).trim().optional(),
  // Full service address the customer entered — where the provider actually
  // goes. `neighborhood` is only the coarse tag derived from it.
  address:       z.string().max(255).trim().optional(),
})

export const UpdateBookingStatusSchema = z.object({
  status:       z.enum(['ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  cancelReason: z.string().max(500).optional(),
}).refine(
  (data) => {
    // Require cancelReason when rejecting or cancelling
    if (['REJECTED', 'CANCELLED'].includes(data.status) && !data.cancelReason) {
      return false
    }
    return true
  },
  { message: 'Reason is required when rejecting or cancelling', path: ['cancelReason'] }
)

// Booking escrow payment initiation (PRD §5.1)
export const InitiateBookingPaymentSchema = z.object({
  paymentMethod: z.enum(['KHALTI', 'ESEWA']),
  returnUrl:     z.string().url({ message: 'Must be a valid return URL' }),
})

export type CreateBookingInput              = z.infer<typeof CreateBookingSchema>
export type UpdateBookingStatusInput        = z.infer<typeof UpdateBookingStatusSchema>
export type InitiateBookingPaymentInput     = z.infer<typeof InitiateBookingPaymentSchema>