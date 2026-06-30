import express, { Router }    from 'express'
import cors                    from 'cors'
import cookieParser            from 'cookie-parser'
import type { Request, Response, NextFunction } from 'express'
import dotenv                  from 'dotenv'

dotenv.config()

// ── Auth & error middleware ────────────────────────────────────
import { protect }      from './middlewares/authMiddleware'
import { errorHandler } from './middlewares/errorMiddleware'

// ── Trust score service (inline trust router) ─────────────────
import { getTrustScore, getTrustTrend } from './services/trustService'

// ── Shared response helpers ────────────────────────────────────
import { sendSuccess, sendError } from './utils/response'

// ── Route modules ──────────────────────────────────────────────
import authRoutes     from './routes/authRoute'
import providerRoutes from './routes/providerRoute'
import kycRoutes      from './routes/kycRoute'
import bookingRoutes  from './routes/bookingRoute'
import reviewRoutes   from './routes/reviewRoute'
import adminRoutes    from './routes/adminRoute'
import serviceRoutes from './routes/serviceRoute'
import creditRoutes from './routes/creditRoute'


// ─────────────────────────────────────────────────────────────
// APP INIT
// ─────────────────────────────────────────────────────────────

const app = express()

// Trust proxy — required when running behind Railway / nginx
// so rate limiters see the real client IP, not the proxy IP
app.set('trust proxy', 1)

// ─────────────────────────────────────────────────────────────
// GLOBAL MIDDLEWARE
// ─────────────────────────────────────────────────────────────

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (
      origin.startsWith('http://localhost:') ||
      origin === process.env.FRONTEND_URL
    ) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK  (no auth, no rate limit)
// ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    uptime:    Math.round(process.uptime()),
    env:       process.env.NODE_ENV,
  })
})

// ─────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────

const v1 = '/api/v1'

app.use(`${v1}/auth`,      authRoutes)
app.use(`${v1}/providers`, providerRoutes)
app.use(`${v1}/kyc`,       kycRoutes)
app.use(`${v1}/bookings`,  bookingRoutes)
app.use(`${v1}/reviews`,   reviewRoutes)
app.use(`${v1}/admin`,     adminRoutes)
app.use(`${v1}/services`, serviceRoutes)

// ── Trust score — inline router (no separate route file needed) ──
const trustRouter = Router()

// Public — anyone can view a provider's trust score
trustRouter.get('/:providerId/score', async (req, res, next) => {
  try {
    const data = await getTrustScore(req.params.providerId)
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
})

// Protected — must be logged in to view trend history
trustRouter.get('/:providerId/trend', protect, async (req, res, next) => {
  try {
    const data = await getTrustTrend(req.params.providerId)
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
})

app.use(`${v1}/trust`, trustRouter)

// ─────────────────────────────────────────────────────────────
// ERROR HANDLING  (must be last)
// ─────────────────────────────────────────────────────────────

// Global error handler — catches anything passed to next(err)
app.use(errorHandler)

// 404 fallback — any route not matched above
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code:    'NOT_FOUND',
      message: 'Route not found',
      status:  404,
    },
  })
})

export default app