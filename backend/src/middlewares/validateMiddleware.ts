import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(422).json({
          success: false,
          message: 'Validation failed',
          error: {
            code:    'VALIDATION_ERROR',
            message: 'Invalid request data',
            status:  422,
            fields:  err.errors.map((e) => ({
              field:   e.path.join('.'),
              message: e.message,
            })),
          },
        })
        return
      }
      next(err)
    }
  }