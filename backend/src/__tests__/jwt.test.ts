import { describe, it, expect } from 'vitest'
import jwt from 'jsonwebtoken'
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'

const payload = { id: 'user-123', role: 'CUSTOMER' as const }

describe('access tokens', () => {
  it('round-trips a signed payload', () => {
    const token = signAccessToken(payload)
    const decoded = verifyAccessToken(token)
    expect(decoded.id).toBe(payload.id)
    expect(decoded.role).toBe(payload.role)
  })

  it('rejects a token signed with the wrong secret', () => {
    const forged = jwt.sign(payload, 'not-the-real-secret', { expiresIn: '15m' })
    expect(() => verifyAccessToken(forged)).toThrow()
  })

  it('rejects a tampered token', () => {
    const token = signAccessToken(payload)
    const tampered = token.slice(0, -2) + (token.slice(-2) === 'aa' ? 'bb' : 'aa')
    expect(() => verifyAccessToken(tampered)).toThrow()
  })

  it('rejects an expired token', () => {
    const expired = jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, { expiresIn: -10 })
    expect(() => verifyAccessToken(expired)).toThrow(/expired/i)
  })
})

describe('refresh tokens use a different secret than access tokens', () => {
  it('an access token cannot be verified as a refresh token', () => {
    const accessToken = signAccessToken(payload)
    expect(() => verifyRefreshToken(accessToken)).toThrow()
  })

  it('a refresh token round-trips correctly', () => {
    const token = signRefreshToken(payload)
    const decoded = verifyRefreshToken(token)
    expect(decoded.id).toBe(payload.id)
  })
})
