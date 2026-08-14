import { Request, Response, NextFunction } from 'express'
import * as AuthService from '../services/authService'
import { sendSuccess, sendError } from '../utils/response'
import { refreshCookieOptions, clearRefreshCookieOptions } from '../config/cookies'

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
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions)

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

// ── GET /api/v1/auth/google/callback ──────────

export const googleCallback = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

  try {
    const user = req.user as any

    if (!user) {
      res.redirect(`${frontendUrl}/login?error=google_failed`)
      return
    }

    // Decode the next-URL from the base64-encoded state param
    let redirectTo = '/'
    try {
      const rawState = typeof req.query.state === 'string' ? req.query.state : ''
      if (rawState) {
        redirectTo = Buffer.from(rawState, 'base64').toString('utf8') || '/'
      }
    } catch {
      redirectTo = '/'
    }

    // Generate tokens
    const tokenPayload = {
      id:         user.id as string,
      role:       user.role as string,
      providerId: user.provider?.id as string | undefined,
    }

    const { signAccessToken, signRefreshToken, saveRefreshToken } = await import('../utils/jwt')

    const accessToken  = signAccessToken(tokenPayload)
    const refreshToken = signRefreshToken(tokenPayload)
    await saveRefreshToken(user.id, refreshToken)

    // Set refresh token in HttpOnly cookie — see config/cookies.ts for why the
    // cross-site flags matter on this redirect back to the frontend origin.
    res.cookie('refreshToken', refreshToken, refreshCookieOptions)

    // Redirect browser to the frontend callback page
    res.redirect(`${frontendUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`)
  } catch {
    res.redirect(`${frontendUrl}/login?error=google_failed`)
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
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions)

    sendSuccess(res, { accessToken: result.accessToken, user: result.user }, 'Token refreshed')
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

    res.clearCookie('refreshToken', clearRefreshCookieOptions)
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

// ── POST /api/v1/auth/forgot-password ────────

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await AuthService.requestPasswordReset(req.body)
    sendSuccess(res, result, result.message)
  } catch (err: any) {
    if (err.code) {
      sendError(res, err.message, err.code, err.status)
      return
    }
    next(err)
  }
}

// ── POST /api/v1/auth/reset-password ─────────

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await AuthService.resetPassword(req.body)
    sendSuccess(res, result, result.message)
  } catch (err: any) {
    if (err.code) {
      sendError(res, err.message, err.code, err.status)
      return
    }
    next(err)
  }
}