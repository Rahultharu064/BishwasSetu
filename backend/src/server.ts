import 'dotenv/config'
import app          from './app'
import { prisma }   from './config/db'
import { redis }    from './config/redis'
import { logger }   from './utils/logger'
import { trustQueue, kycQueue, moderationQueue } from './jobs/queue'
import cron         from 'node-cron'

// Import workers
import './jobs/kyc.job'
import './jobs/trust.job'
import './jobs/moderation.job'

const PORT = Number(process.env.PORT ?? 4000)

let server: ReturnType<typeof app.listen>

async function bootstrap() {
  try {
    await prisma.$connect()
    logger.info('Database connected')

    await redis.connect()
    logger.info('Redis connected')

    // Daily trust decay — 2 AM Nepal time (UTC+5:45 → 20:15 UTC previous day)
    cron.schedule('15 20 * * *', async () => {
      logger.info('Scheduling daily trust decay...')
      await trustQueue.add('decay-all', {})
    })

    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, { env: process.env.NODE_ENV })
    })

  } catch (error) {
    logger.error('Bootstrap failed', { error })
    await shutdown(1)
  }
}

// ── Graceful shutdown ──────────────────────────────────────────

async function shutdown(code = 0) {
  logger.info('Shutting down gracefully...')

  // Stop accepting new requests
  server?.close(async () => {
    try {
      // Wait for Bull queues to finish in-progress jobs
      await Promise.all([
        trustQueue.close(),
        kycQueue.close(),
        moderationQueue.close(),
      ])

      await prisma.$disconnect()
      await redis.quit()

      logger.info('Graceful shutdown complete')
      process.exit(code)
    } catch (err) {
      logger.error('Shutdown error', { err })
      process.exit(1)
    }
  })

  // Force exit after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 30000)
}

process.on('SIGTERM', () => shutdown(0))
process.on('SIGINT',  () => shutdown(0))
process.on('uncaughtException',  (err) => { logger.error('Uncaught exception', { err }); shutdown(1) })
process.on('unhandledRejection', (err) => { logger.error('Unhandled rejection', { err }); shutdown(1) })

bootstrap()