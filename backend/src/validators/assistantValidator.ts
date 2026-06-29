import { z } from 'zod'

export const ChatSchema = z.object({
  message:      z.string().min(1).max(2000).trim(),
  sessionId:    z.string().min(1).max(100),
  contextType:  z.enum(['booking', 'provider', 'complaint', 'credits', 'general'])
                 .default('general'),
  contextId:    z.string().uuid().optional(),
})

export const KbArticleSchema = z.object({
  category: z.enum(['policy', 'faq', 'provider_info', 'booking_guide', 'credits']),
  title:    z.string().min(3).max(500).trim(),
  content:  z.string().min(10).max(10000).trim(),
  lang:     z.enum(['ne', 'en']).default('ne'),
})

export type ChatInput      = z.infer<typeof ChatSchema>
export type KbArticleInput = z.infer<typeof KbArticleSchema>