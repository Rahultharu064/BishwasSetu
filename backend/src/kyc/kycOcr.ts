import { groq, GROQ_MODELS } from '../config/groq'
import axios from 'axios'

export interface OcrResult {
  fullName:    string | null
  dateOfBirth: string | null   // ISO format: YYYY-MM-DD
  idNumber:    string | null
  idType:      string | null   // 'citizenship' | 'passport' | 'license'
  expiryDate:  string | null
  issuedBy:    string | null
  confidence:  number          // 0–1, model's self-assessed confidence
  rawText:     string          // full extracted text for audit
}

const OCR_SYSTEM_PROMPT = `
You are a document OCR specialist for Nepal government-issued IDs.
Extract structured information from the provided ID document image.

Return ONLY a valid JSON object with these exact fields:
{
  "fullName": "string or null",
  "dateOfBirth": "YYYY-MM-DD or null",
  "idNumber": "string or null",
  "idType": "citizenship | passport | license | unknown",
  "expiryDate": "YYYY-MM-DD or null",
  "issuedBy": "string or null",
  "confidence": 0.0 to 1.0,
  "rawText": "all visible text from the document"
}

Rules:
- Extract text exactly as it appears. Do not infer or guess missing fields.
- For Nepali Devanagari script, transliterate to Latin script.
- Set confidence based on image clarity and field completeness.
- If a field is not visible or unreadable, set it to null.
- Return ONLY the JSON object. No explanation, no markdown.
`.trim()

// Fetch image as base64 from a URL
const fetchImageAsBase64 = async (url: string): Promise<string> => {
  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 })
  return Buffer.from(response.data).toString('base64')
}

export const extractIdFields = async (
  imageUrl: string,
  mimeType: string = 'image/jpeg'
): Promise<OcrResult> => {
  const base64 = await fetchImageAsBase64(imageUrl)

  const completion = await groq.chat.completions.create({
    model:       GROQ_MODELS.VISION,
    max_tokens:  1024,
    temperature: 0,   // deterministic output for structured extraction
    messages: [
      {
        role:    'system',
        content: OCR_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type:      'image_url',
            image_url: {
              url:    `data:${mimeType};base64,${base64}`,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: 'Extract all fields from this government ID document.',
          },
        ],
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'

  try {
    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const parsed  = JSON.parse(cleaned) as OcrResult
    return parsed
  } catch {
    // Return a low-confidence result if parsing fails
    return {
      fullName:    null,
      dateOfBirth: null,
      idNumber:    null,
      idType:      'unknown',
      expiryDate:  null,
      issuedBy:    null,
      confidence:  0.1,
      rawText:     raw,
    }
  }
}