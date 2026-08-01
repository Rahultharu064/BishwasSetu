import { Role } from '@prisma/client'

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: any
}

declare global {
  namespace Express {
    interface User {
      id:          string
      role:        Role
      name?:       string
      providerId?: string
      provider?:   { id: string; identityStatus: string } | null
      isActive?:   boolean
      deletedAt?:  Date | null
    }

    interface Request {
      user?: User
    }
  }
}