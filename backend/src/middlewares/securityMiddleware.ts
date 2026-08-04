import { Request, Response, NextFunction } from 'express'
import hpp from 'hpp'

// ── HTTP Parameter Pollution prevention ───────────────────────
export const preventHpp = hpp({
  whitelist: ['sort', 'fields', 'page', 'limit', 'status', 'category'],
})

// ── Request size limits (prevent large payload attacks) ───────
export const requestSizeLimits = {
  json:       { limit: '10mb' },
  urlencoded: { extended: true, limit: '10mb' },
}

// ── Sanitize request body / query (prevent injection) ─────────
export const sanitizeInput = (
  req:  Request,
  _res: Response,
  next: NextFunction
): void => {
  // Remove any keys starting with $ (MongoDB-style injection — also good practice)
  const sanitize = (obj: Record<string, unknown>): void => {
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key]
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key] as Record<string, unknown>)
      }
    }
  }

  if (req.body)  sanitize(req.body)
  if (req.query) sanitize(req.query as Record<string, unknown>)

  next()
}

// ── Security headers (via helmet) ─────────────────────────────
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      imgSrc:      ["'self'", 'data:', 'https://res.cloudinary.com'],
      connectSrc:  ["'self'"],
      fontSrc:     ["'self'"],
      objectSrc:   ["'none'"],
      frameSrc:    ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,   // needed for Cloudinary images
}

// ── CORS config ───────────────────────────────────────────────

// FRONTEND_URL accepts a comma-separated list so the Vercel production domain,
// any custom domain, and specific preview URLs can all be allowed from one env
// var. Trailing slashes are tolerated because an Origin header never has one —
// `https://app.vercel.app/` in the env would otherwise never match.
const normalizeOrigin = (value: string) => value.trim().replace(/\/+$/, '')

const allowedOrigins = [
  ...(process.env.FRONTEND_URL ?? '').split(',').map(normalizeOrigin),
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean)

export const corsConfig = {
  origin: (
    origin:   string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // No Origin header — same-origin, curl, health checks. Not a browser CORS
    // request, so there is nothing to approve.
    if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
      callback(null, true)
      return
    }

    // Deny by omitting the CORS headers rather than throwing: an Error here is
    // surfaced by errorHandler as a 500, which hides the real cause and makes a
    // misconfigured FRONTEND_URL look like a server crash.
    console.warn(`CORS: origin ${origin} not in FRONTEND_URL allowlist`)
    callback(null, false)
  },
  credentials:      true,
  methods:          ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders:   ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders:   ['X-Total-Count', 'X-Page-Count'],
  maxAge:           86400,   // preflight cache: 24 hours
}

// ── Request ID middleware ──────────────────────────────────────
import { v4 as uuidv4 } from 'uuid'

export const attachRequestId = (
  req:  Request,
  res:  Response,
  next: NextFunction
): void => {
  const requestId = uuidv4()
  req.headers['x-request-id'] = requestId
  res.setHeader('X-Request-ID', requestId)
  next()
}

// ── Suspicious user-agent blocker ─────────────────────────────
const blockedAgents = [
  'sqlmap', 'nikto', 'nmap', 'masscan', 'dirbuster',
  'python-requests/2.', 'Go-http-client/1',
]

export const blockSuspiciousAgents = (
  req:  Request,
  res:  Response,
  next: NextFunction
): void => {
  const ua = (req.headers['user-agent'] ?? '').toLowerCase()

  if (blockedAgents.some((bad) => ua.includes(bad))) {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Access denied', status: 403 },
    })
    return
  }

  next()
}