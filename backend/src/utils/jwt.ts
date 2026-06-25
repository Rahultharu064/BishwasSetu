import jwt from 'jsonwebtoken'
import { prisma } from '../config/db'

interface TokenPayload {
  id:         string
  role:       string
  providerId?: string
}

// ── Access Token ─────────────────────────────

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES as string, // '15m'
  })
}

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload
}

// ── Refresh Token ─────────────────────────────

export const signRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES as string, // '7d'
  })
}

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload
}

// ── Persist refresh token to DB ───────────────

export const saveRefreshToken = async (
  userId: string,
  token: string
): Promise<void> => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await prisma.refreshToken.create({
    data: { userId, token, expiresAt },
  })
}

// ── Revoke refresh token ──────────────────────

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({ where: { token } })
}

// ── Rotate refresh token ──────────────────────
// Deletes old token, issues new one — prevents replay attacks

export const rotateRefreshToken = async (
  oldToken: string,
  payload: TokenPayload
): Promise<string> => {
  await revokeRefreshToken(oldToken)
  const newToken = signRefreshToken(payload)
  await saveRefreshToken(payload.id, newToken)
  return newToken
}