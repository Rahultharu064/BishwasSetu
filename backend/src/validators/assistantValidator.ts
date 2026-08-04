import { z } from 'zod'

export const ChatSchema = z.object({
  message:      z.string().min(1).max(2000).trim(),
  sessionId:    z.string().min(1).max(100),
  contextType:  z.enum(['booking', 'provider', 'complaint', 'credits', 'general'])
                 .default('general'),
  contextId:    z.string().uuid().optional(),
  // The site's selected EN/NE language toggle — used only as a fallback
  // when the message itself doesn't clearly signal a language (see
  // detectLanguage in assistant/assistantRetrieval.ts). A message typed in
  // the other language/script still wins; this just replaces the previous
  // hardcoded English default for ambiguous messages ("ok", "hi", numbers).
  uiLang:       z.enum(['ne', 'en']).optional(),
})

export const KbArticleSchema = z.object({
  category: z.enum(['policy', 'faq', 'provider_info', 'booking_guide', 'credits']),
  title:    z.string().min(3).max(500).trim(),
  content:  z.string().min(10).max(10000).trim(),
  lang:     z.enum(['ne', 'en']).default('ne'),
})

export const FeedbackSchema = z.object({
  sessionId:    z.string().min(1).max(100),
  messageIndex: z.number().int().min(0),
  rating:       z.enum(['up', 'down']),
  // Sources shown alongside the rated answer — passed through from the
  // 'meta' SSE event the client already received, so we don't need to
  // re-run retrieval just to know what the answer was grounded in.
  sources:      z.array(z.object({
    title:    z.string(),
    category: z.string(),
  })).max(10).default([]),
  comment:      z.string().max(500).trim().optional(),
})

export type ChatInput      = z.infer<typeof ChatSchema>
export type KbArticleInput = z.infer<typeof KbArticleSchema>
export type FeedbackInput  = z.infer<typeof FeedbackSchema>