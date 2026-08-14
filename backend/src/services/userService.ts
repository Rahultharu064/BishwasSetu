/**
 * Small per-user preferences that don't warrant their own domain service.
 * Currently just the preferred checkout gateway (prefills, never forces,
 * the payment method selector in the booking flow).
 */
import { prisma } from "../config/db";
import { hashPassword, comparePassword } from "../utils/hash";
import type {
  UpdatePaymentPreferenceInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from "../validators/userValidator";

export async function getPaymentPreference(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferredPaymentMethod: true },
  });
  return { preferredPaymentMethod: user?.preferredPaymentMethod ?? null };
}

export async function updatePaymentPreference(
  userId: string,
  input: UpdatePaymentPreferenceInput
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { preferredPaymentMethod: input.preferredPaymentMethod },
    select: { preferredPaymentMethod: true },
  });
  return { preferredPaymentMethod: user.preferredPaymentMethod };
}

// ── Self-service: update own display name ────────────────────────

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  return prisma.user.update({
    where: { id: userId },
    data: { name: input.name },
    select: { id: true, name: true, role: true },
  });
}

// ── Self-service: change own password ─────────────────────────────

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    throw { code: "INVALID_CREDENTIALS", message: "Account has no password set", status: 400 };
  }

  const match = await comparePassword(input.currentPassword, user.passwordHash);
  if (!match) {
    throw { code: "INVALID_CREDENTIALS", message: "Current password is incorrect", status: 401 };
  }

  const passwordHash = await hashPassword(input.newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return { message: "Password updated." };
}
