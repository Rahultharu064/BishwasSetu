import { prisma } from '../config/db'
import { comparePassword, hashPassword } from '../utils/hash'
import { signAccessToken, signRefreshToken, saveRefreshToken } from '../utils/jwt'
import type {
  AdminLoginInput,
  AdminUpdateProfileInput,
  AdminChangePasswordInput,
} from '../validators/adminAuthValidator'

// Deliberately separate from services/authService.ts's customer/provider
// login: staff accounts are provisioned directly by an existing admin (or a
// seed script), never through public self-registration, so there is no
// unverified-contact risk to mitigate the way there is for a public signup —
// the OTP 2FA step that flow requires doesn't apply here. Keeping this as
// its own module (not a branch inside authService.loginUser) means the
// public auth surface can never be extended to accidentally cover ADMIN /
// MODERATOR without a deliberate, separate change here.
export const loginAdmin = async (input: AdminLoginInput) => {
  const { email, password } = input

  const user = await prisma.user.findFirst({
    where: {
      email,
      role:      { in: ['ADMIN', 'MODERATOR'] },
      isActive:  true,
      deletedAt: null,
    },
    select: {
      id:           true,
      name:         true,
      role:         true,
      passwordHash: true,
    },
  })

  // Same generic error whether the account doesn't exist, isn't staff, or
  // the password is wrong — never reveal which case it was.
  if (!user || !user.passwordHash) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', status: 401 }
  }

  const passwordMatch = await comparePassword(password, user.passwordHash)
  if (!passwordMatch) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', status: 401 }
  }

  const payload = { id: user.id, role: user.role }
  const accessToken  = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)
  await saveRefreshToken(user.id, refreshToken)

  return {
    accessToken,
    refreshToken,
    user: {
      id:   user.id,
      name: user.name,
      role: user.role,
    },
  }
}

// ── Self-service: update own name ─────────────────────────────
// Deliberately just `name` — email/phone double as login credentials, so
// changing them here would need the same re-verification rigor as the
// public account flow. Out of scope for a "settings" convenience form.

export const updateAdminProfile = async (
  userId: string,
  input:  AdminUpdateProfileInput
) => {
  return prisma.user.update({
    where:  { id: userId },
    data:   { name: input.name },
    select: { id: true, name: true, role: true },
  })
}

// ── Self-service: change own password ──────────────────────────

export const changeAdminPassword = async (
  userId: string,
  input:  AdminChangePasswordInput
) => {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { passwordHash: true },
  })

  if (!user?.passwordHash) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Account has no password set', status: 400 }
  }

  const match = await comparePassword(input.currentPassword, user.passwordHash)
  if (!match) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Current password is incorrect', status: 401 }
  }

  const passwordHash = await hashPassword(input.newPassword)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } })

  return { message: 'Password updated' }
}
