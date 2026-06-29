import { groq, GROQ_MODELS } from '../config/groq'
import * as exifr from 'exifr'
import axios from 'axios'

export type ForgeryRisk = 'low' | 'medium' | 'high'

export interface ForgeryResult {
  risk:         ForgeryRisk
  flags:        string[]       // list of specific flags found
  confidence:   number
  aiReasoning:  string
}

const FORGERY_PROMPT = `
You are a document authentication specialist for Nepal government IDs.
Analyze this document image for signs of forgery or tampering.

Look for:
1. Digital editing artifacts (unnatural edges, inconsistent fonts, pixel anomalies)
2. Misaligned text or fields
3. Inconsistent lighting or shadows suggesting compositing
4. Unusual background patterns or security feature anomalies
5. Signs of text overlay or erasure

Return ONLY a valid JSON object:
{
  "risk": "low | medium | high",
  "flags": ["flag1", "flag2"],
  "confidence": 0.0 to 1.0,
  "aiReasoning": "one sentence summary"
}

- risk "low": document appears genuine
- risk "medium": minor anomalies worth human review
- risk "high": clear signs of tampering
- flags: empty array if risk is low
- Return ONLY JSON. No markdown.
`.trim()

const fetchBuffer = async (url: string): Promise<Buffer> => {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout:      10000,
  })
  return Buffer.from(response.data)
}

// Check EXIF metadata for anomalies
const checkExifAnomalies = async (buffer: Buffer): Promise<string[]> => {
  const flags: string[] = []

  try {
    const exif = await exifr.parse(buffer, {
      tiff: true, exif: true, gps: true, icc: false,
    })

    if (!exif) {
      // PDFs and screenshots often lack EXIF — not necessarily suspicious
      return flags
    }

    // Flag: software manipulation tools detected
    const suspiciousSoftware = [
      'Adobe Photoshop', 'GIMP', 'Paint.NET',
      'Snapseed', 'PicsArt', 'PhotoRoom',
    ]
    if (exif.Software) {
      const sw = String(exif.Software)
      if (suspiciousSoftware.some((s) => sw.includes(s))) {
        flags.push(`Edited with: ${exif.Software}`)
      }
    }

    // Flag: creation date ≠ modification date by large margin
    if (exif.DateTimeOriginal && exif.DateTime) {
      const original  = new Date(exif.DateTimeOriginal).getTime()
      const modified  = new Date(exif.DateTime).getTime()
      const diffHours = Math.abs(modified - original) / (1000 * 60 * 60)
      if (diffHours > 24) {
        flags.push(`File modified ${Math.round(diffHours)} hours after creation`)
      }
    }

    // Flag: screenshot-like dimensions (exactly round numbers)
    if (exif.ImageWidth && exif.ImageHeight) {
      const w = Number(exif.ImageWidth)
      const h = Number(exif.ImageHeight)
      if (w % 100 === 0 && h % 100 === 0) {
        flags.push('Suspicious screenshot-like dimensions')
      }
    }
  } catch {
    // EXIF parse failure — not a critical flag
  }

  return flags
}

export const detectForgery = async (
  documentUrl: string,
  buffer:      Buffer
): Promise<ForgeryResult> => {
  const [exifFlags, base64] = await Promise.all([
    checkExifAnomalies(buffer),
    Promise.resolve(buffer.toString('base64')),
  ])

  // Run AI visual forgery check
  const completion = await groq.chat.completions.create({
    model:       GROQ_MODELS.VISION,
    max_tokens:  512,
    temperature: 0,
    messages: [
      { role: 'system', content: FORGERY_PROMPT },
      {
        role: 'user',
        content: [
          {
            type:      'image_url',
            image_url: {
              url:    `data:image/jpeg;base64,${base64}`,
              detail: 'high',
            },
          },
          { type: 'text', text: 'Analyze this document for forgery indicators.' },
        ],
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'

  let aiResult: Omit<ForgeryResult, 'flags'> & { flags: string[] }
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim()
    aiResult = JSON.parse(cleaned)
  } catch {
    aiResult = {
      risk:        'medium',
      flags:       [],
      confidence:  0.5,
      aiReasoning: 'Unable to parse AI forgery response — escalate to human review',
    }
  }

  // Merge EXIF flags with AI flags
  const allFlags = [...new Set([...aiResult.flags, ...exifFlags])]

  // Escalate risk if EXIF flags found
  let finalRisk = aiResult.risk
  if (exifFlags.length > 0 && finalRisk === 'low') finalRisk = 'medium'
  if (exifFlags.length > 1) finalRisk = 'high'

  return {
    risk:        finalRisk,
    flags:       allFlags,
    confidence:  aiResult.confidence,
    aiReasoning: aiResult.aiReasoning,
  }
}