import Redis from 'ioredis'

export const redis = new Redis(process.env.REDIS_URI || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
})

redis.on('connect', () => console.log('✅ Redis connected'))
redis.on('error', (err: any) => console.error('❌ Redis error:', err))

redis.connect()

// Handle termination signals
const cleanup = () => {
  redis.quit()
  process.exit(0)
}

process.on('SIGTERM', cleanup)
process.on('SIGINT', cleanup)