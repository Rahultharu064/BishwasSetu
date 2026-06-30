import { z } from 'zod'

export const CreateReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating:    z.number().int().min(1).max(5),
  comment:   z.string().min(10).max(500).trim().optional(),
})

export const ProviderReplySchema = z.object({
  reply: z.string().min(5).max(500).trim(),
})

export type CreateReviewInput  = z.infer<typeof CreateReviewSchema>
export type ProviderReplyInput = z.infer<typeof ProviderReplySchema>