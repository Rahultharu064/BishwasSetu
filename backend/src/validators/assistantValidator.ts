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
export type ChatInput      = z.infer<typeof ChatSchema>
export type KbArticleInput = z.infer<typeof KbArticleSchema>