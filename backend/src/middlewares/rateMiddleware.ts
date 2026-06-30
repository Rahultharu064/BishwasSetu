import rateLimit    from 'express-rate-limit'
import RedisStore   from 'rate-limit-redis'
import { redis }    from '../config/redis'

// ── Base factory ──────────────────────────────────────────────

const createLimiter = (
  windowMinutes: number,
  max:           number,
  keyPrefix:     string,
  message:       string
) =>
  rateLimit({
    windowMs:         windowMinutes * 60 * 1000,
    max,
    standardHeaders:  true,
    legacyHeaders:    false,
    message:          { success: false, error: { code: 'RATE_LIMITED', message, status: 429 } },
    store: new RedisStore({
      sendCommand: (...args: string[]) => (redis as any).call(...args),
      prefix:      `rl:${keyPrefix}:`,
    }),
  })

// ── Route-specific limiters ───────────────────────────────────

// OTP / Auth — tightest limits (brute-force protection)
export const authLimiter = createLimiter(
  15, 10,
  'auth',
  'Too many login attempts. Please wait 15 minutes.'
)

export const otpLimiter = createLimiter(
  5, 5,
  'otp',
  'Too many OTP requests. Please wait 5 minutes.'
)

// API — general authenticated routes
export const apiLimiter = createLimiter(
  1, 100,
  'api',
  'Too many requests. Please slow down.'
)

// Public search — slightly more generous
export const searchLimiter = createLimiter(
  1, 60,
  'search',
  'Too many search requests. Please wait a moment.'
)

// File upload — KYC documents
export const uploadLimiter = createLimiter(
  60, 10,
  'upload',
  'Too many uploads. Please wait before uploading again.'
)

// AI Assistant — Groq API has its own rate limits
export const assistantLimiter = createLimiter(
  1, 20,
  'assistant',
  'Too many assistant requests. Please wait a moment.'
)

// Admin — generous (trusted users)
export const adminLimiter = createLimiter(
  1, 300,
  'admin',
  'Admin rate limit reached.'
)

// Payment initiation — prevent accidental spam
export const paymentLimiter = createLimiter(
  5, 10,
  'payment',
  'Too many payment attempts. Please wait 5 minutes.'
)