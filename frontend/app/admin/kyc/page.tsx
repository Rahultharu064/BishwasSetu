"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  Clock,
  ChevronLeft,
  Check,
  X,
  Ban,
  Info,
  ScanFace,
  FileWarning,
  ShieldCheck,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useToast } from "@/context/toast-context";
import { relativeTime } from "@/lib/format";
import type {
  KycQueueResponse,
  KycQueueItem,
  AdminKycDocument,
} from "@/lib/admin-types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";
import { Textarea, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { cn } from "@/lib/utils";

export default function KycQueuePage() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch<KycQueueResponse>(
    () => api.adminKycQueue({ page, limit: 20 }) as Promise<KycQueueResponse>,
    [page]
  );
  const [selected, setSelected] = useState<KycQueueItem | null>(null);

  const queue = data?.queue ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Verification queue</h1>
          <p className="text-sm text-muted-foreground">
            AI flags problems — you make the final call.
          </p>
        </div>
        {data && (
          <Badge variant={queue.length ? "warning" : "soft"} size="lg">
            {data.total} pending
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : queue.length === 0 ? (
        <EmptyState
          title="Queue is clear"
          description="No providers are waiting for verification right now. New submissions appear here oldest-first."
          icon={<ClipboardCheck className="h-8 w-8" />}
        />
      ) : (
        <ul className="space-y-3">
          {queue.map((item) => (
            <QueueRow
              key={item.id}
              item={item}
              onOpen={() => setSelected(item)}
            />
          ))}
        </ul>
      )}

      {!loading && !error && pagination && pagination.totalPages > 1 && (
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

      <ReviewPanel
        item={selected}
        onClose={() => setSelected(null)}
        onResolved={() => {
          setSelected(null);
          reload();
        }}
      />
    </div>
  );
}

// Must track backend/src/kyc/kycFaceMatch.ts::FACE_MATCH_THRESHOLD — the AI
// itself approves a face match at this similarity, so the dashboard's
// pass/fail read must agree with it rather than judging against an
// arbitrary stricter number.
const FACE_MATCH_THRESHOLD = 0.75;

const FORGERY_RISK_POINTS: Record<"low" | "medium" | "high", number> = {
  low: 5,
  medium: 35,
  high: 70,
};

function riskFromDecision(item: KycQueueItem): {
  score: number;
  tone: "warning" | "soft" | "urgentSoft";
} {
  const d = item.kycDecisions?.[0];
  // Simple composite: low face match or high forgery risk = higher risk score.
  const face = d?.faceScore ?? null;
  const forgery = d?.forgeryRisk ?? null;
  let risk = 20;
  if (face != null) risk += Math.max(0, (0.95 - face) * 100);
  if (forgery != null) risk += FORGERY_RISK_POINTS[forgery] ?? 0;
  risk = Math.min(99, Math.round(risk));
  return {
    score: risk,
    tone: risk >= 60 ? "urgentSoft" : risk >= 35 ? "warning" : "soft",
  };
}

function QueueRow({
  item,
  onOpen,
}: {
  item: KycQueueItem;
  onOpen: () => void;
}) {
  const risk = riskFromDecision(item);
  const waited = relativeTime(item.updatedAt);
  return (
    <li>
      <button
        onClick={onOpen}
        className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
      >
        <Avatar name={item.legalName || item.user?.name || "Provider"} size={48} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {item.legalName || item.user?.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {item.serviceArea ?? "—"} · Tier{" "}
            {item.kycTier.replace(/TIER_(\d)_.*/, "$1")}
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> waiting {waited}
          </p>
        </div>
        <div className="text-right">
          <Badge variant={risk.tone} size="sm">
            AI risk {risk.score}
          </Badge>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.documents?.length ?? 0} docs
          </p>
        </div>
      </button>
    </li>
  );
}

type ActionMode = null | "reject" | "request-info" | "blacklist";

function ReviewPanel({
  item,
  onClose,
  onResolved,
}: {
  item: KycQueueItem | null;
  onClose: () => void;
  onResolved: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<ActionMode>(null);
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const docsReq = useFetch<AdminKycDocument[]>(
    () =>
      item
        ? (api.adminKycDocuments(item.id) as Promise<AdminKycDocument[]>)
        : Promise.resolve([]),
    [item?.id]
  );

  if (!item) return null;
  const d = item.kycDecisions?.[0];
  const risk = riskFromDecision(item);

  async function run(fn: () => Promise<unknown>, msg: string) {
    setBusy(true);
    try {
      await fn();
      toast(msg, "success");
      setMode(null);
      setReason("");
      setConfirmText("");
      onResolved();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Action failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={!!item} onClose={onClose} className="sm:max-w-2xl">
      <button
        onClick={onClose}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:hidden"
      >
        <ChevronLeft className="h-4 w-4" /> Queue
      </button>

      {/* Applicant header */}
      <div className="flex items-center gap-3">
        <Avatar name={item.legalName || item.user?.name || "Provider"} size={52} />
        <div className="flex-1">
          <p className="text-lg font-bold">{item.legalName || item.user?.name}</p>
          <p className="text-sm text-muted-foreground">
            {item.user?.phone ?? item.user?.email ?? "—"} · {item.serviceArea ?? "—"}
          </p>
        </div>
        <Badge variant={risk.tone} size="lg">
          Risk {risk.score}
        </Badge>
      </div>

      {/* Documents */}
      <h3 className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Documents
      </h3>
      {docsReq.loading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : docsReq.data && docsReq.data.length ? (
        <div className="grid grid-cols-3 gap-2">
          {docsReq.data.map((doc) => (
            <a
              key={doc.id}
              href={doc.signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-lg border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.signedUrl}
                alt={doc.type}
                className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-foreground/60 px-1.5 py-0.5 text-[10px] font-medium text-background">
                {doc.type}
              </span>
            </a>
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">
          Documents unavailable (signed URLs require the live storage backend).
        </p>
      )}

      {/* AI analysis (ux.md §12.2 center column) */}
      <h3 className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Automated checks
      </h3>
      <ul className="space-y-2">
        <CheckRow
          icon={<ScanFace className="h-4 w-4" />}
          label="Face match"
          value={d?.faceScore != null ? `${Math.round(d.faceScore * 100)}%` : "—"}
          pass={d?.faceScore != null ? d.faceScore >= FACE_MATCH_THRESHOLD : null}
          threshold={`threshold ${Math.round(FACE_MATCH_THRESHOLD * 100)}%`}
          reasoning={d?.faceReasoning}
        />
        <CheckRow
          icon={<FileWarning className="h-4 w-4" />}
          label="Forgery risk"
          value={d?.forgeryRisk ? d.forgeryRisk[0].toUpperCase() + d.forgeryRisk.slice(1) : "—"}
          pass={d?.forgeryRisk != null ? d.forgeryRisk === "low" : null}
          threshold="low is better"
          reasoning={d?.forgeryReasoning}
        />
        <CheckRow
          icon={<ShieldCheck className="h-4 w-4" />}
          label="AI confidence"
          value={d?.confidence != null ? `${Math.round(d.confidence * 100)}%` : "—"}
          pass={d?.confidence != null ? d.confidence >= 0.7 : null}
          threshold={d?.decision ?? "no decision"}
        />
      </ul>

      {/* Why the AI flagged this — specific issues, not just scores */}
      {d?.flags && d.flags.length > 0 && (
        <div className="mt-3 rounded-lg border border-warning/30 bg-warning-soft p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-warning">
            AI notes
          </p>
          <ul className="mt-1.5 space-y-1">
            {d.flags.map((flag, i) => (
              <li key={i} className="text-sm text-foreground">
                • {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reason input for reject / request-info */}
      {(mode === "reject" || mode === "request-info") && (
        <div className="mt-5">
          <Label htmlFor="reason">
            {mode === "reject" ? "Rejection reason (shown to provider)" : "What's missing?"}
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              mode === "reject"
                ? "e.g. ID photo is blurry — please re-upload a clear image."
                : "e.g. Please add the back side of your citizenship."
            }
          />
        </div>
      )}

      {/* Blacklist double-confirm (ux.md §12.2) */}
      {mode === "blacklist" && (
        <div className="mt-5 rounded-xl border border-urgent/40 bg-urgent-soft p-4">
          <p className="text-sm font-medium text-urgent">
            This permanently blocks the phone + ID. Type BLACKLIST to confirm.
          </p>
          <Textarea
            className="mt-2 bg-card"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="BLACKLIST"
          />
        </div>
      )}

      {/* Action bar (ux.md §12.2 — Accept / Request Info / Reject / Blacklist) */}
      <div className="sticky bottom-0 mt-6 grid grid-cols-2 gap-2 bg-card pt-2 sm:grid-cols-4">
        {mode === null ? (
          <>
            <Button
              onClick={() =>
                run(() => api.adminApproveKyc(item.id), "Approved — provider notified.")
              }
              disabled={busy}
            >
              <Check className="h-4 w-4" /> Accept
            </Button>
            <Button variant="outline" onClick={() => setMode("request-info")} disabled={busy}>
              <Info className="h-4 w-4" /> Request Info
            </Button>
            <Button variant="outline" onClick={() => setMode("reject")} disabled={busy}>
              <X className="h-4 w-4" /> Reject
            </Button>
            <Button variant="destructive" onClick={() => setMode("blacklist")} disabled={busy}>
              <Ban className="h-4 w-4" /> Blacklist
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setMode(null)} disabled={busy}>
              Cancel
            </Button>
            <div className="col-span-1 sm:col-span-3">
              <Button
                full
                variant={mode === "blacklist" ? "destructive" : "primary"}
                disabled={
                  busy ||
                  (mode !== "blacklist" && reason.trim().length < 3) ||
                  (mode === "blacklist" && confirmText !== "BLACKLIST")
                }
                onClick={() => {
                  if (mode === "reject")
                    run(
                      () => api.adminRejectKyc(item.id, reason.trim()),
                      "Rejected — provider notified."
                    );
                  else if (mode === "request-info")
                    run(
                      () => api.adminRequestInfoKyc(item.id, reason.trim()),
                      "Info requested — provider notified."
                    );
                  else
                    run(
                      () => api.adminBlacklistKyc(item.id),
                      "Provider blacklisted."
                    );
                }}
              >
                {busy
                  ? "Working…"
                  : mode === "reject"
                    ? "Confirm rejection"
                    : mode === "request-info"
                      ? "Send request"
                      : "Confirm blacklist"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}

function CheckRow({
  icon,
  label,
  value,
  pass,
  threshold,
  reasoning,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  pass: boolean | null;
  threshold: string;
  reasoning?: string | null;
}) {
  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            pass == null
              ? "bg-secondary text-muted-foreground"
              : pass
                ? "bg-primary-soft text-primary"
                : "bg-urgent-soft text-urgent"
          )}
        >
          {icon}
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{threshold}</p>
        </div>
        <span
          className={cn(
            "tabular text-sm font-bold",
            pass == null ? "text-muted-foreground" : pass ? "text-primary" : "text-urgent"
          )}
        >
          {value}
        </span>
      </div>
      {reasoning && (
        <p className="mt-2 pl-11 text-xs text-muted-foreground">{reasoning}</p>
      )}
    </li>
  );
}
