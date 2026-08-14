import { prisma } from "../config/db";
import { ApiError } from "../utils/apierror";
import { logAdminAction } from "./auditLogService";

export async function listGuaranteesForCustomer(customerId: string) {
  return prisma.serviceGuarantee.findMany({
    where: { customerId },
    include: {
      escrow: { select: { bookingId: true, amountPaisa: true } },
      claims: true,
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function fileGuaranteeClaim(customerId: string, guaranteeId: string, data: { description: string; photoUrls?: string[] }) {
  const guarantee = await prisma.serviceGuarantee.findUnique({ where: { id: guaranteeId } });
  if (!guarantee) throw new ApiError(404, "Guarantee not found");
  if (guarantee.customerId !== customerId) throw new ApiError(403, "Not authorized");
  if (guarantee.status !== "ACTIVE") throw new ApiError(400, `Guarantee is ${guarantee.status}`);
  if (new Date() > guarantee.expiresAt) throw new ApiError(400, "Guarantee has expired");

  return prisma.$transaction(async (tx) => {
    const claim = await tx.guaranteeClaim.create({
      data: {
        guaranteeId,
        customerId,
        description: data.description,
        photoUrls: data.photoUrls ?? [],
      }
    });

    await tx.serviceGuarantee.update({
      where: { id: guaranteeId },
      data: { status: "CLAIMED" }
    });

    // Also flag the provider for a trust penalty
    await tx.trustScoreEvent.create({
      data: {
        providerId: guarantee.providerId,
        score: -5.0,
        prevScore: 0, // In reality, fetch actual score
        trigger: "complaint",
        inputs: { type: "GUARANTEE_CLAIM", claimId: claim.id },
      }
    });

    return claim;
  });
}

export async function resolveGuaranteeClaim(claimId: string, resolution: string) {
  const claim = await prisma.guaranteeClaim.findUnique({
    where: { id: claimId },
    include: { guarantee: true }
  });
  if (!claim) throw new ApiError(404, "Claim not found");

  return prisma.$transaction(async (tx) => {
    const resolved = await tx.guaranteeClaim.update({
      where: { id: claimId },
      data: {
        resolution,
        resolvedAt: new Date()
      }
    });

    await tx.serviceGuarantee.update({
      where: { id: claim.guaranteeId },
      data: { status: "RESOLVED" }
    });

    return resolved;
  });
}

export async function getProviderRevenuePoints(providerId: string) {
  const ledgers = await prisma.revenuePointLedger.findMany({
    where: { providerId },
    select: { points: true }
  });
  return ledgers.reduce((acc, curr) => acc + curr.points, 0);
}

export async function listLeakageFlags(params: {
  status?: "OPEN" | "REVIEWED" | "DISMISSED" | "ACTIONED";
  page: number;
  limit: number;
}) {
  const { status = "OPEN", page, limit } = params;
  const skip = (page - 1) * limit;

  const [flags, total] = await Promise.all([
    prisma.leakageFlag.findMany({
      where: { status },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.leakageFlag.count({ where: { status } }),
  ]);

  return {
    flags,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function resolveLeakageFlag(
  flagId: string,
  adminId: string,
  status: "REVIEWED" | "DISMISSED" | "ACTIONED"
) {
  const flag = await prisma.leakageFlag.findUnique({ where: { id: flagId } });
  if (!flag) throw new ApiError(404, "Leakage flag not found");

  const updated = await prisma.leakageFlag.update({
    where: { id: flagId },
    data: { status, reviewedAt: new Date() },
  });

  await logAdminAction({
    adminId,
    action: "LEAKAGE_FLAG_RESOLVED",
    targetType: "fraudFlag",
    targetId: flagId,
    details: { signal: flag.signal, status },
  });

  return updated;
}
