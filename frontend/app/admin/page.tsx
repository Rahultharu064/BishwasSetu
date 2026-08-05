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
  BadgeCheck,
  Flag,
  Layers,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { npr } from "@/lib/format";
import type {
  AdminDashboard,
  RevenueAnalytics,
  BookingTrendPoint,
} from "@/lib/admin-types";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";
import { BarChart, type BarChartDatum } from "@/components/ui/bar-chart";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const QUICK_ACTIONS = [
  { href: "/admin/kyc", label: "Verification queue", icon: ClipboardCheck },
  { href: "/admin/skill-evidence", label: "Skill evidence", icon: BadgeCheck },
  { href: "/admin/complaints", label: "Complaints", icon: MessageSquareWarning },
  { href: "/admin/fraud", label: "Trust & fraud", icon: Flag },
  { href: "/admin/services", label: "Services", icon: Layers },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const { data, loading, error, reload } = useFetch<AdminDashboard>(
    () => api.adminDashboard() as Promise<AdminDashboard>,
    []
  );

  const revenue = useFetch<RevenueAnalytics>(
    () =>
      api.adminRevenue({
        from: new Date(Date.now() - THIRTY_DAYS_MS).toISOString(),
        to: new Date().toISOString(),
      }) as Promise<RevenueAnalytics>,
    []
  );

  const trend = useFetch<BookingTrendPoint[]>(
    () => api.adminBookingsTrend(14),
    []
  );

  const trendChartData: BarChartDatum[] = (trend.data ?? []).map((p) => ({
    label: new Date(p.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: p.total,
    detail: `${p.completed} completed`,
  }));

  const revenueChartData: BarChartDatum[] = revenue.data
    ? [
        { label: "Commission", value: revenue.data.streams.commission.totalNpr },
        { label: "Credit packs", value: revenue.data.streams.credits.totalNpr },
        { label: "Boost badges", value: revenue.data.streams.badges.totalNpr },
      ]
    : [];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Overview"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{today} · Platform health at a glance.</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href}
              href={a.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
            >
              <Icon className="h-3.5 w-3.5" />
              {a.label}
            </Link>
          );
        })}
      </div>

      {loading ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : error || !data ? (
        <div className="mt-5">
          <ErrorState message={error ?? "Couldn't load the dashboard."} onRetry={reload} />
        </div>
      ) : (
        <>
          {/* Priority: pending verifications (ux.md §12.1) */}
          <Link
            href="/admin/kyc"
            className="mt-5 flex items-center gap-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary-soft to-primary-soft/40 p-5 shadow-sm transition-colors hover:from-primary-soft hover:to-primary-soft"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <ClipboardCheck className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
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
            <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
          </Link>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              tone="primary"
              icon={<Users className="h-5 w-5" />}
              label="Active users"
              value={data.users.total.toLocaleString()}
              sub={`+${data.users.newThisWeek} this week`}
            />
            <StatCard
              tone="skilled"
              icon={<ShieldCheck className="h-5 w-5" />}
              label="Verified providers"
              value={data.providers.verified.toLocaleString()}
              sub={`of ${data.providers.total} total`}
            />
            <StatCard
              tone="primary"
              icon={<TrendingUp className="h-5 w-5" />}
              label="Avg trust score"
              value={String(data.providers.avgTrustScore)}
              sub="verified providers"
            />
            <StatCard
              tone="skilled"
              icon={<CalendarCheck className="h-5 w-5" />}
              label="Bookings (30d)"
              value={data.bookings.thisMonth.toLocaleString()}
              sub={`${data.bookings.completed} completed all-time`}
            />
            <StatCard
              tone="primary"
              icon={<Coins className="h-5 w-5" />}
              label="Commission (30d)"
              value={npr(data.revenue.monthlyCommissionNpr)}
              sub={`${data.revenue.monthlyBookings} paid bookings`}
            />
            <StatCard
              tone="primary"
              icon={<Coins className="h-5 w-5" />}
              label="Commission (all-time)"
              value={npr(data.revenue.totalCommissionNpr)}
            />
            <StatCard
              tone={data.complaints.critical > 0 ? "urgent" : "neutral"}
              icon={<MessageSquareWarning className="h-5 w-5" />}
              label="Open complaints"
              value={String(data.complaints.open)}
              sub={data.complaints.critical > 0 ? `${data.complaints.critical} critical` : "none critical"}
              href="/admin/complaints"
            />
            <StatCard
              tone={data.providers.pendingKycReview > 0 ? "warning" : "neutral"}
              icon={<ClipboardCheck className="h-5 w-5" />}
              label="Pending KYC"
              value={String(data.providers.pendingKycReview)}
              href="/admin/kyc"
            />
          </div>
        </>
      )}

      {/* Charts */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* Bookings trend (last 14 days) */}
        <SectionCard title="Bookings" subtitle="Last 14 days">
          {trend.loading ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : trend.error ? (
            <ErrorState message={trend.error} onRetry={trend.reload} />
          ) : (
            <BarChart data={trendChartData} height={160} />
          )}
        </SectionCard>

        {/* Revenue breakdown (last 30 days) */}
        <SectionCard title="Revenue streams" subtitle="Last 30 days">
          {revenue.loading ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : revenue.error || !revenue.data ? (
            <ErrorState
              message={revenue.error ?? "Couldn't load revenue."}
              onRetry={revenue.reload}
            />
          ) : (
            <>
              <p className="text-sm font-medium text-muted-foreground">
                Total revenue
              </p>
              <p className="tabular text-3xl font-bold text-primary">
                {npr(revenue.data.totalRevenueNpr)}
              </p>
              <div className="mt-4">
                <BarChart
                  data={revenueChartData}
                  valueFormatter={(v) => npr(v)}
                  height={120}
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <RevenueStream
                  label="Commission"
                  value={npr(revenue.data.streams.commission.totalNpr)}
                  sub={`${revenue.data.streams.commission.bookingsCount} bookings`}
                />
                <RevenueStream
                  label="Credit packs"
                  value={npr(revenue.data.streams.credits.totalNpr)}
                  sub={`${revenue.data.streams.credits.purchasesCount} purchases`}
                />
                <RevenueStream
                  label="Boost badges"
                  value={npr(revenue.data.streams.badges.totalNpr)}
                  sub={`${revenue.data.streams.badges.badgesCount} badges`}
                />
              </div>
            </>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function RevenueStream({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl bg-secondary p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="tabular mt-0.5 text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
