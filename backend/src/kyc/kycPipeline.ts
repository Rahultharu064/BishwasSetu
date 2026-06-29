import { prisma }          from '../config/db'
import { getSignedUrl }    from '../utils/cloudinary'
import { extractIdFields, OcrResult } from './kycOcr'
import { compareFaces }    from './kycFaceMatch'
import { detectForgery }   from './kycForgery'
import axios               from 'axios'
import { Prisma } from '@prisma/client'

// Configurable threshold — default 85%
const AUTO_APPROVE_THRESHOLD = Number(
  process.env.KYC_AUTO_APPROVE_THRESHOLD ?? 0.85
)

export interface PipelineResult {
  decision:       'AUTO_APPROVE' | 'HUMAN_QUEUE'
  confidence:     number
  ocrResult:      OcrResult
  faceScore:      number
  forgeryRisk:    string
  flags:          string[]
  mismatchFields: string[]
}

// ── Field mismatch check ──────────────────────────────────────

const checkMismatches = (
  ocrResult:    { fullName: string | null; idNumber: string | null },
  providerName: string
): string[] => {
  const mismatches: string[] = []

  if (ocrResult.fullName) {
    // Normalize both names for comparison (lowercase, remove extra spaces)
    const ocrName      = ocrResult.fullName.toLowerCase().replace(/\s+/g, ' ').trim()
    const providerName_ = providerName.toLowerCase().replace(/\s+/g, ' ').trim()

    // Allow partial match (first + last name match even if middle name differs)
    const ocrParts      = ocrName.split(' ')
    const providerParts = providerName_.split(' ')

    const firstMatch = ocrParts[0] === providerParts[0]
    const lastMatch  = ocrParts[ocrParts.length - 1] === providerParts[providerParts.length - 1]

    if (!firstMatch || !lastMatch) {
      mismatches.push(
        `Name mismatch: ID shows "${ocrResult.fullName}", profile shows "${providerName}"`
      )
    }
  }

  return mismatches
}

// ── Compute overall confidence score ─────────────────────────

const computeConfidence = (params: {
  ocrConfidence:    number
  faceScore:        number
  forgeryRisk:      string
  mismatchCount:    number
  hasAllDocuments:  boolean
}): number => {
  const {
    ocrConfidence,
    faceScore,
    forgeryRisk,
    mismatchCount,
    hasAllDocuments,
  } = params

  // Weighted components
  let score =
    ocrConfidence  * 0.30 +
    faceScore      * 0.40 +
    (hasAllDocuments ? 0.10 : 0)

  // Forgery penalty
  if (forgeryRisk === 'medium') score -= 0.15
  if (forgeryRisk === 'high')   score -= 0.40

  // Mismatch penalty
  score -= mismatchCount * 0.10

  return Math.max(0, Math.min(1, score))
}

// ── Main pipeline ─────────────────────────────────────────────

export const runKycPipeline = async (
  providerId: string
): Promise<PipelineResult> => {

  // 1. Fetch provider profile + documents
  const [provider, documents] = await Promise.all([
    prisma.provider.findUnique({
      where:  { id: providerId },
      select: { legalName: true },
    }),
    prisma.kycDocument.findMany({
      where: { providerId },
    }),
  ])

  if (!provider) {
    throw new Error(`Provider ${providerId} not found`)
  }

  const govIdDoc     = documents.find((d) => d.type === 'government_id')
  const selfieDoc    = documents.find((d) => d.type === 'selfie')
  const certDoc      = documents.find((d) => d.type === 'certificate')
  const hasAllDocs   = Boolean(govIdDoc && selfieDoc && certDoc)

  if (!govIdDoc || !selfieDoc) {
    throw new Error('Required KYC documents missing')
  }

  // 2. Generate fresh signed URLs for AI access (15 min TTL)
  const govIdSignedUrl  = getSignedUrl(govIdDoc.cloudinaryId,  900)
  const selfieSignedUrl = getSignedUrl(selfieDoc.cloudinaryId, 900)

  // 3. Fetch document buffers for EXIF analysis
  const [govIdBuffer] = await Promise.all([
    axios.get(govIdSignedUrl,  { responseType: 'arraybuffer', timeout: 15000 })
      .then((r) => Buffer.from(r.data)),
  ])

  // 4. Run all AI checks in parallel
  const [ocrResult, faceMatchResult, forgeryResult] = await Promise.all([
    extractIdFields(govIdSignedUrl),
    compareFaces(selfieSignedUrl, govIdSignedUrl),
    detectForgery(govIdSignedUrl, govIdBuffer),
  ])

  // 5. Field mismatch check
  const mismatchFields = checkMismatches(
    { fullName: ocrResult.fullName, idNumber: ocrResult.idNumber },
    provider.legalName
  )

  // 6. Compute overall confidence
  const confidence = computeConfidence({
    ocrConfidence:   ocrResult.confidence,
    faceScore:       faceMatchResult.similarity,
    forgeryRisk:     forgeryResult.risk,
    mismatchCount:   mismatchFields.length,
    hasAllDocuments: hasAllDocs,
  })

  // 7. Collect all flags
  const flags: string[] = [
    ...forgeryResult.flags,
    ...mismatchFields,
    ...(!faceMatchResult.passed ? [`Face match failed: similarity ${(faceMatchResult.similarity * 100).toFixed(0)}%`] : []),
  ]

  // 8. Decision
  const decision: 'AUTO_APPROVE' | 'HUMAN_QUEUE' =
    confidence >= AUTO_APPROVE_THRESHOLD && flags.length === 0
      ? 'AUTO_APPROVE'
      : 'HUMAN_QUEUE'

  // 9. Save AI decision log
 await prisma.kycAiDecision.create({
  data: {
    providerId,
    ocrResult: ocrResult as unknown as Prisma.InputJsonValue,
    faceScore: faceMatchResult.similarity,
    forgeryRisk: forgeryResult.risk,
    confidence,
    decision,
    modelVer: 'groq-llama-3.2-90b-vision-preview-v1',
  },
})

  // 10. Apply decision
  if (decision === 'AUTO_APPROVE') {
    await prisma.provider.update({
      where: { id: providerId },
      data: { identityStatus: 'VERIFIED' },
    })
    console.log(`✅ Identity KYC AUTO-APPROVED: provider ${providerId} (confidence: ${(confidence * 100).toFixed(1)}%)`)
  } else {
    // Leave status as UNDER_REVIEW — admin sees it in the queue
    console.log(`🔶 Identity KYC HUMAN_QUEUE: provider ${providerId} (confidence: ${(confidence * 100).toFixed(1)}%, flags: ${flags.length})`)
  }

 return {
    decision,
    confidence,
    ocrResult,
    faceScore: faceMatchResult.similarity,
    forgeryRisk: forgeryResult.risk,
    flags,
    mismatchFields,
  }
}