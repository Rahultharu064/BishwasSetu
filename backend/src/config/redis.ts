import Redis from 'ioredis'

// Don't use Redis by default - only if explicitly configured to a non-localhost address
const redisUrl = process.env.REDIS_URI || process.env.REDIS_URL
const isRedisEnabled = !!(
  redisUrl && 
  !redisUrl.includes('localhost') && 
  !redisUrl.includes('127.0.0.1') &&
  !redisUrl.includes('::1')
)

let redisInstance: Redis | null = null

if (isRedisEnabled && redisUrl) {
  try {
    redisInstance = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      retryStrategy: () => {
        // Don't retry at all - fail fast
        return null
      },
      enableReadyCheck: false
    })

    redisInstance.on('connect', () => console.log('✅ Redis connected'))
    redisInstance.on('error', (err: any) => {
      console.error('❌ Redis connection error (will not retry):', err.message)
      redisInstance = null
    })

    // Don't automatically connect - let server.ts handle it
  } catch (err) {
    console.error('❌ Failed to initialize Redis:', err)
    redisInstance = null
  }
} else {
  console.log('ℹ️ Redis disabled - using in-memory storage')
}

export const redis = redisInstance

// Handle termination signals
const cleanup = async () => {
  if (redisInstance) {
    try {
      await redisInstance.quit()
    } catch (err) {
      // Ignore cleanup errors
    }
  }
  process.exit(0)
}

process.on('SIGTERM', cleanup)
process.on('SIGINT', cleanup)