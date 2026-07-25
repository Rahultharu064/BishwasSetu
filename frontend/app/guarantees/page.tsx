"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  ChevronLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { npr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { cn } from "@/lib/utils";

type GuaranteeStatus = "ACTIVE" | "EXPIRED" | "CLAIMED" | "RESOLVED";

interface Guarantee {
  id: string;
  status: GuaranteeStatus;
  expiresAt: string;
  escrow: { bookingId: string; amountPaisa: number };
  claims: { id: string; description: string; resolution?: string | null; resolvedAt?: string | null }[];
}

const STATUS_META: Record<GuaranteeStatus, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  ACTIVE: {
    label: "Active",
    icon: <ShieldCheck className="h-4 w-4" />,
    color: "text-primary",
    bg: "bg-primary-soft",
  },
  EXPIRED: {
    label: "Expired",
    icon: <Clock className="h-4 w-4" />,
    color: "text-muted-foreground",
    bg: "bg-secondary",
  },
  CLAIMED: {
    label: "Claim in review",
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "text-warning",
    bg: "bg-warning-soft",
  },
  RESOLVED: {
    label: "Resolved",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-primary",
    bg: "bg-primary-soft",
  },
};

function GuaranteeCard({ g }: { g: Guarantee }) {
  const meta = STATUS_META[g.status];
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(g.expiresAt).getTime() - Date.now()) / 86400000)
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className={cn("flex items-center gap-3 px-5 py-4", meta.bg)}>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-white/50", meta.color)}>
          {meta.icon}
        </span>
        <div className="flex-1">
          <p className={cn("text-sm font-bold", meta.color)}>{meta.label}</p>
          {g.status === "ACTIVE" && (
            <p className="text-xs text-muted-foreground">{daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining</p>
          )}
        </div>
        <p className="tabular text-sm font-semibold text-foreground">
          {npr(g.escrow.amountPaisa / 100)}
        </p>
      </div>

      <div className="px-5 py-4">
        <p className="text-xs text-muted-foreground">
          Booking{" "}
          <Link href={`/bookings/${g.escrow.bookingId}`} className="font-medium text-primary hover:underline">
            #{g.escrow.bookingId.slice(0, 8)}
          </Link>
          {" · "}
          {g.status === "ACTIVE"
            ? `Valid until ${new Date(g.expiresAt).toLocaleDateString("en-NP", { day: "numeric", month: "short" })}`
            : g.status === "CLAIMED"
              ? "Our team is reviewing your claim"
              : g.status === "RESOLVED"
                ? "Claim resolved"
                : "Guarantee period ended"}
        </p>

        {/* Claims */}
        {g.claims.length > 0 && (
          <div className="mt-3 space-y-2">
            {g.claims.map((c) => (
              <div key={c.id} className="rounded-lg bg-secondary p-3">
                <p className="text-sm font-medium">{c.description}</p>
                {c.resolution && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-primary">
                    <CheckCircle2 className="h-3 w-3" /> {c.resolution}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* File claim CTA */}
        {g.status === "ACTIVE" && (
          <Link href={`/guarantees/${g.id}/claim`} className="mt-4 block">
            <Button variant="outline" full size="sm">
              <AlertTriangle className="h-3.5 w-3.5" />
              File a workmanship claim
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function GuaranteesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login?next=/guarantees");
  }, [authLoading, isAuthenticated, router]);

  const { data, loading, error, reload } = useFetch<Guarantee[]>(
    () => api.myGuarantees() as Promise<Guarantee[]>,
    [isAuthenticated]
  );

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link
        href="/bookings"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> My bookings
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Service Guarantees</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every on-platform booking is covered by our 7-day workmanship guarantee.
        </p>
      </div>

      {/* What is covered banner */}
      <div className="mb-6 rounded-2xl border border-primary/20 bg-primary-soft p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-primary">What the guarantee covers</p>
            <ul className="mt-2 space-y-1 text-sm text-foreground">
              <li>• Faulty workmanship within 7 days of job completion</li>
              <li>• Provider must return to fix at no extra cost</li>
              <li>• Backed by platform escrow funds if unresolved</li>
            </ul>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <XCircle className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">No guarantees yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Guarantees are created automatically when a booking is paid via escrow.
          </p>
          <Link href="/bookings">
            <Button variant="outline" className="mt-4">View my bookings</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((g) => (
            <GuaranteeCard key={g.id} g={g} />
          ))}
        </div>
      )}
    </div>
  );
}
