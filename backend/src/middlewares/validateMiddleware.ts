import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

type RequestSource = 'body' | 'query' | 'params'

const handleValidationError = (err: unknown, res: Response, next: NextFunction): void => {
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: {
        code:    'VALIDATION_ERROR',
        message: 'Invalid request data',
        status:  422,
        fields:  (err as any).errors.map((e: any) => ({
          field:   e.path.join('.'),
          message: e.message,
        })),
      },
    })
    return
  }
  next(err)
}

export const validate =
  (schema: ZodSchema, source: RequestSource = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source])
      if (source === 'body') req.body = parsed
      next()
    } catch (err) {
      handleValidationError(err, res, next)
    }
  }

// Alias used throughout routes (source param kept for compatibility)
export const validationMiddleware =
  (schema: ZodSchema, source: RequestSource = 'body') =>
  (req: Request, res: Response, next: NextFunction): void =>
    validate(schema, source)(req, res, next)
