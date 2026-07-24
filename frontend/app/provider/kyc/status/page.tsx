"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ShieldCheck,
  ShieldAlert,
  Clock,
  FileText,
  Sparkles,
  RefreshCw,
  IdCard,
  Camera,
  FileBadge,
} from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { relativeTime } from "@/lib/format";
import type { IdentityStatus, KycStatus, SkillStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";

const IDENTITY_META: Record<
  IdentityStatus,
  {
    label: string;
    tone: "pending" | "review" | "verified" | "rejected";
    blurb: string;
  }
> = {
  INCOMPLETE: {
    label: "Not started",
    tone: "pending",
    blurb: "Upload your documents to begin verification.",
  },
  PENDING_DOCUMENTS: {
    label: "Awaiting documents",
    tone: "pending",
    blurb: "We still need your ID and selfie to start the review.",
  },
  UNDER_REVIEW: {
    label: "Under review",
    tone: "review",
    blurb:
      "Our team is checking your documents. Most reviews finish within 4 hours.",
  },
  VERIFIED: {
    label: "Verified",
    tone: "verified",
    blurb: "You're verified. Your profile now shows the trust badge.",
  },
  REJECTED: {
    label: "Action needed",
    tone: "rejected",
    blurb: "We couldn't verify your documents. See the note below and resubmit.",
  },
};

const SKILL_LABEL: Record<SkillStatus, string> = {
  UNVERIFIED: "No evidence submitted",
  SELF_DECLARED: "Self-declared",
  PENDING_REVIEW: "Evidence under review",
  VERIFIED: "Skill verified",
};

const DOC_META: Record<
  string,
  { label: string; icon: typeof IdCard }
> = {
  governmentId: { label: "Government ID", icon: IdCard },
  selfie: { label: "Selfie", icon: Camera },
  certificate: { label: "Certificate", icon: FileBadge },
};

const TONE_STYLES = {
  pending: "bg-secondary text-muted-foreground",
  review: "bg-warning-soft text-warning",
  verified: "bg-primary-soft text-primary",
  rejected: "bg-urgent-soft text-urgent",
} as const;

function pct(v?: number | null): string | null {
  if (v == null) return null;
  const n = v <= 1 ? v * 100 : v;
  return `${Math.round(n)}%`;
}

export default function KycStatusPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated)
      router.replace("/login?next=/provider/kyc/status");
  }, [authLoading, isAuthenticated, router]);

  const { data, loading, error, reload } = useFetch<KycStatus>(
    () => api.kycStatus(),
    [isAuthenticated],
    { pollMs: 20000, enabled: polling }
  );

  // Poll while the review is in progress so the outcome arrives automatically.
  useEffect(() => {
    setPolling(data?.identityStatus === "UNDER_REVIEW");
  }, [data]);

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link
        href="/provider"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Verification status</h1>
        <button
          onClick={reload}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          aria-label="Refresh status"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : error || !data ? (
        <div className="mt-6">
          <ErrorState
            message={error ?? "Couldn't load your status."}
            onRetry={reload}
          />
        </div>
      ) : (
        <StatusBody data={data} polling={polling} />
      )}
    </div>
  );
}

function StatusBody({
  data,
  polling,
}: {
  data: KycStatus;
  polling: boolean;
}) {
  const meta = IDENTITY_META[data.identityStatus] ?? IDENTITY_META.INCOMPLETE;
  const StatusIcon =
    meta.tone === "verified"
      ? ShieldCheck
      : meta.tone === "rejected"
        ? ShieldAlert
        : Clock;
  const rejected = data.identityStatus === "REJECTED";
  const needsDocs =
    data.identityStatus === "PENDING_DOCUMENTS" ||
    data.identityStatus === "INCOMPLETE";
  const ai = data.aiDecision;

  return (
    <>
      {/* Primary status card */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-center">
        <span
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${TONE_STYLES[meta.tone]}`}
        >
          <StatusIcon className="h-7 w-7" />
        </span>
        <div className="mt-3 flex items-center justify-center gap-2">
          <h2 className="text-lg font-bold">{meta.label}</h2>
          {polling && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-warning" />
            </span>
          )}
        </div>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
          {meta.blurb}
        </p>

        {(needsDocs || rejected) && (
          <Link href="/provider/kyc" className="mt-4 block">
            <Button full>
              {rejected ? "Resubmit documents" : "Upload documents"}
            </Button>
          </Link>
        )}
      </div>

      {/* Rejection reason */}
      {rejected && data.identityRejectionReason && (
        <div className="mt-4 rounded-xl border border-urgent/30 bg-urgent-soft p-4">
          <p className="text-sm font-semibold text-urgent">Why it was rejected</p>
          <p className="mt-1 text-sm text-foreground">
            {data.identityRejectionReason}
          </p>
        </div>
      )}

      {/* AI pre-check summary */}
      {ai && (ai.confidence != null || ai.forgeryRisk != null) && (
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> Automated pre-check
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {pct(ai.confidence) && (
              <Metric label="Match confidence" value={pct(ai.confidence)!} />
            )}
            {pct(ai.forgeryRisk) && (
              <Metric
                label="Forgery risk"
                value={pct(ai.forgeryRisk)!}
                alert={(ai.forgeryRisk ?? 0) > 0.3}
              />
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            A human reviewer always makes the final decision.
          </p>
        </div>
      )}

      {/* Skill status */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-sm font-semibold">Skill verification</p>
          <p className="text-sm text-muted-foreground">
            {SKILL_LABEL[data.skillStatus] ?? data.skillStatus}
          </p>
        </div>
        {data.skillStatus === "VERIFIED" ? (
          <Badge variant="skilled" size="sm">
            <ShieldCheck className="h-3 w-3" /> Verified
          </Badge>
        ) : (
          <Link
            href="/provider/kyc"
            className="text-sm font-medium text-primary hover:underline"
          >
            Add evidence
          </Link>
        )}
      </div>

      {/* Submitted documents */}
      {data.documents.length > 0 && (
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">Submitted documents</p>
          <ul className="mt-3 space-y-2">
            {data.documents.map((doc, i) => {
              const dm = DOC_META[doc.type] ?? {
                label: doc.type,
                icon: FileText,
              };
              const Icon = dm.icon;
              return (
                <li
                  key={`${doc.type}-${i}`}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 font-medium">{dm.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {relativeTime(doc.uploadedAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}

function Metric({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-lg bg-secondary p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`tabular mt-0.5 text-lg font-bold ${alert ? "text-urgent" : "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  );
}
