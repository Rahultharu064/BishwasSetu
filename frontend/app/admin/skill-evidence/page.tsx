"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  FileText,
  Image as ImageIcon,
  UserRound,
  AlertTriangle,
  ExternalLink,
  Crown,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useToast } from "@/context/toast-context";
import { relativeTime } from "@/lib/format";
import type {
  SkillEvidenceItem,
  SkillEvidenceResponse,
} from "@/lib/admin-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";
import { Textarea, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";

const STATUS_FILTERS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const TYPE_META: Record<
  string,
  { label: string; icon: typeof FileText }
> = {
  certificate: { label: "Certificate", icon: FileText },
  work_photo: { label: "Work photo", icon: ImageIcon },
  reference: { label: "Reference", icon: UserRound },
};

const TIER_LABEL: Record<string, string> = {
  NONE: "—",
  TIER_1: "Tier 1 · visual",
  TIER_2: "Tier 2 · issuer-verified",
};

function evidenceFrom(data: unknown): SkillEvidenceResponse {
  const empty: SkillEvidenceResponse = {
    evidence: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
  };
  if (data && typeof data === "object" && "evidence" in data)
    return data as SkillEvidenceResponse;
  return empty;
}

/** Any AI pre-check flag worth surfacing to the reviewer. */
function aiRisks(item: SkillEvidenceItem): string[] {
  const p = item.aiPrecheck;
  if (!p) return [];
  const out: string[] = [];
  if (p.duplicateFlag) out.push("Possible duplicate");
  if (p.stockPhotoFlag) out.push("Looks like a stock photo");
  if (p.aiGeneratedFlag) out.push("Possibly AI-generated");
  return out;
}

export default function AdminSkillEvidencePage() {
  const { toast } = useToast();
  const [status, setStatus] = useState("PENDING");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<SkillEvidenceItem | null>(null);
  const [reason, setReason] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkRejecting, setBulkRejecting] = useState(false);
  const [bulkReason, setBulkReason] = useState("");

  const req = useFetch(
    () => api.adminSkillEvidence({ status, limit: 30 }),
    [status]
  );
  const { evidence } = useMemo(() => evidenceFrom(req.data), [req.data]);
  const pending = evidence.filter((e) => e.reviewStatus === "PENDING");

  function toggleChecked(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllPending() {
    setChecked((prev) =>
      pending.every((e) => prev.has(e.id)) ? new Set() : new Set(pending.map((e) => e.id))
    );
  }

  async function approve(item: SkillEvidenceItem) {
    setBusyId(item.id);
    try {
      await api.adminApproveSkillEvidence(item.id);
      toast("Skill evidence approved.", "success");
      req.reload();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Couldn't approve.",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  }

  async function reject() {
    if (!rejecting || reason.trim().length < 10) return;
    setBusyId(rejecting.id);
    try {
      await api.adminRejectSkillEvidence(rejecting.id, reason.trim());
      toast("Skill evidence rejected.", "success");
      setRejecting(null);
      setReason("");
      req.reload();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't reject.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function runBulk(fn: (id: string) => Promise<unknown>, successVerb: string) {
    setBulkBusy(true);
    const ids = Array.from(checked);
    const results = await Promise.allSettled(ids.map(fn));
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed === 0) {
      toast(`${successVerb} ${ids.length} submission${ids.length === 1 ? "" : "s"}.`, "success");
    } else {
      toast(
        `${successVerb} ${ids.length - failed} of ${ids.length} — ${failed} failed.`,
        failed === ids.length ? "error" : "info"
      );
    }
    setChecked(new Set());
    setBulkRejecting(false);
    setBulkReason("");
    setBulkBusy(false);
    req.reload();
  }

  const bulkReject = () =>
    runBulk((id) => api.adminRejectSkillEvidence(id, bulkReason.trim()), "Rejected");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Skill evidence</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Always human-reviewed — there is no auto-approve path. Paid badge
        purchases are prioritised.
      </p>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
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

      {pending.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input"
              checked={pending.length > 0 && pending.every((e) => checked.has(e.id))}
              onChange={toggleAllPending}
            />
            Select all pending
          </label>
          {checked.size > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {checked.size} selected
              </span>
              <Button
                size="sm"
                disabled={bulkBusy}
                onClick={() =>
                  runBulk((id) => api.adminApproveSkillEvidence(id), "Approved")
                }
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={bulkBusy}
                onClick={() => setBulkRejecting(true)}
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="mt-5">
        {req.loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : req.error ? (
          <ErrorState message={req.error} onRetry={req.reload} />
        ) : evidence.length === 0 ? (
          <EmptyState
            title="Queue is clear"
            description="No skill evidence in this filter."
            icon={<BadgeCheck className="h-8 w-8" />}
          />
        ) : (
          <ul className="space-y-3">
            {evidence.map((item) => {
              const meta = TYPE_META[item.type] ?? {
                label: item.type,
                icon: FileText,
              };
              const Icon = meta.icon;
              const risks = aiRisks(item);
              const pending = item.reviewStatus === "PENDING";
              return (
                <li
                  key={item.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    {pending && (
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 shrink-0 rounded border-input"
                        checked={checked.has(item.id)}
                        onChange={() => toggleChecked(item.id)}
                        aria-label={`Select ${item.provider.legalName}`}
                      />
                    )}
                    <EvidenceThumbnail url={item.fileUrl} icon={Icon} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{meta.label}</p>
                        {item.isPaidBadge && (
                          <Badge variant="skilled" size="sm">
                            <Crown className="h-3 w-3" /> Paid badge
                          </Badge>
                        )}
                        {item.reviewStatus === "APPROVED" && (
                          <Badge variant="soft" size="sm">
                            {TIER_LABEL[item.authenticityTier] ?? "Approved"}
                          </Badge>
                        )}
                        {item.reviewStatus === "REJECTED" && (
                          <Badge variant="urgentSoft" size="sm">
                            Rejected
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.provider.legalName}
                        {item.provider.user?.name &&
                        item.provider.user.name !== item.provider.legalName
                          ? ` (${item.provider.user.name})`
                          : ""}{" "}
                        · {relativeTime(item.createdAt)}
                      </p>
                      {(item.issuerName || item.certNumber) && (
                        <p className="mt-1 text-sm text-foreground">
                          {item.issuerName}
                          {item.certNumber ? ` · #${item.certNumber}` : ""}
                        </p>
                      )}

                      {risks.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {risks.map((r) => (
                            <Badge key={r} variant="warning" size="sm">
                              <AlertTriangle className="h-3 w-3" /> {r}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {item.rejectReason && (
                        <p className="mt-2 rounded-lg bg-urgent-soft p-2.5 text-sm text-urgent">
                          {item.rejectReason}
                        </p>
                      )}

                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        View evidence
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  {pending && (
                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === item.id}
                        onClick={() => {
                          setRejecting(item);
                          setReason("");
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        disabled={busyId === item.id}
                        onClick={() => approve(item)}
                      >
                        {busyId === item.id ? "…" : "Approve"}
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Sheet
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        title="Reject skill evidence"
      >
        {rejecting && (
          <>
            <p className="text-sm text-muted-foreground">
              The provider is told why. Be specific so they can resubmit
              correctly.
            </p>
            <div className="mt-4">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. The certificate image is too blurry to read the issuer and number."
              />
            </div>
            <Button
              full
              className="mt-5"
              disabled={busyId === rejecting.id || reason.trim().length < 10}
              onClick={reject}
            >
              {busyId === rejecting.id ? "Saving…" : "Confirm rejection"}
            </Button>
          </>
        )}
      </Sheet>

      <Sheet
        open={bulkRejecting}
        onClose={() => setBulkRejecting(false)}
        title={`Reject ${checked.size} submission${checked.size === 1 ? "" : "s"}?`}
      >
        <p className="text-sm text-muted-foreground">
          The same reason is sent to every selected provider — only use this
          for a shared, genuine issue, not as a shortcut for individually
          distinct rejections.
        </p>
        <div className="mt-4">
          <Label htmlFor="bulk-reason">Reason (shown to each provider)</Label>
          <Textarea
            id="bulk-reason"
            value={bulkReason}
            onChange={(e) => setBulkReason(e.target.value)}
            placeholder="e.g. Image quality too low to verify across all selected submissions."
          />
        </div>
        <Button
          full
          className="mt-5"
          disabled={bulkBusy || bulkReason.trim().length < 10}
          onClick={bulkReject}
        >
          {bulkBusy ? "Working…" : `Confirm rejection of ${checked.size}`}
        </Button>
      </Sheet>
    </div>
  );
}

// Inline thumbnail so a reviewer can eyeball the submission without leaving
// the queue — matches the KYC queue's inline document previews instead of
// making this the one review flow that's just an off-site link.
function EvidenceThumbnail({
  url,
  icon: Icon,
}: {
  url: string;
  icon: typeof FileText;
}) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        <Icon className="h-5 w-5" />
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border"
      aria-label="Open evidence full size"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Submitted evidence"
        className="h-full w-full object-cover transition-transform group-hover:scale-105"
        onError={() => setBroken(true)}
      />
    </a>
  );
}
