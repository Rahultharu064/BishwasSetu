import Bull from 'bull'

// Don't use Redis by default - only if explicitly configured to a non-localhost address
const redisUrl = process.env.REDIS_URI || process.env.REDIS_URL
const isRedisEnabled = !!(
  redisUrl &&
  !redisUrl.includes('localhost') &&
  !redisUrl.includes('127.0.0.1') &&
  !redisUrl.includes('::1')
)

type JobHandler = (job: { data: any; progress: (n: number) => Promise<void> }) => Promise<any> | any

// Mock queue for when Redis is not available — mirrors config/queues.ts's
// working pattern (registers handlers, actually invokes them on add) rather
// than silently dropping every job. Includes a no-op `progress()` on the job
// object since the kyc/trust/moderation workers call `job.progress(...)`.
const createMockQueue = (name: string) => {
  console.log(`ℹ️ Mock queue "${name}" initialized (Redis not available)`)
  const handlers = new Map<string, JobHandler>()
  const listeners = new Map<string, ((...args: any[]) => void)[]>()

  const emit = (event: string, ...args: any[]) => {
    for (const fn of listeners.get(event) ?? []) fn(...args)
  }

  return {
    add: (jobName: string, data: any, opts?: { delay?: number }) => {
      // Resolve the handler at execution time, not at add() time — callers
      // (e.g. maintenanceJob.ts) schedule repeatable jobs at module load
      // before their own `.process()` registration further down the same
      // file, same as real Bull tolerates since a processor can attach any
      // time before a queued job actually runs.
      const run = () => {
        const handler = handlers.get(jobName)
        if (!handler) {
          console.log(`ℹ️ Mock queue "${name}" ignoring unknown job "${jobName}":`, data)
          return
        }
        const job = { name: jobName, data, progress: async (_n: number) => {} }
        Promise.resolve(handler(job))
          .then((result) => emit('completed', job, result))
          .catch((err) => {
            console.error(`Mock queue "${name}" job "${jobName}" failed:`, err)
            emit('failed', job, err)
          })
      }
      if (opts?.delay) setTimeout(run, opts.delay)
      else setImmediate(run)
      return Promise.resolve({ id: 'mock-job' })
    },
    process: (jobName: string, handlerOrConcurrency: JobHandler | number, maybeHandler?: JobHandler) => {
      const handler = typeof handlerOrConcurrency === 'function' ? handlerOrConcurrency : maybeHandler!
      handlers.set(jobName, handler)
    },
    close: () => Promise.resolve(),
    on: (event: string, fn: (...args: any[]) => void) => {
      const arr = listeners.get(event) ?? []
      arr.push(fn)
      listeners.set(event, arr)
    },
  } as any
}

let kycQueue: any
let trustQueue: any
let moderationQueue: any

if (isRedisEnabled && redisUrl) {
  try {
    kycQueue = new Bull('kyc-pipeline', {
      redis: redisUrl,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail:     100,
      },
    })

    trustQueue = new Bull('trust-recompute', {
      redis: redisUrl,
    })

    moderationQueue = new Bull('content-moderation', {
      redis: redisUrl,
    })
  } catch (err) {
    console.error('❌ Failed to initialize Bull queues, using mock queues:', err)
    kycQueue = createMockQueue('kyc-pipeline')
    trustQueue = createMockQueue('trust-recompute')
    moderationQueue = createMockQueue('content-moderation')
  }
} else {
  kycQueue = createMockQueue('kyc-pipeline')
  trustQueue = createMockQueue('trust-recompute')
  moderationQueue = createMockQueue('content-moderation')
}

export { kycQueue, trustQueue, moderationQueue }
