import { prisma } from '../config/db'
import { uploadToCloudinary, getSignedUrl } from '../utils/cloudinary'
import { kycQueue } from '../jobs/queue'
import { features } from '../config/features'
import { sendPushNotification } from '../utils/firebase'
import { sendSms } from '../utils/sms'

async function notifyProvider(providerId: string, title: string, body: string) {
  const provider = await prisma.provider.findUnique({
    where:  { id: providerId },
    select: { user: { select: { fcmToken: true, phone: true } } },
  })
  if (provider?.user?.fcmToken) {
    await sendPushNotification({ token: provider.user.fcmToken, title, body })
  }
  if (provider?.user?.phone) {
    await sendSms(provider.user.phone, `GharSewa: ${body}`)
  }
}

// ── Upload KYC documents ──────────────────────────────────────

export const uploadKycDocuments = async (
  providerId: string,
  files: {
    governmentId?: Express.Multer.File[]
    selfie?:       Express.Multer.File[]
    certificate?:  Express.Multer.File[]
  }
) => {
  const provider = await prisma.provider.findUnique({
    where:  { id: providerId },
    select: { identityStatus: true, skillStatus: true },
  })

  if (!provider) {
    throw { code: 'PROVIDER_NOT_FOUND', message: 'Provider not found', status: 404 }
  }

  // Can only upload when PENDING_DOCUMENTS or REJECTED
  if (!['PENDING_DOCUMENTS', 'REJECTED'].includes(provider.identityStatus)) {
    throw {
      code:    'INVALID_KYC_STATE',
      message: `Cannot upload documents in status: ${provider.identityStatus}`,
      status:  400,
    }
  }

  const hasIdAndSelfie = !!(files.governmentId?.[0] && files.selfie?.[0])
  const hasCertificate = !!files.certificate?.[0]

  if (!hasIdAndSelfie && !hasCertificate) {
    throw {
      code:    'MISSING_REQUIRED_DOCUMENTS',
      message: 'You must provide either a Government ID with a selfie, or a professional certificate.',
      status:  400,
    }
  }

  const uploads: Array<{ type: string; buffer: Buffer; mimetype: string }> = []

  if (hasIdAndSelfie) {
    uploads.push(
      { type: 'government_id', buffer: files.governmentId![0].buffer, mimetype: files.governmentId![0].mimetype },
      { type: 'selfie',        buffer: files.selfie![0].buffer,       mimetype: files.selfie![0].mimetype }
    )
  }

  if (hasCertificate) {
    uploads.push({
      type:     'certificate',
      buffer:   files.certificate![0].buffer,
      mimetype: files.certificate![0].mimetype,
    })
  }

  // Upload to Cloudinary private/authenticated folder
  const uploaded = await Promise.all(
    uploads.map(async ({ type, buffer, mimetype }) => {
      const ext      = mimetype.split('/')[1]
      const filename = `kyc_${providerId}_${type}_${Date.now()}`

      const result = await uploadToCloudinary(
        buffer,
        'bishwassetu/kyc',   // private folder in Cloudinary
        filename,
        { type: 'authenticated' }   // requires signed URL to access
      )

      return { type, cloudinaryId: result.publicId, url: result.secureUrl }
    })
  )

  // Save document records (replace existing for this provider)
  await prisma.$transaction(async (tx) => {
    await tx.kycDocument.deleteMany({ where: { providerId } })

    await tx.kycDocument.createMany({
      data: uploaded.map((doc) => ({
        providerId,
        type:        doc.type,
        cloudinaryId: doc.cloudinaryId,
        url:         doc.url,
      })),
    })

    // Move status to UNDER_REVIEW
    await tx.provider.update({
      where: { id: providerId },
      data:  { identityStatus: 'UNDER_REVIEW', identityRejectionReason: null },
    })
  })

  // MVP: during the pilot, skip the paid AI pipeline entirely (no OCR /
  // Rekognition / Groq-vision spend). Submissions wait in the admin queue for
  // a human to approve/reject. Flip KYC_MANUAL_REVIEW=false to re-enable the
  // AI pre-screening pipeline once volume justifies its per-signup cost.
  if (features.kycManualReview) {
    return {
      status:  'UNDER_REVIEW',
      message: 'Documents uploaded. Awaiting admin review.',
    }
  }

  // Enqueue AI pipeline job
  await kycQueue.add(
    'process-kyc',
    { providerId },
    { attempts: 3, backoff: { type: 'exponential', delay: 5000 } }
  )

  return {
    status:  'UNDER_REVIEW',
    message: 'Documents uploaded. AI verification in progress.',
  }
}

// ── GET KYC status ────────────────────────────────────────────

export const getKycStatus = async (providerId: string) => {
  const provider = await prisma.provider.findUnique({
    where:  { id: providerId },
    select: {
      identityStatus:          true,
      skillStatus:             true,
      identityRejectionReason: true,
      skillRejectionReason:    true,
    },
  })

  if (!provider) {
    throw { code: 'PROVIDER_NOT_FOUND', message: 'Provider not found', status: 404 }
  }

  // Get latest AI decision for confidence display
  const aiDecision = await prisma.kycAiDecision.findFirst({
    where:   { providerId },
    orderBy: { createdAt: 'desc' },
    select: {
      confidence:    true,
      forgeryRisk:   true,
      decision:      true,
      adminOverride: true,
    },
  })

  // Get uploaded document types (not the URLs — those need signed URLs)
  const documents = await prisma.kycDocument.findMany({
    where:  { providerId },
    select: { type: true, uploadedAt: true },
  })

  return {
    identityStatus:          provider.identityStatus,
    skillStatus:             provider.skillStatus,
    identityRejectionReason: provider.identityRejectionReason,
    skillRejectionReason:    provider.skillRejectionReason,
    documents,
    aiDecision,
  }
}

// ── Get signed KYC document URLs (admin only) ──────────────────

export const getKycDocumentsForAdmin = async (providerId: string) => {
  const documents = await prisma.kycDocument.findMany({
    where: { providerId },
  })

  // Generate fresh 15-minute signed URLs for each document
  return documents.map((doc) => ({
    ...doc,
    signedUrl: getSignedUrl(doc.cloudinaryId, 900),
  }))
}

// ── Admin: approve KYC ────────────────────────────────────────

export const approveKyc = async (providerId: string, adminId: string) => {
  await prisma.$transaction(async (tx) => {
    await tx.provider.update({
      where: { id: providerId },
      data:  {
        identityStatus:          'VERIFIED',
        identityRejectionReason: null,
      },
    })

    await tx.kycAiDecision.updateMany({
      where: { providerId },
      data:  { adminOverride: 'APPROVE' },
    })
  })

  await notifyProvider(providerId, 'KYC approved', 'Your identity verification is complete — you now have full platform access.')
  return { message: 'Provider KYC approved', providerId }
}

// ── Admin: reject KYC ─────────────────────────────────────────

export const rejectKyc = async (
  providerId: string,
  reason:     string,
  adminId:    string
) => {
  if (!reason?.trim()) {
    throw { code: 'REJECTION_REASON_REQUIRED', message: 'Rejection reason is required', status: 400 }
  }

  await prisma.$transaction(async (tx) => {
    await tx.provider.update({
      where: { id: providerId },
      data:  {
        identityStatus:          'REJECTED',
        identityRejectionReason: reason,
      },
    })

    await tx.kycAiDecision.updateMany({
      where: { providerId },
      data:  { adminOverride: 'REJECT' },
    })
  })

  await notifyProvider(providerId, 'KYC needs attention', `Your identity verification was rejected: ${reason}`)
  return { message: 'Provider KYC rejected', providerId }
}