/**
 * KYC document retention & data-minimization (see docs/DATA_RETENTION_AND_SECURITY.md).
 *
 * Sensitive identity images (government ID, selfie) must NOT be kept longer
 * than the platform actually needs them. This worker purges KYC document
 * images from Cloudinary AND their DB rows once the relevant retention window
 * has passed. The provider's verification *status* (VERIFIED / REJECTED) is
 * kept on the Provider record — only the raw images are destroyed.
 *
 * Windows are env-configurable so legal/ops can tune them without a deploy:
 *   KYC_REJECTED_RETENTION_DAYS  (default 30)  — rejected submissions
 *   KYC_VERIFIED_RETENTION_DAYS  (default 90)  — approved raw ID images
 *
 * Runs purely on node-cron (no Redis dependency) — scheduled in server.ts.
 */
import { prisma } from '../config/db'
import { deletefromcloudinary } from '../utils/cloudinary'

const REJECTED_RETENTION_DAYS = Number(process.env.KYC_REJECTED_RETENTION_DAYS ?? 30)
const VERIFIED_RETENTION_DAYS = Number(process.env.KYC_VERIFIED_RETENTION_DAYS ?? 90)

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000)

/**
 * Purge KYC document images whose retention window has elapsed.
 * Deletes the Cloudinary asset first, then the DB row (best-effort per doc so
 * one bad asset doesn't block the batch).
 */
export const purgeExpiredKycDocuments = async (): Promise<{ purged: number }> => {
  // Providers whose retention window has passed, grouped by track.
  const [rejectedProviders, verifiedProviders] = await Promise.all([
    prisma.provider.findMany({
      where: { identityStatus: 'REJECTED', updatedAt: { lt: daysAgo(REJECTED_RETENTION_DAYS) } },
      select: { id: true },
    }),
    prisma.provider.findMany({
      where: { identityStatus: 'VERIFIED', updatedAt: { lt: daysAgo(VERIFIED_RETENTION_DAYS) } },
      select: { id: true },
    }),
  ])

  const providerIds = [...rejectedProviders, ...verifiedProviders].map((p) => p.id)
  if (providerIds.length === 0) return { purged: 0 }

  const documents = await prisma.kycDocument.findMany({
    where: { providerId: { in: providerIds } },
    select: { id: true, cloudinaryId: true },
  })

  let purged = 0
  for (const doc of documents) {
    try {
      await deletefromcloudinary(doc.cloudinaryId)
      await prisma.kycDocument.delete({ where: { id: doc.id } })
      purged++
    } catch (err: any) {
      console.error(`⚠️  KYC retention: failed to purge document ${doc.id}:`, err?.message ?? err)
    }
  }

  console.log(`🧹 KYC retention: purged ${purged}/${documents.length} expired document images`)
  return { purged }
}
