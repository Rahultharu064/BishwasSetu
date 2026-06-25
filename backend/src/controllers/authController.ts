import { Request, Response, NextFunction } from 'express'
import * as AuthService from '../services/authService'
import { sendSuccess, sendError } from '../utils/response'

// ── POST /api/v1/auth/register ────────────────

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await AuthService.registerUser(req.body)
    sendSuccess(res, result, 'Registration successful. Please verify OTP.', 201)
  } catch (err: any) {
    if (err.code) {
      sendError(res, err.message, err.code, err.status)
      return
    }
    next(err)
  }
}

// ── POST /api/v1/auth/verify-otp ─────────────

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, code } = req.body
    const result = await AuthService.verifyUserOtp(userId, code)

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
    })

    sendSuccess(res, {
      accessToken: result.accessToken,
      user:        result.user,
    }, 'OTP verified. Logged in.')
  } catch (err: any) {
    if (err.code) {
      sendError(res, err.message, err.code, err.status)
      return
    }
    next(err)
  }
}

// ── POST /api/v1/auth/login ───────────────────

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await AuthService.loginUser(req.body)
    sendSuccess(res, result, 'OTP sent. Please verify to continue.')
  } catch (err: any) {
    if (err.code) {
      sendError(res, err.message, err.code, err.status)
      return
    }
    next(err)
  }
}

// ── POST /api/v1/auth/refresh ─────────────────

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Accept token from cookie (web) or body (mobile)
    const token =
      req.cookies?.refreshToken || req.body?.refreshToken

    if (!token) {
      sendError(res, 'Refresh token required', 'MISSING_REFRESH_TOKEN', 401)
      return
    }

    const result = await AuthService.refreshAccessToken(token)

    // Rotate cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000,
    })

    sendSuccess(res, { accessToken: result.accessToken }, 'Token refreshed')
  } catch (err: any) {
    if (err.code) {
      sendError(res, err.message, err.code, err.status)
      return
    }
    next(err)
  }
}

// ── POST /api/v1/auth/logout ──────────────────

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token =
      req.cookies?.refreshToken || req.body?.refreshToken

    if (token) {
      await AuthService.logoutUser(token)
    }

    res.clearCookie('refreshToken')
    sendSuccess(res, null, 'Logged out successfully')
  } catch (err) {
    next(err)
  }
}

// ── POST /api/v1/auth/resend-otp ─────────────

export const resendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.body

    if (!userId) {
      sendError(res, 'userId is required', 'MISSING_USER_ID', 400)
      return
    }

    const result = await AuthService.resendOtp(userId)
    sendSuccess(res, result, result.message)
  } catch (err: any) {
    if (err.code) {
      sendError(res, err.message, err.code, err.status)
      return
    }
    next(err)
  }
}