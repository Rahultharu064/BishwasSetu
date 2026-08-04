import { kycQueue }       from './queue'
import { runKycPipeline } from '../kyc/kycPipeline'
import { prisma }         from '../config/db'
import type { Job } from 'bull'

kycQueue.process('run-pipeline', 3, async (job: Job) => {
  const { providerId } = job.data as { providerId: string }

  console.log(`🔍 KYC pipeline started for provider: ${providerId}`)

  // Mark provider as under review
  await prisma.provider.update({
    where: { id: providerId },
    data:  { identityStatus: 'UNDER_REVIEW' },
  })

  await job.progress(10)

  const result = await runKycPipeline(providerId)

  await job.progress(100)

  console.log(
    `✅ KYC pipeline complete for provider ${providerId} — decision: ${result.decision} (confidence: ${(result.confidence * 100).toFixed(1)}%)`
  )

  return result
})

// kycQueue is shared with skill-evidence pre-check jobs (see
// skillEvidencePrecheckJob.ts) — filter by job name so their failures
// aren't logged here as "provider undefined".
kycQueue.on('completed', (job: Job, result: any) => {
  if (job.name !== 'run-pipeline') return
  console.log(
    `✅ KYC job done: provider=${job.data.providerId} decision=${result.decision}`
  )
})

kycQueue.on('failed', (job: Job, err: Error) => {
  if (job.name !== 'run-pipeline') return
  console.error(`❌ KYC job failed for provider ${job.data.providerId}:`, err.message)
})

console.log('🚀 KYC worker started')
