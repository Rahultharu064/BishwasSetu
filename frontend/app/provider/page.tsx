"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  Lock,
  TrendingUp,
  ShieldCheck,
  Coins,
  ChevronRight,
  ArrowRight,
  Siren,
  Briefcase,
  CalendarCheck,
  Clock3,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { npr, relativeTime } from "@/lib/format";
import { TrustDashboardCard } from "@/components/trust-dashboard-card";
import type { TrustEvent } from "@/components/trust-dashboard-card";
import { ExperienceBadge } from "@/components/badges";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import type { BookingStatus, MilestoneBadge } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";

interface RecentBooking {
  id: string;
  status: BookingStatus;
  createdAt: string;
  customer?: { name: string } | null;
  category?: { name: string } | null;
}

interface TrustTrendPoint {
  score: number;
  trigger: string;
  createdAt: string;
}

interface Dashboard {
  provider: {
    legalName: string;
    trustScore: number;
    identityStatus: string;
    kycTier: import("@/lib/types").KycTier;
    completedBookings: number;
    milestoneBadge?: MilestoneBadge;
  };
  stats: {
    requested: number;
    accepted: number;
    inProgress: number;
    completed: number;
  };
  earnings: {
    totalRevenue: number;
    totalCommission: number;
    totalEarnings: number;
  };
  creditBalance: number;
  recentBookings?: RecentBooking[];
  trustTrend?: TrustTrendPoint[];
}

export default function ProviderDashboardPage() {
  // Auth + role gating already happened in app/provider/layout.tsx before
  // this page can render, so no redirect-on-mount dance is needed here —
  // same convention app/admin/page.tsx follows under app/admin/layout.tsx.
  const { user, isAuthenticated } = useAuth();

  const { data, loading, error, reload } = useFetch<Dashboard>(
    () => apiRequest<Dashboard>("/providers/me/dashboard", { auth: true }),
    [isAuthenticated]
  );

  // trustTrend is a chronological (oldest → newest) list of absolute scores;
  // TrustDashboardCard's feed wants deltas, newest first — derive both here
  // rather than asking the API to shape two representations of one series.
  const recentTrustEvents: TrustEvent[] = useMemo(() => {
    const trend = data?.trustTrend ?? [];
    return trend
      .map((point, i) => ({
        id: `${point.createdAt}-${i}`,
        delta: i === 0 ? 0 : point.score - trend[i - 1].score,
        trigger: point.trigger,
        createdAt: point.createdAt,
      }))
      .reverse();
  }, [data?.trustTrend]);

  const firstName = user?.name?.split(" ")[0];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {firstName ? `Welcome back, ${firstName}` : "Provider dashboard"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s your work at a glance.
          </p>
        </div>
        {data?.provider.milestoneBadge && (
          <ExperienceBadge milestone={data.provider.milestoneBadge} size="lg" />
        )}
      </div>

      {loading ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-24 rounded-2xl" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : error || !data ? (
        <div className="mt-6">
          <ErrorState
            message={
              error ??
              "Complete your provider profile to see your dashboard."
            }
            onRetry={reload}
          />
          <Link href="/provider/onboarding" className="mt-4 block max-w-xs">
            <Button full>Start verification</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Priority: new job requests waiting for a response */}
            {data.stats.requested > 0 ? (
              <Link
                href="/provider/jobs"
                className="flex items-center gap-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary-soft to-primary-soft/40 p-5 shadow-sm transition-colors hover:from-primary-soft hover:to-primary-soft"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <Briefcase className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {data.stats.requested} new job{" "}
                    {data.stats.requested === 1 ? "request" : "requests"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Fast responses win jobs and boost your trust score
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
              </Link>
            ) : (
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <CalendarCheck className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">You&apos;re all caught up</p>
                  <p className="text-sm text-muted-foreground">
                    No pending job requests right now
                  </p>
                </div>
              </div>
            )}

            {/* Jobs + earnings at a glance */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Jobs &amp; earnings
                </h2>
                <Link
                  href="/provider/jobs"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  Manage jobs
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                <StatCard
                  tone={data.stats.requested > 0 ? "urgent" : "neutral"}
                  icon={<Briefcase className="h-5 w-5" />}
                  label="New"
                  value={String(data.stats.requested)}
                  href="/provider/jobs"
                />
                <StatCard
                  tone="skilled"
                  icon={<CalendarCheck className="h-5 w-5" />}
                  label="Accepted"
                  value={String(data.stats.accepted)}
                  href="/provider/jobs"
                />
                <StatCard
                  tone="skilled"
                  icon={<Clock3 className="h-5 w-5" />}
                  label="Active"
                  value={String(data.stats.inProgress)}
                  href="/provider/jobs"
                />
                <StatCard
                  tone="primary"
                  icon={<ShieldCheck className="h-5 w-5" />}
                  label="Completed"
                  value={String(data.stats.completed)}
                  href="/provider/jobs"
                />
                <StatCard
                  tone="primary"
                  icon={<Wallet className="h-5 w-5" />}
                  label="Earned"
                  value={npr(data.earnings.totalEarnings)}
                />
                <StatCard
                  tone="warning"
                  icon={<Lock className="h-5 w-5" />}
                  label="In escrow"
                  value={npr(
                    data.earnings.totalRevenue - data.earnings.totalEarnings
                  )}
                />
                <StatCard
                  tone="neutral"
                  icon={<Coins className="h-5 w-5" />}
                  label="Credits"
                  value={String(data.creditBalance)}
                  href="/provider/boost"
                />
                <StatCard
                  tone="primary"
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="Trust score"
                  value={String(Math.round(data.provider.trustScore))}
                />
              </div>
            </div>

            {/* Recent bookings */}
            <SectionCard title="Recent activity" subtitle="Your last 5 bookings">
              {!data.recentBookings || data.recentBookings.length === 0 ? (
                <EmptyState
                  title="No bookings yet"
                  description="New job requests will show up here as soon as customers reach out."
                  icon={<Briefcase className="h-8 w-8" />}
                />
              ) : (
                <ul className="-mx-5 divide-y divide-border">
                  {data.recentBookings.map((b) => (
                    <li key={b.id}>
                      <Link
                        href={`/bookings/${b.id}`}
                        className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-secondary/60"
                      >
                        <Avatar
                          name={b.customer?.name ?? "Customer"}
                          size={38}
                          className="text-sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {b.category?.name ?? "Service booking"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {b.customer?.name ?? "Customer"} ·{" "}
                            {relativeTime(b.createdAt)}
                          </p>
                        </div>
                        <BookingStatusBadge status={b.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          {/* Side rail */}
          <div className="space-y-6">
            <TrustDashboardCard
              score={data.provider.trustScore}
              kycTier={data.provider.kycTier ?? "TIER_1_BASIC"}
              identityStatus={data.provider.identityStatus}
              recentEvents={recentTrustEvents}
              onViewAll={() => {}}
            />

            <Link
              href="/provider/emergencies"
              className="flex items-center gap-3 rounded-2xl border border-urgent/30 bg-urgent-soft/30 p-5 transition-colors hover:bg-urgent-soft/50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-urgent text-urgent-foreground">
                <Siren className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Emergency jobs</p>
                <p className="text-sm text-muted-foreground">
                  Accept nearby SOS requests — first to respond wins
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-urgent" />
            </Link>

            <Link
              href="/provider/boost"
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Coins className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Boost &amp; credits</p>
                <p className="tabular text-sm text-muted-foreground">
                  Balance: {data.creditBalance} credits
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </Link>

            <Link
              href="/provider/badges"
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Trust badges</p>
                <p className="text-sm text-muted-foreground">
                  Get Skill Verified, Insured &amp; more
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
