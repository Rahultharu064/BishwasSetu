import Redis from 'ioredis'

// Enabled whenever REDIS_URI/REDIS_URL is configured, local or remote —
// connection failures degrade to null below (fail-fast, no retries), and
// every consumer already null-checks `redis` before use.
const redisUrl = process.env.REDIS_URI || process.env.REDIS_URL
const isRedisEnabled = !!redisUrl

// `redis` is a live-updating export (not a one-time snapshot) — every
// consumer does `if (redis) {...}` expecting that check to reflect the
// *current* connection state, so nulling it out on error must actually be
// visible to importers, not just to this module's local variable.
export let redis: Redis | null = null

if (isRedisEnabled && redisUrl) {
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      retryStrategy: () => {
        // Don't retry at all - fail fast
        return null
      },
      enableReadyCheck: false
    })

    redis.on('connect', () => console.log('✅ Redis connected'))
    redis.on('error', (err: any) => {
      console.error('❌ Redis connection error (will not retry):', err.message)
      redis = null
    })

    // Don't automatically connect - let server.ts handle it
  } catch (err) {
    console.error('❌ Failed to initialize Redis:', err)
    redis = null
  }
} else {
  console.log('ℹ️ Redis disabled - using in-memory storage')
}

// Handle termination signals
const cleanup = async () => {
  if (redis) {
    try {
      await redis.quit()
    } catch (err) {
      // Ignore cleanup errors
    }
  }
  process.exit(0)
}

process.on('SIGTERM', cleanup)
process.on('SIGINT', cleanup)