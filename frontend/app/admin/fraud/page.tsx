"use client";

import { useMemo, useState } from "react";
import {
  ShieldAlert,
  Flag,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useToast } from "@/context/toast-context";
import { relativeTime } from "@/lib/format";
import type {
  FraudFlag,
  FraudFlagsResponse,
  TrustAnomaly,
} from "@/lib/admin-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";

type Tab = "flags" | "anomalies";

const ENTITY_LABEL: Record<string, string> = {
  review: "Review",
  complaint: "Complaint",
  profile: "Profile",
};

function flagsFrom(data: unknown): FraudFlagsResponse {
  const empty: FraudFlagsResponse = {
    flags: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
  };
  if (data && typeof data === "object" && "flags" in data)
    return data as FraudFlagsResponse;
  return empty;
}

function anomaliesFrom(data: unknown): TrustAnomaly[] {
  if (Array.isArray(data)) return data as TrustAnomaly[];
  return [];
}

/** Render the aiFlags payload (array/object/string) as short labels. */
function anomalyLabels(raw: unknown): string[] {
  if (!raw) return [];
  let value: unknown = raw;
  if (typeof value === "string") {
    const str = value;
    try {
      value = JSON.parse(str);
    } catch {
      return [str];
    }
  }
  if (Array.isArray(value))
    return value.map((v) =>
      typeof v === "string" ? v : (v as { type?: string })?.type ?? "flag"
    );
  if (value && typeof value === "object")
    return Object.keys(value as Record<string, unknown>);
  return [];
}

export default function AdminFraudPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("flags");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const flagsReq = useFetch(
    () => api.adminFraudFlags({ page, limit: 30 }),
    [page],
  );
  const anomaliesReq = useFetch(() => api.adminTrustAnomalies(), []);

  const { flags, pagination } = useMemo(
    () => flagsFrom(flagsReq.data),
    [flagsReq.data]
  );
  const anomalies = useMemo(
    () => anomaliesFrom(anomaliesReq.data),
    [anomaliesReq.data]
  );

  async function resolveFlag(flag: FraudFlag) {
    setBusyId(flag.id);
    try {
      await api.adminResolveFraudFlag(flag.id);
      toast("Flag marked as reviewed.", "success");
      flagsReq.reload();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Couldn't resolve the flag.",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Trust &amp; fraud</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        AI-flagged content and providers whose trust score moved abnormally.
      </p>

      <div className="mt-4 inline-flex rounded-full border border-border p-1">
        <TabButton active={tab === "flags"} onClick={() => setTab("flags")}>
          <Flag className="h-4 w-4" /> Fraud flags
          {pagination.total > 0 && (
            <span className="ml-1 rounded-full bg-urgent-soft px-1.5 text-[11px] font-semibold text-urgent">
              {pagination.total}
            </span>
          )}
        </TabButton>
        <TabButton
          active={tab === "anomalies"}
          onClick={() => setTab("anomalies")}
        >
          <TrendingDown className="h-4 w-4" /> Anomalies
        </TabButton>
      </div>

      <div className="mt-5">
        {tab === "flags" ? (
          flagsReq.loading ? (
            <SkeletonList />
          ) : flagsReq.error ? (
            <ErrorState message={flagsReq.error} onRetry={flagsReq.reload} />
          ) : flags.length === 0 ? (
            <EmptyState
              title="Nothing flagged"
              description="AI moderation hasn't raised anything for review."
              icon={<ShieldAlert className="h-8 w-8" />}
            />
          ) : (
            <ul className="space-y-3">
              {flags.map((f) => (
                <li
                  key={f.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-urgent-soft text-urgent">
                      <Flag className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">
                          {ENTITY_LABEL[f.entityType] ?? f.entityType}
                        </p>
                        {f.category && (
                          <Badge variant="warning" size="sm">
                            {f.category}
                          </Badge>
                        )}
                        <Badge variant="neutral" size="sm">
                          {Math.round(f.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {f.entityType}:{f.entityId}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {relativeTime(f.createdAt)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === f.id}
                      onClick={() => resolveFlag(f)}
                    >
                      {busyId === f.id ? "…" : "Mark reviewed"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : null}
        {tab === "flags" &&
          !flagsReq.loading &&
          !flagsReq.error &&
          pagination.totalPages > 1 && (
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
        {tab === "anomalies" && (anomaliesReq.loading ? (
          <SkeletonList />
        ) : anomaliesReq.error ? (
          <ErrorState
            message={anomaliesReq.error}
            onRetry={anomaliesReq.reload}
          />
        ) : anomalies.length === 0 ? (
          <EmptyState
            title="No anomalies"
            description="No abnormal trust-score movements in the last 7 days."
            icon={<CheckCircle2 className="h-8 w-8" />}
          />
        ) : (
          <ul className="space-y-3">
            {anomalies.map((a) => {
              const delta = a.score - a.prevScore;
              const labels = anomalyLabels(a.aiFlags);
              return (
                <li
                  key={a.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{a.provider.legalName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Triggered by {a.trigger} · {relativeTime(a.createdAt)}
                      </p>
                      {labels.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {labels.map((l) => (
                            <Badge key={l} variant="warning" size="sm">
                              {l}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="tabular text-lg font-bold">
                        {Math.round(a.score)}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          delta < 0 ? "text-urgent" : "text-primary"
                        }`}
                      >
                        {delta >= 0 ? "+" : ""}
                        {Math.round(delta)} from {Math.round(a.prevScore)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-primary-soft text-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}
