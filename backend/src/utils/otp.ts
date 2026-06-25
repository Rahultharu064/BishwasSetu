import crypto from 'crypto'
import { prisma } from '../config/db'

// Generate a secure 6-digit OTP
export const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString()
}

// Save OTP to DB (invalidates any previous unused OTPs for this user)
export const saveOtp = async (userId: string, code: string): Promise<void> => {
  const expiresAt = new Date(
    Date.now() + Number(process.env.OTP_EXPIRES_MINUTES!) * 60 * 1000
  )

  // Invalidate previous OTPs for this user
  await prisma.otp.updateMany({
    where: { userId, used: false },
    data:  { used: true },
  })

  await prisma.otp.create({
    data: { userId, code, expiresAt },
  })
}

// Verify OTP — returns true and marks used, or throws
export const verifyOtp = async (
  userId: string,
  code: string
): Promise<boolean> => {
  const otp = await prisma.otp.findFirst({
    where: {
      userId,
      code,
      used:      false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!otp) return false

  await prisma.otp.update({
    where: { id: otp.id },
    data:  { used: true },
  })

  return true
}