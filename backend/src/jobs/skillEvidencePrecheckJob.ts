import { kycQueue } from './queue'
import { runSkillEvidencePrecheck } from '../kyc/skillEvidencePrecheck'
import type { Job } from 'bull'

kycQueue.process('skill-evidence-precheck', 3, async (job: Job) => {
  const { evidenceId } = job.data as { evidenceId: string }
  await runSkillEvidencePrecheck(evidenceId)
  return { evidenceId }
})

kycQueue.on('completed', (job: Job) => {
  if (job.name !== 'skill-evidence-precheck') return
  console.log(`✅ Skill evidence pre-check done: evidence=${job.data.evidenceId}`)
})

kycQueue.on('failed', (job: Job, err: Error) => {
  if (job.name !== 'skill-evidence-precheck') return
  console.error(`❌ Skill evidence pre-check job failed for ${job.data.evidenceId}:`, err.message)
})

console.log('🚀 Skill evidence pre-check worker started')
