import type{ Request, Response, NextFunction } from 'express'

// Some services throw the plain-object `{code, message, status}` shape
// (caught explicitly by most controllers via `err.code ? sendError(...) :
// next(err)`), others throw the `ApiError` class (`.statusCode`), and a few
// controllers (escrow/emergency/guarantee/neighborhood) forward every error
// here unconditionally via `next(err)`. Previously this handler always
// responded 500 regardless of the thrown status, so those controllers'
// intentional 400/403/404/409 errors were all masked as 500. Honor whichever
// status field is present; only truly unexpected errors fall back to 500.
export const errorHandler = (
  err: Error & { statusCode?: number; status?: number; code?: string; isOperational?: boolean },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.statusCode ?? err.status ?? 500

  // Anything reaching 500 without an explicit operational status/code is an
  // unexpected error (raw Prisma/DB/library exceptions included) — never
  // forward its message/stack shape to the client, only to server logs.
  const isSafeToExpose = status < 500 || err.isOperational === true

  if (status >= 500) console.error(err.stack)

  const message = isSafeToExpose ? err.message || 'Internal server error' : 'Internal server error'
  const code = isSafeToExpose ? err.code ?? 'INTERNAL_SERVER_ERROR' : 'INTERNAL_SERVER_ERROR'

  res.status(status).json({
    success: false,
    message,
    error: { code, message, status },
  })
}

 