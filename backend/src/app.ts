import express        from 'express'
import cors           from 'cors'
import helmet         from 'helmet'
import cookieParser   from 'cookie-parser'
import compression    from 'compression'
import dotenv         from 'dotenv'
import passport       from './config/passport'

dotenv.config()

// ── Security & utility middleware ─────────────────────────────
import {
  corsConfig,
  helmetConfig,
  preventHpp,
  sanitizeInput,
  attachRequestId,
  blockSuspiciousAgents,
  requestSizeLimits,
} from './middlewares/securityMiddleware'
import {
  apiLimiter,
  authLimiter,
  otpLimiter,
  searchLimiter,
  uploadLimiter,
  assistantLimiter,
  adminLimiter,
  paymentLimiter,
} from './middlewares/rateMiddleware'
import { errorHandler } from './middlewares/errorMiddleware'

// ── Route modules ─────────────────────────────────────────────
import authRoutes      from './routes/authRoute'
import adminAuthRoutes from './routes/adminAuthRoute'
import providerRoutes  from './routes/providerRoute'
import kycRoutes       from './routes/kycRoute'
import bookingRoutes   from './routes/bookingRoute'
import reviewRoutes    from './routes/reviewRoute'
import creditRoutes    from './routes/creditRoute'
import serviceRoutes   from './routes/serviceRoute'
import adminRoutes     from './routes/adminRoute'
import paymentRoutes   from './routes/paymentRoute'
import complaintRoutes from './routes/complaintRoute'
import matchRoutes     from './routes/matchRoute'
import badgeRoutes     from './routes/badgeRoute'
import antiDisintermediationRoutes from './routes/antiDisintermediationRoute'
import messageRoutes   from './routes/messageRoute'
import addressRoutes   from './routes/addressRoute'
import assistantRoutes from './routes/assistantRoute'
import userRoutes       from './routes/userRoute'


// ─────────────────────────────────────────────────────────────
// APP INIT
// ─────────────────────────────────────────────────────────────

const app = express()

// Trust proxy — required when running behind Railway / nginx
app.set('trust proxy', 1)

// ── Core security middleware ──────────────────────────────────
app.use(attachRequestId)
app.use(blockSuspiciousAgents)
app.use(helmet(helmetConfig))
app.use(cors(corsConfig))
app.use(cookieParser())
app.use(compression())
app.use(passport.initialize())
app.use(express.json(requestSizeLimits.json))
app.use(express.urlencoded(requestSizeLimits.urlencoded))
app.use(sanitizeInput)
app.use(preventHpp)

// ── Health check (no rate limit) ─────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    uptime:    Math.round(process.uptime()),
    env:       process.env.NODE_ENV,
  })
})

// ─────────────────────────────────────────────────────────────
// API ROUTES  (with per-route rate limits)
// ─────────────────────────────────────────────────────────────

const v1 = '/api/v1'

// Tight limits on auth endpoints
app.use(`${v1}/auth/register`,   otpLimiter)
app.use(`${v1}/auth/login`,      authLimiter)
app.use(`${v1}/auth/verify-otp`, otpLimiter)
app.use(`${v1}/auth/resend-otp`, otpLimiter)
app.use(`${v1}/auth`,            authRoutes)

// Staff login — deliberately a separate mount from both `/auth` (public,
// OTP-gated) and `/admin` (already-authenticated resource API below) so
// there's no path-prefix ambiguity with adminRoutes' router-wide
// protect+restrictTo gate.
app.use(`${v1}/admin-auth/login`, authLimiter)
app.use(`${v1}/admin-auth`,       adminAuthRoutes)

// Resource-specific limits
app.use(`${v1}/providers/search`, searchLimiter)
app.use(`${v1}/services/search`,  searchLimiter)
app.use(`${v1}/match`,            searchLimiter)
app.use(`${v1}/kyc/upload`,       uploadLimiter)
app.use(`${v1}/assistant/chat`,   assistantLimiter)
app.use(`${v1}/payments`,         paymentLimiter, paymentRoutes)
app.use(`${v1}/admin`,            adminLimiter,   adminRoutes)

// Global fallback rate limit for all remaining routes
app.use(apiLimiter)

// Anti-disintermediation (escrow / guarantees / emergency / neighborhood).
// Mounted before providerRoutes so its public `/providers/:id/*` reads win
// over that router's PROVIDER-only catch-all guard.
app.use(v1, antiDisintermediationRoutes)

// Remaining routes
app.use(`${v1}/providers`,  providerRoutes)
app.use(`${v1}/kyc`,        kycRoutes)
app.use(`${v1}/bookings`,   bookingRoutes)
app.use(`${v1}/reviews`,    reviewRoutes)
app.use(`${v1}/complaints`, complaintRoutes)
app.use(`${v1}/messages`,   messageRoutes)
app.use(`${v1}/addresses`,  addressRoutes)
app.use(`${v1}/users`,      userRoutes)

app.use(`${v1}/credits`,    creditRoutes)
app.use(`${v1}/services`,   serviceRoutes)
app.use(`${v1}/match`,      matchRoutes)
app.use(`${v1}/badges`,     badgeRoutes)
app.use(`${v1}/assistant`,  assistantRoutes)

// ─────────────────────────────────────────────────────────────
// ERROR HANDLING  (must be last)
// ─────────────────────────────────────────────────────────────

app.use(errorHandler)

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found', status: 404 },
  })
})

export default app