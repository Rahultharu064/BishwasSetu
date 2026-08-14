"use client";

import { useMemo, useState } from "react";
import { History } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { relativeTime } from "@/lib/format";
import type { AuditLogEntry, AuditLogResponse } from "@/lib/admin-types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";

const ACTION_TONE: Record<
  string,
  "soft" | "warning" | "urgentSoft" | "neutral"
> = {
  KYC_APPROVED: "soft",
  SKILL_EVIDENCE_APPROVED: "soft",
  USER_REACTIVATED: "soft",
  COMPLAINT_RESOLVED: "soft",
  KYC_INFO_REQUESTED: "warning",
  COMPLAINT_DISMISSED: "warning",
  FRAUD_FLAG_RESOLVED: "warning",
  KYC_REJECTED: "urgentSoft",
  SKILL_EVIDENCE_REJECTED: "urgentSoft",
  USER_DEACTIVATED: "urgentSoft",
  PROVIDER_BLACKLISTED: "urgentSoft",
};

const ACTION_LABEL: Record<string, string> = {
  KYC_APPROVED: "Approved KYC",
  KYC_REJECTED: "Rejected KYC",
  KYC_INFO_REQUESTED: "Requested KYC info",
  PROVIDER_BLACKLISTED: "Blacklisted provider",
  SKILL_EVIDENCE_APPROVED: "Approved skill evidence",
  SKILL_EVIDENCE_REJECTED: "Rejected skill evidence",
  COMPLAINT_RESOLVED: "Resolved complaint",
  COMPLAINT_DISMISSED: "Dismissed complaint",
  FRAUD_FLAG_RESOLVED: "Resolved fraud flag",
  USER_DEACTIVATED: "Deactivated user",
  USER_REACTIVATED: "Reactivated user",
};

const TARGET_LABEL: Record<string, string> = {
  complaint: "Complaint",
  provider: "Provider",
  user: "User",
  fraudFlag: "Fraud flag",
  skillEvidence: "Skill evidence",
};

function logFrom(data: unknown): AuditLogResponse {
  const empty: AuditLogResponse = {
    logs: [],
    pagination: { total: 0, page: 1, limit: 30, totalPages: 0 },
  };
  if (data && typeof data === "object" && "logs" in data)
    return data as AuditLogResponse;
  return empty;
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1);

  const req = useFetch(
    () => api.adminAuditLog({ page, limit: 30 }),
    [page]
  );
  const { logs, pagination } = useMemo(() => logFrom(req.data), [req.data]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Audit log</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every KYC, skill-evidence, complaint, fraud, and user-status decision
        made from this console, newest first.
      </p>

      <div className="mt-5">
        {req.loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : req.error ? (
          <ErrorState message={req.error} onRetry={req.reload} />
        ) : logs.length === 0 ? (
          <EmptyState
            title="No actions logged yet"
            description="Approvals, rejections, and other admin decisions will show up here as they happen."
            icon={<History className="h-8 w-8" />}
          />
        ) : (
          <ul className="space-y-3">
            {logs.map((entry) => (
              <LogRow key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {!req.loading && !req.error && pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function LogRow({ entry }: { entry: AuditLogEntry }) {
  const [open, setOpen] = useState(false);
  const hasDetails = entry.details && Object.keys(entry.details).length > 0;

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Avatar name={entry.admin?.name ?? "Admin"} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={ACTION_TONE[entry.action] ?? "neutral"} size="sm">
              {ACTION_LABEL[entry.action] ?? entry.action}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {TARGET_LABEL[entry.targetType] ?? entry.targetType} ·{" "}
              <span className="font-mono">{entry.targetId.slice(0, 8)}</span>
            </span>
          </div>
          <p className="mt-1.5 text-sm text-foreground">
            <span className="font-semibold">{entry.admin?.name ?? "Unknown admin"}</span>
            {entry.admin?.role && (
              <span className="ml-1 text-xs capitalize text-muted-foreground">
                ({entry.admin.role.toLowerCase()})
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {relativeTime(entry.createdAt)}
          </p>
          {hasDetails && (
            <button
              onClick={() => setOpen((o) => !o)}
              className="mt-2 text-xs font-medium text-primary hover:underline"
            >
              {open ? "Hide details" : "Show details"}
            </button>
          )}
          {open && hasDetails && (
            <pre className="mt-2 overflow-x-auto rounded-lg bg-secondary p-2.5 text-xs text-foreground">
              {JSON.stringify(entry.details, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </li>
  );
}
