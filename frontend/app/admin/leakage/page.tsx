"use client";

import { useState } from "react";
import { PhoneOff, ShieldAlert, MessageSquareWarning, Ban } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useToast } from "@/context/toast-context";
import { relativeTime } from "@/lib/format";
import type { LeakageFlag, LeakageFlagsResponse } from "@/lib/admin-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";

const STATUS_FILTERS = [
  { value: "OPEN", label: "Open" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "DISMISSED", label: "Dismissed" },
  { value: "ACTIONED", label: "Actioned" },
] as const;

const SIGNAL_META: Record<string, { label: string; icon: typeof PhoneOff }> = {
  PHONE_IN_CHAT: { label: "Phone number shared in chat", icon: PhoneOff },
  CANCEL_AFTER_CONTACT: { label: "Repeated cancel-after-accept", icon: Ban },
  COMPLAINT_PATTERN: { label: "Off-platform complaint pattern", icon: MessageSquareWarning },
};

function flagsFrom(data: unknown): LeakageFlagsResponse {
  const empty: LeakageFlagsResponse = {
    flags: [],
    pagination: { total: 0, page: 1, limit: 30, totalPages: 0 },
  };
  if (data && typeof data === "object" && "flags" in data)
    return data as LeakageFlagsResponse;
  return empty;
}

function detailLine(flag: LeakageFlag): string | null {
  const d = flag.details;
  if (!d) return null;
  if (flag.signal === "PHONE_IN_CHAT" && typeof d.snippet === "string")
    return `"${d.snippet}"`;
  if (flag.signal === "CANCEL_AFTER_CONTACT" && typeof d.cancelledCount === "number")
    return `${d.cancelledCount} cancellations in the last ${d.windowDays ?? 30} days`;
  if (flag.signal === "COMPLAINT_PATTERN" && typeof d.complaintId === "string")
    return `Complaint ${d.complaintId.slice(0, 8)}`;
  return null;
}

export default function AdminLeakagePage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]["value"]>("OPEN");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);

  const req = useFetch(
    () => api.adminLeakageFlags({ status, page, limit: 30 }),
    [status, page]
  );
  const { flags, pagination } = flagsFrom(req.data);

  async function resolve(flag: LeakageFlag, next: "REVIEWED" | "DISMISSED" | "ACTIONED") {
    setBusyId(flag.id);
    try {
      await api.adminResolveLeakageFlag(flag.id, next);
      toast(`Flag marked ${next.toLowerCase()}.`, "success");
      req.reload();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't update the flag.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Off-platform leakage</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Signals that a booking may be moving off-platform to dodge commission — a
        shared phone number in chat, repeated cancel-after-accept, or a complaint
        mentioning cash/off-platform deals.
      </p>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setPage(1);
              setStatus(f.value);
            }}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium ${
              status === f.value
                ? "border-primary bg-primary-soft text-primary"
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {req.loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : req.error ? (
          <ErrorState message={req.error} onRetry={req.reload} />
        ) : flags.length === 0 ? (
          <EmptyState
            title="Nothing here"
            description="No leakage signals in this filter."
            icon={<ShieldAlert className="h-8 w-8" />}
          />
        ) : (
          <ul className="space-y-3">
            {flags.map((flag) => {
              const meta = SIGNAL_META[flag.signal] ?? {
                label: flag.signal,
                icon: ShieldAlert,
              };
              const Icon = meta.icon;
              const detail = detailLine(flag);
              return (
                <li key={flag.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-urgent-soft text-urgent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{meta.label}</p>
                        <Badge variant="neutral" size="sm">
                          {flag.status.toLowerCase()}
                        </Badge>
                      </div>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        provider:{flag.providerId.slice(0, 8)}
                        {flag.customerId ? ` · customer:${flag.customerId.slice(0, 8)}` : ""}
                        {flag.bookingId ? ` · booking:${flag.bookingId.slice(0, 8)}` : ""}
                      </p>
                      {detail && (
                        <p className="mt-1.5 text-sm text-foreground">{detail}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {relativeTime(flag.createdAt)}
                      </p>
                    </div>
                    {flag.status === "OPEN" && (
                      <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === flag.id}
                          onClick={() => resolve(flag, "DISMISSED")}
                        >
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === flag.id}
                          onClick={() => resolve(flag, "REVIEWED")}
                        >
                          Mark reviewed
                        </Button>
                        <Button
                          size="sm"
                          disabled={busyId === flag.id}
                          onClick={() => resolve(flag, "ACTIONED")}
                        >
                          {busyId === flag.id ? "…" : "Mark actioned"}
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

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
