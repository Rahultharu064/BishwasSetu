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
