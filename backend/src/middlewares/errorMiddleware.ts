import type{ Request, Response, NextFunction } from 'express'

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: {
      code:    'INTERNAL_SERVER_ERROR',
      message: err.message,
      status:  500,
    },
  })
}