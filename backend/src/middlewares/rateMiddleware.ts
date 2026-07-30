import rateLimit    from 'express-rate-limit'
import RedisStore   from 'rate-limit-redis'
import { redis }    from '../config/redis'

// ── Base factory ──────────────────────────────────────────────

const createLimiter = (
  windowMinutes: number,
  max:           number,
  keyPrefix:     string,
  message:       string
) => {
  const baseOptions: any = {
    windowMs:         windowMinutes * 60 * 1000,
    max,
    standardHeaders:  true,
    legacyHeaders:    false,
    message:          { success: false, error: { code: 'RATE_LIMITED', message, status: 429 } },
    // Rate limiting is a safety net, not core functionality — a Redis blip
    // must never 500 real requests. On a store error, allow the request
    // through instead of throwing (express-rate-limit's default is to throw).
    passOnStoreError: true,
  }

  const memoryLimiter = rateLimit({ ...baseOptions })

  // Build a Redis-backed limiter too, but never route a request through it
  // unless the connection is actually 'ready' at that moment (checked below,
  // per-request). rate-limit-redis has a real bug: on a failed command, its
  // retry path does `this.incrementScriptSha = this.loadIncrementScript(key)`
  // WITHOUT awaiting it — if that rejects (Redis down), it's an unhandled
  // promise rejection that `passOnStoreError` can never catch, because it
  // never reaches express-rate-limit's own try/catch. This app treats any
  // unhandled rejection as fatal (server.ts), so once this fired it took the
  // whole API down — confirmed live. The only safe fix is to never let
  // sendCommand be invoked at all while Redis isn't confirmed ready.
  let redisLimiter: ReturnType<typeof rateLimit> | null = null
  if (redis) {
    try {
      redisLimiter = rateLimit({
        ...baseOptions,
        store: new RedisStore({
          sendCommand: (...args: string[]) => (redis as any).call(...args),
          prefix:      `rl:${keyPrefix}:`,
        }),
      })
    } catch (err) {
      console.warn(`⚠️ Failed to initialize Redis store for ${keyPrefix}, using in-memory store instead:`, err)
    }
  } else {
    console.log(`ℹ️ Using in-memory rate limit store for ${keyPrefix}`)
  }

  return (req: any, res: any, next: any) => {
    const useRedis = redisLimiter && redis && redis.status === 'ready'
    return (useRedis ? redisLimiter : memoryLimiter)!(req, res, next)
  }
}

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