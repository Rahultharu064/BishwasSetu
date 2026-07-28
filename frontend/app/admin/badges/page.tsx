"use client";

import { useMemo, useState } from "react";
import {
  ShieldCheck,
  ExternalLink,
  Crown,
  Clock,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useToast } from "@/context/toast-context";
import { relativeTime, npr } from "@/lib/format";
import type { PendingBadge, Pagination } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Textarea, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { TrustBadge } from "@/components/badges";

interface PendingResponse {
  badges: PendingBadge[];
  pagination: Pagination;
}

function pendingFrom(data: unknown): PendingResponse {
  const empty: PendingResponse = {
    badges: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
  };
  if (data && typeof data === "object" && "badges" in data)
    return data as PendingResponse;
  return empty;
}

export default function AdminBadgesPage() {
  const { toast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<PendingBadge | null>(null);
  const [reason, setReason] = useState("");

  const req = useFetch(() => api.adminPendingBadges({ limit: 30 }), []);
  const { badges } = useMemo(() => pendingFrom(req.data), [req.data]);

  async function verify(b: PendingBadge) {
    setBusyId(b.id);
    try {
      await api.adminVerifyBadge(b.id);
      toast("Badge verified and activated.", "success");
      req.reload();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't verify.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function reject() {
    if (!rejecting || reason.trim().length < 3) return;
    setBusyId(rejecting.id);
    try {
      await api.adminRejectBadge(rejecting.id, reason.trim());
      toast("Badge rejected.", "success");
      setRejecting(null);
      setReason("");
      req.reload();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't reject.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Trust badges</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Verify paid badge purchases (PRD §4.3). Approve to activate on the
        provider&apos;s profile; reject with a reason if evidence is missing.
      </p>

      <div className="mt-5">
        {req.loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : req.error ? (
          <ErrorState message={req.error} onRetry={req.reload} />
        ) : badges.length === 0 ? (
          <EmptyState
            title="Queue is clear"
            description="No badge purchases awaiting verification."
            icon={<ShieldCheck className="h-8 w-8" />}
          />
        ) : (
          <ul className="space-y-3">
            {badges.map((b) => (
              <li key={b.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <TrustBadge type={b.badgeType} size="default" />
                      <span className="tabular text-sm font-semibold text-primary">
                        {npr(b.amountNpr)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {relativeTime(b.purchasedAt)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-foreground">
                      {b.provider.legalName}
                      {b.provider.user?.name &&
                      b.provider.user.name !== b.provider.legalName
                        ? ` (${b.provider.user.name})`
                        : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {b.provider.kycTier.replace(/_/g, " ")} · trust{" "}
                      {Math.round(b.provider.trustScore)}
                      {b.provider.user?.phone ? ` · ${b.provider.user.phone}` : ""}
                    </p>
                    {b.catalog && (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {b.catalog.verificationStep}
                      </p>
                    )}
                    {b.documentUrl && (
                      <a
                        href={b.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        View document <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {b.badgeType === "SKILL_VERIFIED" && (
                      <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Crown className="h-3 w-3" /> Cross-check against the Skill
                        Evidence queue.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === b.id}
                    onClick={() => {
                      setRejecting(b);
                      setReason("");
                    }}
                  >
                    Reject
                  </Button>
                  <Button size="sm" disabled={busyId === b.id} onClick={() => verify(b)}>
                    {busyId === b.id ? "…" : "Verify & activate"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        title="Reject badge"
      >
        {rejecting && (
          <>
            <p className="text-sm text-muted-foreground">
              The provider is told why and can re-apply after paying again.
            </p>
            <div className="mt-4">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. The insurance document is expired — upload a current policy."
              />
            </div>
            <Button
              full
              className="mt-5"
              disabled={busyId === rejecting.id || reason.trim().length < 3}
              onClick={reject}
            >
              {busyId === rejecting.id ? "Saving…" : "Confirm rejection"}
            </Button>
          </>
        )}
      </Sheet>
    </div>
  );
}
