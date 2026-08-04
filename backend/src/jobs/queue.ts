import Bull from 'bull'

const redisUrl = process.env.REDIS_URI || process.env.REDIS_URL
const isRedisEnabled = !!redisUrl

type JobHandler = (job: { data: any; progress: (n: number) => Promise<void> }) => Promise<any> | any

const createMockQueue = (name: string) => {
  console.log(`ℹ️ Mock queue "${name}" initialized (Redis not available)`)
  const handlers = new Map<string, JobHandler>()
  const listeners = new Map<string, ((...args: any[]) => void)[]>()

  const emit = (event: string, ...args: any[]) => {
    for (const fn of listeners.get(event) ?? []) fn(...args)
  }

  return {
    add: (jobName: string, data: any, opts?: { delay?: number; repeat?: any }) => {
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
      // NOTE: repeatable cron jobs (maintenanceQueue's "expire-guarantees" etc.)
      // fire once in mock mode instead of on a schedule — fine for dev without Redis.
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

// Parse the URL once and build a shared options object so every Bull
// queue's internal connections (client/subscriber/bclient) get the same
// keepAlive + retry + TLS tuning — passing a bare string leaves Bull's
// ioredis instances on defaults, which Upstash's idle-connection resets
// don't tolerate well.
const buildRedisOptions = (url: string) => {
  const parsed = new URL(url)
  return {
    port: Number(parsed.port) || 6379,
    host: parsed.hostname,
    password: parsed.password || undefined,
    username: parsed.username || undefined,
    tls: parsed.protocol === 'rediss:' ? {} : undefined,
    keepAlive: 30000,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
      if (times > 20) return null
      return Math.min(times * 200, 5000)
    },
  }
}

let kycQueue: any
let trustQueue: any
let moderationQueue: any
let escrowQueue: any
let dispatchQueue: any
let maintenanceQueue: any

if (isRedisEnabled && redisUrl) {
  try {
    const redisOptions = buildRedisOptions(redisUrl)

    kycQueue = new Bull('kyc-pipeline', {
      redis: redisOptions,
      defaultJobOptions: { removeOnComplete: 50, removeOnFail: 100 },
    })
    trustQueue = new Bull('trust-recompute', { redis: redisOptions })
    moderationQueue = new Bull('content-moderation', { redis: redisOptions })
    escrowQueue = new Bull('escrow', {
      redis: redisOptions,
      defaultJobOptions: { removeOnComplete: 50, removeOnFail: 100 },
    })
    dispatchQueue = new Bull('emergency-dispatch', { redis: redisOptions })
    maintenanceQueue = new Bull('maintenance', { redis: redisOptions })

    const queues = [
      ['kyc-pipeline', kycQueue],
      ['trust-recompute', trustQueue],
      ['content-moderation', moderationQueue],
      ['escrow', escrowQueue],
      ['emergency-dispatch', dispatchQueue],
      ['maintenance', maintenanceQueue],
    ] as const

    for (const [name, q] of queues) {
      q.on('error', (err: Error) => console.error(`❌ Queue "${name}" error:`, err.message))
    }
  } catch (err) {
    console.error('❌ Failed to initialize Bull queues, using mock queues:', err)
    kycQueue = createMockQueue('kyc-pipeline')
    trustQueue = createMockQueue('trust-recompute')
    moderationQueue = createMockQueue('content-moderation')
    escrowQueue = createMockQueue('escrow')
    dispatchQueue = createMockQueue('emergency-dispatch')
    maintenanceQueue = createMockQueue('maintenance')
  }
} else {
  kycQueue = createMockQueue('kyc-pipeline')
  trustQueue = createMockQueue('trust-recompute')
  moderationQueue = createMockQueue('content-moderation')
  escrowQueue = createMockQueue('escrow')
  dispatchQueue = createMockQueue('emergency-dispatch')
  maintenanceQueue = createMockQueue('maintenance')
}

export { kycQueue, trustQueue, moderationQueue, escrowQueue, dispatchQueue, maintenanceQueue }