import { Request, Response, NextFunction } from 'express'
import * as AdminAuthService from '../services/adminAuthService'
import { sendSuccess, sendError } from '../utils/response'

// POST /api/v1/admin-auth/login — direct credential login, no OTP step.
// See adminAuthService.ts for why this is intentionally its own module
// rather than a branch inside the public authController.
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await AdminAuthService.loginAdmin(req.body)

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days — matches the public auth flow's cookie
    })

    sendSuccess(res, {
      accessToken: result.accessToken,
      user:        result.user,
    }, 'Logged in.')
  } catch (err: any) {
    if (err.code) {
      sendError(res, err.message, err.code, err.status)
      return
    }
    next(err)
  }
}

// PATCH /api/v1/admin-auth/me — self-service profile update (name only).
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await AdminAuthService.updateAdminProfile(req.user!.id, req.body)
    sendSuccess(res, result, 'Profile updated.')
  } catch (err: any) {
    if (err.code) {
      sendError(res, err.message, err.code, err.status)
      return
    }
    next(err)
  }
}

// PATCH /api/v1/admin-auth/change-password
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await AdminAuthService.changeAdminPassword(req.user!.id, req.body)
    sendSuccess(res, result, result.message)
  } catch (err: any) {
    if (err.code) {
      sendError(res, err.message, err.code, err.status)
      return
    }
    next(err)
  }
}
