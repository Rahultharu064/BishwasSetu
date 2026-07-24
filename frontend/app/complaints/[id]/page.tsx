"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { formatDateTime } from "@/lib/format";
import type { Complaint } from "@/lib/types";
import {
  ComplaintStatusBadge,
  ComplaintTracker,
  COMPLAINT_TYPE_LABEL,
} from "@/components/complaint-bits";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";

export default function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, loading, error, reload } = useFetch<Complaint>(
    () => api.complaintById(id),
    [id]
  );

  if (loading)
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );

  if (error || !data)
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ErrorState message={error ?? "Complaint not found."} onRetry={reload} />
      </div>
    );

  const c = data;
  const resolved = c.status === "RESOLVED" || c.status === "DISMISSED";

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link
        href="/complaints"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> My complaints
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {COMPLAINT_TYPE_LABEL[c.type] ?? c.type}
        </h1>
        <ComplaintStatusBadge status={c.status} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Complaint #{c.id.slice(0, 8)} · filed {formatDateTime(c.createdAt)}
      </p>

      {/* Status tracker */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <ComplaintTracker status={c.status} />
      </div>

      {/* Escrow-paused note */}
      {!resolved && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-warning-soft p-4">
          <Clock className="h-5 w-5 shrink-0 text-warning" />
          <p className="text-sm text-foreground">
            Escrow release is paused while our team reviews this complaint.
          </p>
        </div>
      )}

      {/* Details */}
      <div className="mt-5 space-y-3 rounded-xl border border-border bg-card p-5">
        {c.provider?.legalName && (
          <Row label="Provider">{c.provider.legalName}</Row>
        )}
        {c.booking?.category?.name && (
          <Row label="Service">{c.booking.category.name}</Row>
        )}
        {c.booking?.scheduledAt && (
          <Row label="Booked for">{formatDateTime(c.booking.scheduledAt)}</Row>
        )}
      </div>

      {/* Your report */}
      <section className="mt-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          What you reported
        </h2>
        <p className="rounded-xl border border-border bg-card p-4 text-[15px] leading-relaxed">
          {c.description}
        </p>
      </section>

      {/* Resolution */}
      {c.resolution && (
        <section className="mt-5">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-primary">
            <CheckCircle2 className="h-4 w-4" /> Resolution
          </h2>
          <div className="rounded-xl bg-primary-soft p-4">
            <p className="text-[15px] leading-relaxed text-foreground">
              {c.resolution}
            </p>
            {c.resolvedAt && (
              <p className="mt-2 text-xs text-muted-foreground">
                Resolved {formatDateTime(c.resolvedAt)}
              </p>
            )}
          </div>
        </section>
      )}

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Protected by the
        7-Day Workmanship Guarantee
      </p>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{children}</span>
    </div>
  );
}
