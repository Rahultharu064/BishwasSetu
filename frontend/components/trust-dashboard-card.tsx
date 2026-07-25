"use client";

import { useState, useRef } from "react";
import {
  ShieldCheck,
  Clock,
  XCircle,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TrustScoreRing } from "@/components/trust-score-ring";
import type { KycTier } from "@/lib/types";
import { KycTierBadge } from "@/components/kyc-tier-badge";

// ── Trust Event Feed ───────────────────────────────────────────

export interface TrustEvent {
  id: string;
  delta: number; // positive = gain, negative = loss
  trigger: string;
  createdAt: string;
}

function deltaIcon(delta: number) {
  if (delta > 0) return <TrendingUp className="h-3.5 w-3.5 text-primary" />;
  if (delta < 0) return <TrendingDown className="h-3.5 w-3.5 text-urgent" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

const TRIGGER_LABELS: Record<string, string> = {
  review: "Verified review received",
  complaint: "Complaint filed",
  booking_completed: "Booking completed on-platform",
  high_rejection_rate: "High rejection rate flagged",
  guarantee_claim: "Workmanship claim filed",
  kyc_verified: "KYC approved",
};

function TrustEventRow({ event }: { event: TrustEvent }) {
  const label = TRIGGER_LABELS[event.trigger] ?? event.trigger;
  const isPos = event.delta > 0;
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          isPos
            ? "bg-primary-soft text-primary"
            : event.delta < 0
              ? "bg-urgent-soft text-urgent"
              : "bg-secondary text-muted-foreground"
        )}
      >
        {deltaIcon(event.delta)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(event.createdAt).toLocaleDateString("en-NP", {
            day: "2-digit",
            month: "short",
          })}
        </p>
      </div>
      <span
        className={cn(
          "tabular shrink-0 text-sm font-bold",
          isPos ? "text-primary" : event.delta < 0 ? "text-urgent" : "text-muted-foreground"
        )}
      >
        {isPos ? "+" : ""}
        {event.delta.toFixed(1)}
      </span>
    </div>
  );
}

// ── Trust Score Meter Dashboard Card ──────────────────────────

interface TrustDashboardCardProps {
  score: number;
  kycTier: KycTier;
  identityStatus: string;
  recentEvents?: TrustEvent[];
  onViewAll?: () => void;
}

const STATUS_META: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  VERIFIED: {
    label: "Identity Verified",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
    color: "text-primary",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    icon: <Clock className="h-3.5 w-3.5" />,
    color: "text-warning",
  },
  REJECTED: {
    label: "KYC Rejected",
    icon: <XCircle className="h-3.5 w-3.5" />,
    color: "text-urgent",
  },
  INCOMPLETE: {
    label: "Not Started",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    color: "text-muted-foreground",
  },
  PENDING_DOCUMENTS: {
    label: "Pending Documents",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    color: "text-warning",
  },
};

function scoreLabel(score: number) {
  if (score >= 85) return { text: "Excellent", color: "text-primary" };
  if (score >= 70) return { text: "Good", color: "text-primary" };
  if (score >= 50) return { text: "Fair", color: "text-warning" };
  return { text: "Building", color: "text-muted-foreground" };
}

export function TrustDashboardCard({
  score,
  kycTier,
  identityStatus,
  recentEvents = [],
  onViewAll,
}: TrustDashboardCardProps) {
  const status = STATUS_META[identityStatus] ?? STATUS_META.INCOMPLETE;
  const label = scoreLabel(score);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header Row */}
      <div className="flex items-center gap-4 p-5">
        <TrustScoreRing score={score} size={72} stroke={6} />
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Trust Score
          </p>
          <p className={cn("text-2xl font-extrabold tabular", label.color)}>
            {Math.round(score)}{" "}
            <span className={cn("text-sm font-semibold", label.color)}>
              · {label.text}
            </span>
          </p>
          <div className={cn("mt-1 flex items-center gap-1 text-xs font-medium", status.color)}>
            {status.icon}
            <span>{status.label}</span>
          </div>
        </div>
        <div className="shrink-0">
          <KycTierBadge tier={kycTier} />
        </div>
      </div>

      {/* Score bar */}
      <div className="mx-5 mb-4 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${Math.max(4, score)}%` }}
        />
      </div>

      {/* Milestones Row */}
      <div className="mx-5 mb-4 grid grid-cols-3 gap-2">
        {[
          { at: 50, label: "Established", done: score >= 50 },
          { at: 70, label: "Trusted Pro", done: score >= 70 },
          { at: 90, label: "Master", done: score >= 90 },
        ].map((m) => (
          <div
            key={m.at}
            className={cn(
              "rounded-lg px-2 py-1.5 text-center",
              m.done ? "bg-primary-soft" : "bg-secondary"
            )}
          >
            {m.done ? (
              <CheckCircle2 className="mx-auto mb-0.5 h-3.5 w-3.5 text-primary" />
            ) : (
              <span className="text-[10px] font-bold text-muted-foreground">
                {m.at}+
              </span>
            )}
            <p
              className={cn(
                "text-[10px] font-semibold leading-tight",
                m.done ? "text-primary" : "text-muted-foreground"
              )}
            >
              {m.label}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div className="border-t border-border">
          <button
            className="flex w-full items-center justify-between px-5 py-3 text-sm font-semibold"
            onClick={() => setExpanded((x) => !x)}
            aria-expanded={expanded}
          >
            Recent activity
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                expanded && "rotate-90"
              )}
            />
          </button>
          {expanded && (
            <div className="divide-y divide-border px-5">
              {recentEvents.slice(0, 5).map((ev) => (
                <TrustEventRow key={ev.id} event={ev} />
              ))}
              {onViewAll && recentEvents.length > 5 && (
                <button
                  onClick={onViewAll}
                  className="py-3 text-sm font-semibold text-primary hover:underline"
                >
                  View all activity
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
