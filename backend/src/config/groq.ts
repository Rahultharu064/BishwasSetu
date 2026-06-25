import Groq from 'groq-sdk'

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export const GROQ_MODELS = {
  ASSISTANT:   'llama-3.3-70b-versatile',
  VISION:      'llama-3.2-90b-vision-preview',
  MODERATION:  'llama-3.1-8b-instant',
} as const