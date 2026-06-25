import type { Response } from 'express'
import type { ApiResponse } from '../types/express.d.ts'

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  status = 200
) => {
  const response: ApiResponse<T> = { success: true, message, data }
  return res.status(status).json(response)
}

export const sendError = (
  res: Response,
  message: string,
  code: string,
  status = 400
) => {
  const response: ApiResponse = {
    success: false,
    message,
    error: { code, message, status },
  }
  return res.status(status).json(response)
}