import winston                    from 'winston'
import DailyRotateFile            from 'winston-daily-rotate-file'
import path                       from 'path'

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────

const IS_PROD = process.env.NODE_ENV === 'production'
const LOG_DIR = path.resolve(process.cwd(), 'logs')

// ─────────────────────────────────────────────────────────────
// Custom formats
// ─────────────────────────────────────────────────────────────

// Development: colourised, human-readable single-line output
const devFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const extras = Object.keys(meta).length
      ? ' ' + JSON.stringify(meta, null, 0)
      : ''
    return `${timestamp} [${level}] ${message}${extras}`
  })
)

// Production: structured JSON (for log aggregators like Datadog, Logtail, etc.)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// ─────────────────────────────────────────────────────────────
// Transports
// ─────────────────────────────────────────────────────────────

const transports: winston.transport[] = [
  // Always write to console
  new winston.transports.Console({
    format: IS_PROD ? prodFormat : devFormat,
  }),
]

if (IS_PROD) {
  // Rotate log files daily — keeps 30 days of history, max 20 MB per file
  transports.push(
    new DailyRotateFile({
      dirname:        LOG_DIR,
      filename:       'app-%DATE%.log',
      datePattern:    'YYYY-MM-DD',
      zippedArchive:  true,
      maxSize:        '20m',
      maxFiles:       '30d',
      level:          'info',
      format:         prodFormat,
    })
  )

  // Separate file for errors only
  transports.push(
    new DailyRotateFile({
      dirname:       LOG_DIR,
      filename:      'error-%DATE%.log',
      datePattern:   'YYYY-MM-DD',
      zippedArchive: true,
      maxSize:       '20m',
      maxFiles:      '30d',
      level:         'error',
      format:        prodFormat,
    })
  )
}

// ─────────────────────────────────────────────────────────────
// Logger instance
// ─────────────────────────────────────────────────────────────

export const logger = winston.createLogger({
  level:       IS_PROD ? 'info' : 'debug',
  defaultMeta: { service: 'bishwassetu-api' },
  transports,
  // Do NOT exit on unhandled errors — let server.ts handle process lifecycle
  exitOnError: false,
})

// Convenience re-export so callers can do:
//   import { logger } from '../utils/logger'
//   logger.info(...)   logger.warn(...)   logger.error(...)   logger.debug(...)
export default logger
