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
export const corsConfig = {
  origin: (
    origin:   string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL!,
      'http://localhost:3000',
      'http://localhost:5173',
    ]

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`))
    }
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