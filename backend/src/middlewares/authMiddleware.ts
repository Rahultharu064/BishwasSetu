import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { prisma } from '../config/db'
import { Role } from '@prisma/client'

// ── Protect any route — requires valid access token ──

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided',
        error: { code: 'UNAUTHORIZED', message: 'Authentication required', status: 401 },
      })
      return
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyAccessToken(token)

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id:       true,
        role:     true,
        isActive: true,
        provider: { select: { id: true } },
      },
    })

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User not found or deactivated',
        error: { code: 'UNAUTHORIZED', message: 'Invalid token', status: 401 },
      })
      return
    }

    req.user = {
      id:         user.id,
      role:       user.role,
      providerId: user.provider?.id,
    }

    next()
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: { code: 'TOKEN_EXPIRED', message: 'Please login again', status: 401 },
    })
  }
}

// ── Role guard — restrict to specific roles ──

export const restrictTo =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions', status: 403 },
      })
      return
    }
    next()
  }

// ── Verified provider guard ───────────────────
// Enforces: KYC must be VERIFIED before accepting bookings

export const requireVerifiedProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.providerId) {
      res.status(403).json({
        success: false,
        message: 'Provider profile not found',
        error: { code: 'PROVIDER_NOT_FOUND', message: 'Complete provider onboarding first', status: 403 },
      })
      return
    }

    const provider = await prisma.provider.findUnique({
      where:  { id: req.user.providerId },
      select: { identityStatus: true },
    })

    if (provider?.identityStatus !== 'VERIFIED') {
      res.status(403).json({
        success: false,
        message: 'KYC verification required',
        error: {
          code:    'PROVIDER_NOT_VERIFIED',
          message: 'Complete KYC verification before accepting bookings',
          status:  403,
        },
      })
      return
    }

    next()
  } catch (err) {
    next(err)
  }
}

// ── Aliases for backward compatibility ──
export const authMiddleware = protect
export const authorize = (roles: string[]) => restrictTo(...(roles as Role[]))