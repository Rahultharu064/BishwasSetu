import { groq, GROQ_MODELS } from '../config/groq'
import axios from 'axios'

export interface FaceMatchResult {
  similarity:   number    // 0–1
  passed:       boolean   // true if similarity ≥ threshold
  confidence:   number    // model's confidence in its own assessment
  reasoning:    string    // brief explanation
}

const FACE_MATCH_THRESHOLD = 0.75

const FACE_MATCH_PROMPT = `
You are a facial verification specialist.
Compare the two images provided:
- Image 1: A selfie photo (live photo of a person)
- Image 2: A photo from a government ID document

Assess whether they appear to be the same person.

Return ONLY a valid JSON object:
{
  "similarity": 0.0 to 1.0,
  "passed": true or false,
  "confidence": 0.0 to 1.0,
  "reasoning": "one sentence explanation"
}

Rules:
- similarity: how likely they are the same person (0 = definitely different, 1 = definitely same)
- passed: true if similarity >= 0.75
- confidence: your confidence in this assessment
- Consider: facial structure, eyes, nose, overall face shape
- Ignore: lighting, angle, age differences up to 5 years, glasses
- Return ONLY the JSON. No markdown, no explanation outside JSON.
`.trim()

const fetchImageAsBase64 = async (url: string): Promise<string> => {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout:      10000,
  })
  return Buffer.from(response.data).toString('base64')
}

export const compareFaces = async (
  selfieUrl:   string,
  idPhotoUrl:  string
): Promise<FaceMatchResult> => {
  const [selfieBase64, idBase64] = await Promise.all([
    fetchImageAsBase64(selfieUrl),
    fetchImageAsBase64(idPhotoUrl),
  ])

  const completion = await groq.chat.completions.create({
    model:       GROQ_MODELS.VISION,
    max_tokens:  512,
    temperature: 0,
    messages: [
      {
        role:    'system',
        content: FACE_MATCH_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Image 1 — Selfie photo:',
          },
          {
            type:      'image_url',
            image_url: {
              url:    `data:image/jpeg;base64,${selfieBase64}`,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: 'Image 2 — Government ID photo:',
          },
          {
            type:      'image_url',
            image_url: {
              url:    `data:image/jpeg;base64,${idBase64}`,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: 'Are these the same person? Return JSON only.',
          },
        ],
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'

  try {
    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned) as FaceMatchResult
  } catch {
    return {
      similarity: 0,
      passed:     false,
      confidence: 0.1,
      reasoning:  'Failed to parse face match response',
    }
  }
}