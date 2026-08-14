import 'dotenv/config'
import app          from './app'
import { Server as SocketIOServer } from 'socket.io'
import { prisma }   from './config/db'
import { redis }    from './config/redis'
import { logger }   from './utils/logger'
import { trustQueue, kycQueue, moderationQueue } from './jobs/queue'
import { escrowQueue, dispatchQueue, maintenanceQueue } from './config/queues'
import { purgeExpiredKycDocuments } from './jobs/kycRetentionJob'
import { corsConfig } from './middlewares/securityMiddleware'
import { setSocketIO } from './config/socketHandlers'
import { verifyAccessToken } from './utils/jwt'
import cron         from 'node-cron'

// Import workers
import './jobs/kycJob'
import './jobs/skillEvidencePrecheckJob'
import './jobs/trustJob'
import './jobs/moderationJob'
import './jobs/escrowReleasedJob'
import './jobs/emergencyDispatchJob'
import './jobs/maintenanceJob'

const PORT = Number(process.env.PORT ?? 4000)

let server: ReturnType<typeof app.listen>

async function bootstrap() {
  try {
    await prisma.$connect()
    logger.info('Database connected')

    // Connect to Redis only if available. Route-module imports (e.g.
    // rateMiddleware.ts's RedisStore) run before this and already trigger
    // ioredis's lazyConnect on their first command — calling `.connect()`
    // again once it's past the 'wait' state throws "Redis is already
    // connecting/connected", which isn't a real failure, just a race. Only
    // call it when nothing has connected yet, and always log the true state.
    if (redis) {
      try {
        if (redis.status === 'wait') await redis.connect()
        logger.info('Redis status after bootstrap', { status: redis.status })
      } catch (redisError) {
        logger.warn('Redis connection failed, proceeding without Redis', { error: redisError })
      }
    }

    // Daily trust decay — 2 AM Nepal time (UTC+5:45 → 20:15 UTC previous day)
    cron.schedule('15 20 * * *', async () => {
      logger.info('Scheduling daily trust decay...')
      await trustQueue.add('decay-all', {})
    })

    // Daily KYC document retention purge — 3 AM Nepal time (21:15 UTC prev day).
    // Destroys sensitive ID/selfie images past their retention window
    // (data-minimization — see docs/DATA_RETENTION_AND_SECURITY.md). Runs on
    // node-cron directly so it works with or without Redis.
    cron.schedule('15 21 * * *', async () => {
      try {
        const { purged } = await purgeExpiredKycDocuments()
        logger.info('KYC retention purge complete', { purged })
      } catch (err) {
        logger.error('KYC retention purge failed', { err })
      }
    })

    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, { env: process.env.NODE_ENV })

      // NODE_ENV gates the refresh-token cookie's Secure/SameSite=None flags
      // (see config/cookies.ts) — required because the frontend and this API
      // sit on different domains. Left unset here, refresh cookies get
      // silently dropped by the browser, and every user gets logged out
      // (401s) the moment their short-lived access token expires.
      if (process.env.NODE_ENV !== 'production') {
        logger.warn(
          'NODE_ENV is not "production" — cross-site refresh-token cookies will be ' +
          'rejected by browsers and users will be logged out on every access-token ' +
          'expiry. Set NODE_ENV=production in this host\'s environment variables.'
        )
      }
    })

    // ── Socket.IO — attached to the same HTTP server ────────────
    // `app.listen()` already returns the underlying `http.Server`, so this
    // rides the same port instead of standing up a second listener.
    const io = new SocketIOServer(server, { cors: corsConfig })

    io.use((socket, next) => {
      const token =
        (socket.handshake.auth?.token as string | undefined) ||
        (socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, ''))
      if (!token) return next(new Error('Authentication required'))
      try {
        const payload = verifyAccessToken(token)
        socket.data.userId = payload.id
        next()
      } catch {
        next(new Error('Invalid or expired token'))
      }
    })

    io.on('connection', (socket) => {
      const userId = socket.data.userId as string
      socket.join(`user:${userId}`)
      socket.on('disconnect', () => {
        socket.leave(`user:${userId}`)
      })
    })

    setSocketIO(io)
    logger.info('Socket.IO server attached')

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
        escrowQueue.close(),
        dispatchQueue.close(),
        maintenanceQueue.close(),
      ])

      await prisma.$disconnect()
      
      if (redis) {
        await redis.quit()
      }

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