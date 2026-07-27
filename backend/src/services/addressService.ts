/**
 * Saved service addresses. Each user keeps a small book of addresses;
 * exactly one may be the default (used to prefill the booking flow).
 */
import { prisma } from "../config/db";
import { ApiError } from "../utils/apierror";
import type {
  CreateAddressInput,
  UpdateAddressInput,
} from "../validators/addressValidator";

export async function listAddresses(userId: string) {
  return prisma.savedAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function createAddress(userId: string, input: CreateAddressInput) {
  const existingCount = await prisma.savedAddress.count({ where: { userId } });
  // First address is default automatically; honour an explicit flag otherwise.
  const makeDefault = existingCount === 0 || input.isDefault === true;

  return prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.savedAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return tx.savedAddress.create({
      data: {
        userId,
        label: input.label,
        addressLine: input.addressLine,
        city: input.city ?? null,
        landmark: input.landmark ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        isDefault: makeDefault,
      },
    });
  });
}

/** Guard that the address exists and belongs to the user. */
async function assertOwned(userId: string, id: string) {
  const address = await prisma.savedAddress.findUnique({ where: { id } });
  if (!address || address.userId !== userId)
    throw new ApiError(404, "Address not found");
  return address;
}

export async function updateAddress(
  userId: string,
  id: string,
  input: UpdateAddressInput
) {
  await assertOwned(userId, id);

  return prisma.$transaction(async (tx) => {
    if (input.isDefault === true) {
      await tx.savedAddress.updateMany({
        where: { userId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }
    return tx.savedAddress.update({
      where: { id },
      data: {
        ...(input.label !== undefined && { label: input.label }),
        ...(input.addressLine !== undefined && {
          addressLine: input.addressLine,
        }),
        ...(input.city !== undefined && { city: input.city }),
        ...(input.landmark !== undefined && { landmark: input.landmark }),
        ...(input.latitude !== undefined && { latitude: input.latitude }),
        ...(input.longitude !== undefined && { longitude: input.longitude }),
        ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
      },
    });
  });
}

export async function setDefaultAddress(userId: string, id: string) {
  await assertOwned(userId, id);
  return prisma.$transaction(async (tx) => {
    await tx.savedAddress.updateMany({
      where: { userId, isDefault: true, NOT: { id } },
      data: { isDefault: false },
    });
    return tx.savedAddress.update({
      where: { id },
      data: { isDefault: true },
    });
  });
}

export async function deleteAddress(userId: string, id: string) {
  const address = await assertOwned(userId, id);
  await prisma.savedAddress.delete({ where: { id } });

  // If we removed the default, promote the most recent remaining address.
  if (address.isDefault) {
    const next = await prisma.savedAddress.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (next) {
      await prisma.savedAddress.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }
  return { id };
}
