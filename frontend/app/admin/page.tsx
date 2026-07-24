"use client";

import Link from "next/link";
import {
  Users,
  ShieldCheck,
  ClipboardCheck,
  CalendarCheck,
  MessageSquareWarning,
  Coins,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { npr } from "@/lib/format";
import type { AdminDashboard } from "@/lib/admin-types";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  const { data, loading, error, reload } = useFetch<AdminDashboard>(
    () => api.adminDashboard() as Promise<AdminDashboard>,
    []
  );

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Platform health at a glance.
      </p>

      {loading ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : error || !data ? (
        <div className="mt-6">
          <ErrorState message={error ?? "Couldn't load the dashboard."} onRetry={reload} />
        </div>
      ) : (
        <>
          {/* Priority: pending verifications (ux.md §12.1) */}
          <Link
            href="/admin/kyc"
            className="mt-6 flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary-soft/50 p-5 transition-colors hover:bg-primary-soft"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ClipboardCheck className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">Verification queue</p>
                {data.providers.pendingKycReview > 0 && (
                  <Badge variant="warning" size="sm">
                    {data.providers.pendingKycReview} waiting
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Review provider KYC — median target &lt; 4 hours
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-primary" />
          </Link>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              icon={<Users className="h-5 w-5" />}
              label="Active users"
              value={data.users.total.toLocaleString()}
              sub={`+${data.users.newThisWeek} this week`}
            />
            <Stat
              icon={<ShieldCheck className="h-5 w-5" />}
              label="Verified providers"
              value={data.providers.verified.toLocaleString()}
              sub={`of ${data.providers.total} total`}
            />
            <Stat
              icon={<TrendingUp className="h-5 w-5" />}
              label="Avg trust score"
              value={String(data.providers.avgTrustScore)}
              sub="verified providers"
            />
            <Stat
              icon={<CalendarCheck className="h-5 w-5" />}
              label="Bookings (30d)"
              value={data.bookings.thisMonth.toLocaleString()}
              sub={`${data.bookings.completed} completed all-time`}
            />
            <Stat
              icon={<Coins className="h-5 w-5" />}
              label="Commission (30d)"
              value={npr(data.revenue.monthlyCommissionNpr)}
              sub={`${data.revenue.monthlyBookings} paid bookings`}
            />
            <Stat
              icon={<Coins className="h-5 w-5" />}
              label="Commission (all-time)"
              value={npr(data.revenue.totalCommissionNpr)}
            />
            <Stat
              icon={<MessageSquareWarning className="h-5 w-5" />}
              label="Open complaints"
              value={String(data.complaints.open)}
              sub={data.complaints.critical > 0 ? `${data.complaints.critical} critical` : "none critical"}
              alert={data.complaints.critical > 0}
            />
            <Stat
              icon={<ClipboardCheck className="h-5 w-5" />}
              label="Pending KYC"
              value={String(data.providers.pendingKycReview)}
              alert={data.providers.pendingKycReview > 0}
            />
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span
          className={
            alert
              ? "flex h-9 w-9 items-center justify-center rounded-full bg-urgent-soft text-urgent"
              : "flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary"
          }
        >
          {icon}
        </span>
      </div>
      <p className="tabular mt-3 text-2xl font-bold">{value}</p>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
