import { z } from 'zod'

export const CreateComplaintSchema = z.object({
  bookingId:   z.string().uuid(),
  type:        z.enum(['SERVICE_QUALITY', 'NO_SHOW', 'OVERCHARGING', 'ABUSIVE_BEHAVIOR', 'FRAUD']),
  description: z.string().min(20).max(2000).trim(),
})

export const ResolveComplaintSchema = z.object({
  resolution: z.string().min(10).max(1000).trim(),
  action:     z.enum(['WARNING', 'REFUND', 'SUSPENSION', 'BAN', 'DISMISSED']),
})

export type CreateComplaintInput  = z.infer<typeof CreateComplaintSchema>
export type ResolveComplaintInput = z.infer<typeof ResolveComplaintSchema>