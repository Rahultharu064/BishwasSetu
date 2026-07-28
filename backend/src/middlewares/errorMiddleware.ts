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
  err: Error & { statusCode?: number; status?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.statusCode ?? err.status ?? 500
  if (status >= 500) console.error(err.stack)
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    error: {
      code:    err.code ?? 'INTERNAL_SERVER_ERROR',
      message: err.message,
      status,
    },
  })
}

 