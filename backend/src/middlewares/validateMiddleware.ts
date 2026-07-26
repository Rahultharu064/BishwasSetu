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

/**
 * Validates a schema shaped as `{ params?, body?, query? }` against the whole
 * request in one pass. Used by the anti-disintermediation routes whose Zod
 * schemas bundle params and body together. Unknown top-level keys are ignored
 * by Zod, so a params-only or body-only schema works unchanged.
 */
export const validateRequest =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        params: req.params,
        body: req.body,
        query: req.query,
      }) as { body?: unknown }
      if (parsed && typeof parsed === 'object' && 'body' in parsed && parsed.body !== undefined) {
        req.body = parsed.body
      }
      next()
    } catch (err) {
      handleValidationError(err, res, next)
    }
  }
