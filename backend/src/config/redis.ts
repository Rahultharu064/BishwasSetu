import Redis from 'ioredis'

// Enabled whenever REDIS_URI/REDIS_URL is configured, local or remote.
// Unlike a cache-only client, BullMQ queues depend on this connection
// staying alive — so we retry with backoff instead of failing fast.
// Every consumer already null-checks `redis` before use, so during a
// reconnect window (redis === null) they should fall back gracefully.
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
      // BullMQ requires this to be null, not a number — its blocking
      // commands (BRPOPLPUSH etc.) will throw otherwise.
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,

      // Render-managed Redis (and most hosted Redis) requires TLS on
      // the `rediss://` scheme. Using the wrong scheme silently drops
      // the connection after it appears to open.
      tls: redisUrl.startsWith('rediss://') ? {} : undefined,

      // Retry with capped exponential backoff instead of giving up
      // immediately — cold starts / brief network blips shouldn't
      // permanently kill every queue in the app.
      retryStrategy: (times: number) => {
        if (times > 10) {
          console.error(`❌ Redis: giving up after ${times} attempts`)
          return null // stop retrying only after sustained failure
        }
        return Math.min(times * 200, 5000)
      },

      reconnectOnError: (err) => {
        console.error('❌ Redis reconnectOnError:', err.message)
        return true // attempt reconnect on any error, including READONLY etc.
      }
    })

    redis.on('connect', () => console.log('✅ Redis connected'))

    redis.on('ready', () => console.log('✅ Redis ready'))

    redis.on('error', (err: any) => {
      // Log but DON'T null out the client here — ioredis is still
      // retrying in the background per retryStrategy above. Nulling
      // on every transient error is what caused the cascading queue
      // failures.
      console.error('❌ Redis connection error (retrying):', err.message)
    })

    redis.on('close', () => {
      console.warn('⚠️ Redis connection closed')
    })

    redis.on('end', () => {
      // ioredis has exhausted retryStrategy and truly given up —
      // this is the correct place to null out the export.
      console.error('❌ Redis connection ended permanently — falling back to in-memory')
      redis = null
    })

    // Explicitly connect since lazyConnect is true; catch here so a
    // failed initial connect doesn't produce an unhandled rejection.
    redis.connect().catch((err) => {
      console.error('❌ Redis initial connect failed:', err.message)
    })
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