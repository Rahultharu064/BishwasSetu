import Bull from 'bull'

// Don't use Redis by default - only if explicitly configured to a non-localhost address
const redisUrl = process.env.REDIS_URI || process.env.REDIS_URL
const isRedisEnabled = !!(
  redisUrl && 
  !redisUrl.includes('localhost') && 
  !redisUrl.includes('127.0.0.1') &&
  !redisUrl.includes('::1')
)

// Create mock queue functions for when Redis is not available
const createMockQueue = (name: string) => {
  console.log(`ℹ️ Mock queue "${name}" initialized (Redis not available)`)
  return {
    add: (jobName: string, data: any) => {
      console.log(`ℹ️ Mock queue "${name}" ignoring job "${jobName}":`, data)
      return Promise.resolve({ id: 'mock-job' })
    },
    process: () => {},
    close: () => Promise.resolve(),
    on: () => {},
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