/**
 * Small per-user preferences that don't warrant their own domain service.
 * Currently just the preferred checkout gateway (prefills, never forces,
 * the payment method selector in the booking flow).
 */
import { prisma } from "../config/db";
import type { UpdatePaymentPreferenceInput } from "../validators/userValidator";

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
