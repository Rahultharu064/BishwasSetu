import { Role } from '@prisma/client'

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: any
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id:         string
        role:       Role
        providerId?: string
      }
    }
  }
}