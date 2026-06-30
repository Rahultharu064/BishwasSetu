import { groq, GROQ_MODELS } from '../config/groq'

export interface ModerationResult {
  passed:     boolean
  category:   string | null   // null if passed
  confidence: number
  reason:     string | null
}

const MODERATION_SYSTEM_PROMPT = `
You are a content moderation classifier for a home services marketplace in Nepal.
Classify the provided user-generated text.

Return ONLY a valid JSON object:
{
  "passed": true or false,
  "category": "null | hate_speech | harassment | threat | doxxing | spam | explicit",
  "confidence": 0.0 to 1.0,
  "reason": "one sentence if failed, null if passed"
}

Rules:
- passed: true if content is acceptable (criticism, complaints, and negative reviews are acceptable)
- passed: false ONLY for: hate speech, personal attacks, threats, doxxing, spam, explicit content
- A 1-star review with harsh but fair criticism → passed: true
- Slurs, threats, or personal identifiable information → passed: false
- Return ONLY JSON. No markdown. No explanation outside JSON.
`.trim()

export const moderateContent = async (
  text: string
): Promise<ModerationResult> => {
  if (!text?.trim()) {
    return { passed: true, category: null, confidence: 1.0, reason: null }
  }

  try {
    const completion = await groq.chat.completions.create({
      model:       GROQ_MODELS.MODERATION,
      max_tokens:  256,
      temperature: 0,
      messages: [
        { role: 'system', content: MODERATION_SYSTEM_PROMPT },
        { role: 'user',   content: `Classify this review text:\n\n"${text}"` },
      ],
    })

    const raw     = completion.choices[0]?.message?.content ?? '{}'
    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned) as ModerationResult
  } catch {
    // On failure — default to passed (don't block reviews on AI error)
    return { passed: true, category: null, confidence: 0.5, reason: null }
  }
}