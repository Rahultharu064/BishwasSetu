import { trustQueue }         from './queue'
import { recomputeAndSave }   from '../services/trustService'
import { checkAnomalies }     from '../trust/trustAnomaly'
import { prisma }             from '../config/db'
import type { Job } from 'bull'

// Check if this is a real Bull queue (not a mock)
const isRealQueue = typeof trustQueue.process === 'function' && trustQueue.name !== undefined

if (isRealQueue) {
  trustQueue.process('recompute-trust', 5, async (job: Job) => {
    const { providerId, trigger, rejectionRate } = job.data as {
      providerId:    string
      trigger:       string
      rejectionRate?: number
    }

    console.log(`📊 Trust recompute [${trigger}] for provider: ${providerId}`)

    // 1. Check anomalies in parallel with score computation
    const [newScore, anomalyResult] = await Promise.all([
      recomputeAndSave(providerId, trigger),
      checkAnomalies(providerId),
    ])

    // 2. If anomalies detected — update the event with flags
    if (anomalyResult.flagged) {
      await prisma.trustScoreEvent.updateMany({
        where: {
          providerId,
          trigger,
          createdAt: { gte: new Date(Date.now() - 60000) },  // just created
        },
        data: { aiFlags: anomalyResult as object },
      })

      console.log(
        `⚠️  Anomaly detected for provider ${providerId}: ` +
        `severity=${anomalyResult.severity}, signals=${anomalyResult.signals.length}`
      )

      // High severity → place score hold (trust score update paused pending review)
      if (anomalyResult.severity === 'high') {
        console.log(`🔒 Score hold placed for provider ${providerId} — admin review required`)
        // Score is already saved — admin can see the flags in the trust anomaly queue
      }
    }

    await job.progress(100)

    return { providerId, newScore, trigger, anomalyResult }
  })

  // ── Scheduled decay job ───────────────────────────────────────
  // Runs once per day via a separate scheduled process
  // or via a cron-triggered Bull job

  trustQueue.process('decay-all', 1, async (job: Job) => {
    console.log('📉 Running trust score decay for idle providers...')

    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

    // Find providers with no recent booking activity
    const idleProviders = await prisma.provider.findMany({
      where: {
        identityStatus: 'VERIFIED',
        bookings: {
          none: {
            createdAt: { gte: sixtyDaysAgo },
            status:    { in: ['ACCEPTED', 'COMPLETED'] },
          },
        },
      },
      select: { id: true },
    })

    let decayed = 0
    for (const { id } of idleProviders) {
      await recomputeAndSave(id, 'decay')
      decayed++
    }

    console.log(`📉 Decay applied to ${decayed} idle providers`)
    return { decayed }
  })

  trustQueue.on('completed', (job: Job, result: any) => {
    if (job.name === 'recompute-trust') {
      console.log(`✅ Trust job done: provider=${result.providerId} score=${result.newScore}`)
    }
  })

  trustQueue.on('failed', (job: Job, err: Error) => {
    console.error(`❌ Trust job failed [${job.name}]:`, err.message)
  })

  console.log('🚀 Trust Score worker started')
} else {
  console.log('ℹ️ Trust Score worker disabled (Redis not available)')
}