import { prisma } from '../config/db'
import { hashPassword, comparePassword } from '../utils/hash'
import { generateOtp, saveOtp, verifyOtp } from '../utils/otp'
import {
  signAccessToken,
  signRefreshToken,
  saveRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt'
import { sendSms } from '../utils/sms'
import { sendOtpEmail } from '../utils/email'
import type { RegisterInput, LoginInput } from '../validators/authValidator'

// ── REGISTER ─────────────────────────────────

export const registerUser = async (input: RegisterInput) => {
  const { name, email, phone, password, role, city, district, latitude, longitude } = input

  // Check duplicate
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        email ? { email } : {},
        phone ? { phone } : {},
      ],
    },
  })

  if (existing) {
    throw { code: 'USER_EXISTS', message: 'Email or phone already registered', status: 409 }
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash, role, city, district, latitude, longitude },
    select: { id: true, name: true, role: true },
  })

  // If registering as provider — create blank provider profile.
  // Seed the provider's operating location from the signup fields so they can
  // be matched immediately (refinable later during onboarding).
  if (role === 'PROVIDER') {
    const provider = await prisma.provider.create({
      data: {
        userId:      user.id,
        legalName:   name,
        city,
        serviceArea: district,
        latitude,
        longitude,
      },
    })

    // Create empty credit wallet
    await prisma.creditWallet.create({
      data: { providerId: provider.id },
    })
  }

  // Generate and send OTP
  const otp = generateOtp()
  await saveOtp(user.id, otp)

  if (phone) {
    await sendSms(phone, `Your BishwasSetu OTP is: ${otp}. Valid for ${process.env.OTP_EXPIRES_MINUTES} minutes.`)
  } else if (email) {
    await sendOtpEmail(email, otp, process.env.OTP_EXPIRES_MINUTES ?? '5', 'register')
  }

  return {
    userId:  user.id,
    message: `OTP sent to ${phone || email}`,
  }
}

// ── VERIFY OTP ────────────────────────────────

export const verifyUserOtp = async (userId: string, code: string) => {
  const valid = await verifyOtp(userId, code)

  if (!valid) {
    throw { code: 'INVALID_OTP', message: 'Invalid or expired OTP', status: 400 }
  }

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: {
      id:                     true,
      name:                   true,
      role:                   true,
      preferredPaymentMethod: true,
      provider:               { select: { id: true, identityStatus: true } },
    },
  })

  if (!user) {
    throw { code: 'USER_NOT_FOUND', message: 'User not found', status: 404 }
  }

  const payload = {
    id:         user.id,
    role:       user.role,
    providerId: user.provider?.id,
  }

  const accessToken  = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)
  await saveRefreshToken(user.id, refreshToken)

  return {
    accessToken,
    refreshToken,
    user: {
      id:                     user.id,
      name:                   user.name,
      role:                   user.role,
      preferredPaymentMethod: user.preferredPaymentMethod,
      providerId:             user.provider?.id,
      kycStatus:              user.provider?.identityStatus,
    },
  }
}

// ── LOGIN ─────────────────────────────────────

export const loginUser = async (input: LoginInput) => {
  const { email, phone, password } = input

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        email ? { email } : {},
        phone ? { phone } : {},
      ],
      isActive:  true,
      deletedAt: null,
    },
    select: {
      id:           true,
      name:         true,
      role:         true,
      passwordHash: true,
      provider:     { select: { id: true, identityStatus: true } },
    },
  })

  if (!user || !user.passwordHash) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email/phone or password', status: 401 }
  }

  const passwordMatch = await comparePassword(password, user.passwordHash)

  if (!passwordMatch) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email/phone or password', status: 401 }
  }

  // Issue OTP for 2FA — do not issue tokens yet
  const otp = generateOtp()
  await saveOtp(user.id, otp)

  const contact = email || phone!
  if (phone) {
    await sendSms(phone, `Your BishwasSetu login OTP is: ${otp}. Valid for ${process.env.OTP_EXPIRES_MINUTES} minutes.`)
  } else if (email) {
    await sendOtpEmail(email, otp, process.env.OTP_EXPIRES_MINUTES ?? '5', 'login')
  }

  return {
    userId:  user.id,
    message: `OTP sent to ${contact}`,
  }
}



// ── REFRESH TOKEN ─────────────────────────────

export const refreshAccessToken = async (oldToken: string) => {
  // Verify the token is valid
  let payload: { id: string; role: string; providerId?: string }
  try {
    payload = verifyRefreshToken(oldToken) as typeof payload
  } catch {
    throw { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token', status: 401 }
  }

  // Check token exists in DB (not revoked)
  const stored = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
  })

  if (!stored || stored.expiresAt < new Date()) {
    throw { code: 'REFRESH_TOKEN_EXPIRED', message: 'Session expired. Please login again', status: 401 }
  }

  // Fetch user object to return
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      name: true,
      role: true,
      preferredPaymentMethod: true,
      provider: { select: { id: true, identityStatus: true } },
    }
  })

  if (!user) {
    throw { code: 'USER_NOT_FOUND', message: 'User not found', status: 404 }
  }

  // Rotate — revoke old, issue new
  const newRefreshToken = await rotateRefreshToken(oldToken, {
    id:         payload.id,
    role:       payload.role,
    providerId: payload.providerId,
  })

  const newAccessToken = signAccessToken({
    id:         payload.id,
    role:       payload.role,
    providerId: payload.providerId,
  })

  return { 
    accessToken: newAccessToken, 
    refreshToken: newRefreshToken,
    user: {
      id:                     user.id,
      name:                   user.name,
      role:                   user.role,
      preferredPaymentMethod: user.preferredPaymentMethod,
      providerId:             user.provider?.id,
      kycStatus:              user.provider?.identityStatus,
    }
  }
}

// ── LOGOUT ────────────────────────────────────

export const logoutUser = async (refreshToken: string) => {
  await revokeRefreshToken(refreshToken)
  return { message: 'Logged out successfully' }
}

// ── RESEND OTP ────────────────────────────────

export const resendOtp = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { id: true, email: true, phone: true },
  })

  if (!user) {
    throw { code: 'USER_NOT_FOUND', message: 'User not found', status: 404 }
  }

  const otp = generateOtp()
  await saveOtp(user.id, otp)

  if (user.phone) {
    await sendSms(user.phone, `Your BishwasSetu OTP is: ${otp}. Valid for ${process.env.OTP_EXPIRES_MINUTES} minutes.`)
  } else if (user.email) {
    await sendOtpEmail(user.email, otp, process.env.OTP_EXPIRES_MINUTES ?? '5', 'resend')
  }

  return { message: `OTP resent to ${user.phone || user.email}` }
}