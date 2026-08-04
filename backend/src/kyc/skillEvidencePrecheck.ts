import axios from 'axios'
import { Prisma } from '@prisma/client'
import { prisma } from '../config/db'
import { groq, GROQ_MODELS } from '../config/groq'
import { getSignedUrl } from '../utils/cloudinary'

export { hashFileBuffer } from './fileHash'

export interface SkillEvidencePrecheck {
  documentType:    string
  certNumber:      string | null
  issuerName:      string | null
  duplicateFlag:   boolean
  stockPhotoFlag:  boolean
  aiGeneratedFlag: boolean
  confidence:      number
  reasoning:       string
}

const VISION_PROMPT = `
You are reviewing evidence a home-services provider submitted to prove a
skill (a certificate, a photo of completed work, or a reference letter).

Return ONLY a valid JSON object:
{
  "documentType": "certificate | work_photo | reference | unclear",
  "certNumber": "string or null — only for a certificate, the printed certificate/registration number",
  "issuerName": "string or null — only for a certificate, the issuing institution's name",
  "stockPhotoFlag": true or false,
  "aiGeneratedFlag": true or false,
  "confidence": 0.0 to 1.0,
  "reasoning": "one sentence summary"
}

Rules:
- stockPhotoFlag: true if this looks like a generic stock photo (watermarks,
  professional studio staging unrelated to a real jobsite, or a well-known
  stock-image composition) rather than a provider's own work/document.
- aiGeneratedFlag: true if the image shows signs of AI generation (unnatural
  textures, warped text/hands/tools, inconsistent lighting typical of
  synthesis, or an obviously synthetic certificate template).
- Extract certNumber/issuerName only when documentType is "certificate" and
  the text is actually legible; otherwise null. Do not guess.
- Return ONLY the JSON object. No markdown, no explanation outside JSON.
`.trim()

const fetchImageAsBase64 = async (url: string): Promise<string> => {
  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 })
  return Buffer.from(response.data).toString('base64')
}

const runVisionCheck = async (imageUrl: string): Promise<Omit<SkillEvidencePrecheck, 'duplicateFlag'>> => {
  const base64 = await fetchImageAsBase64(imageUrl)

  const completion = await groq.chat.completions.create({
    model:       GROQ_MODELS.VISION,
    max_tokens:  400,
    temperature: 0,
    messages: [
      { role: 'system', content: VISION_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}`, detail: 'high' } },
          { type: 'text', text: 'Assess this skill evidence submission.' },
        ],
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'

  try {
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return {
      documentType:    parsed.documentType ?? 'unclear',
      certNumber:      parsed.certNumber ?? null,
      issuerName:      parsed.issuerName ?? null,
      stockPhotoFlag:  !!parsed.stockPhotoFlag,
      aiGeneratedFlag: !!parsed.aiGeneratedFlag,
      confidence:      typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      reasoning:       parsed.reasoning ?? '',
    }
  } catch {
    // A failed/unparseable AI check is not a reason to block a human review —
    // it just means this submission gets no AI assist, same as before this
    // feature existed.
    return {
      documentType:    'unclear',
      certNumber:      null,
      issuerName:      null,
      stockPhotoFlag:  false,
      aiGeneratedFlag: false,
      confidence:      0,
      reasoning:       'AI pre-check failed to produce a result — escalate to manual review.',
    }
  }
}

/**
 * Runs the AI pre-check for one SkillEvidence row: exact-duplicate check
 * (by file hash, across other providers) + a Groq vision pass for
 * authenticity signals and (for certificates) OCR of the issuer/number.
 * Best-effort — never throws, since this only assists the always-human
 * review queue and must never block it.
 */
export const runSkillEvidencePrecheck = async (evidenceId: string): Promise<void> => {
  const evidence = await prisma.skillEvidence.findUnique({
    where:  { id: evidenceId },
    select: { id: true, providerId: true, type: true, cloudinaryId: true, fileHash: true },
  })
  if (!evidence) return

  try {
    const duplicateFlag = evidence.fileHash
      ? !!(await prisma.skillEvidence.findFirst({
          where:  { fileHash: evidence.fileHash, providerId: { not: evidence.providerId }, id: { not: evidence.id } },
          select: { id: true },
        }))
      : false

    const signedUrl = getSignedUrl(evidence.cloudinaryId, 900)
    const visionResult = await runVisionCheck(signedUrl)

    const precheck: SkillEvidencePrecheck = { ...visionResult, duplicateFlag }

    await prisma.skillEvidence.update({
      where: { id: evidenceId },
      data: {
        aiPrecheck: precheck as unknown as Prisma.InputJsonValue,
        ...(evidence.type === 'certificate' && visionResult.certNumber ? { certNumber: visionResult.certNumber } : {}),
        ...(evidence.type === 'certificate' && visionResult.issuerName ? { issuerName: visionResult.issuerName } : {}),
      },
    })
  } catch (err) {
    console.error(`⚠️ Skill evidence pre-check failed for ${evidenceId}:`, err)
  }
}
