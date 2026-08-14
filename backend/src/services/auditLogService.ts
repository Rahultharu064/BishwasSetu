/**
 * Every admin/moderator decision that changes state gets one row here —
 * independent of the domain record itself, so an accountability review
 * doesn't depend on that record still carrying its own "resolvedBy" field.
 * Best-effort: a logging failure should never block the admin action it's
 * describing, so callers fire-and-forget this rather than awaiting inline.
 */
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";

export type AuditTargetType =
  | "complaint"
  | "provider"
  | "user"
  | "fraudFlag"
  | "skillEvidence";

export async function logAdminAction(params: {
  adminId: string;
  action: string;
  targetType: AuditTargetType;
  targetId: string;
  details?: Record<string, unknown>;
}) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        details: params.details ? (params.details as Prisma.InputJsonValue) : Prisma.DbNull,
      },
    });
  } catch (err) {
    console.error("Failed to write admin audit log:", err);
  }
}

export async function getAuditLog(params: { page: number; limit: number }) {
  const { page, limit } = params;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { name: true, role: true } } },
    }),
    prisma.adminAuditLog.count(),
  ]);

  return {
    logs,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}
