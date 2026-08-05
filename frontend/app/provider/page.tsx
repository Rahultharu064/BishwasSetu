"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Lock,
  TrendingUp,
  ShieldCheck,
  Coins,
  ChevronRight,
  Siren,
  Briefcase,
  CheckCircle,
  Hourglass,
  BadgeCheck,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { npr } from "@/lib/format";
import { TrustDashboardCard } from "@/components/trust-dashboard-card";
import type { TrustEvent } from "@/components/trust-dashboard-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

interface Dashboard {
  provider: {
    legalName: string;
    trustScore: number;
    identityStatus: string;
    kycTier: import("@/lib/types").KycTier;
    completedBookings: number;
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
  recentTrustEvents?: TrustEvent[];
}

const STAT_TONE = {
  primary: "bg-primary-soft text-primary",
  skilled: "bg-skilled-soft text-skilled",
  warning: "bg-warning-soft text-warning",
  urgent: "bg-urgent-soft text-urgent",
  neutral: "bg-secondary text-secondary-foreground",
} as const;

function Stat({
  icon,
  label,
  value,
  sub,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  tone?: keyof typeof STAT_TONE;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full",
          STAT_TONE[tone]
        )}
      >
        {icon}
      </span>
      <p className="tabular mt-3 text-2xl font-bold">{value}</p>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

const QUICK_ACTIONS = [
  { href: "/provider/jobs", label: "My jobs", icon: Briefcase },
  { href: "/provider/emergencies", label: "Emergencies", icon: Siren },
  { href: "/provider/boost", label: "Boost & credits", icon: Coins },
  { href: "/provider/badges", label: "Trust badges", icon: BadgeCheck },
];

export default function ProviderDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login?next=/provider");
  }, [authLoading, isAuthenticated, router]);

  const { data, loading, error, reload } = useFetch<Dashboard>(
    () => apiRequest<Dashboard>("/providers/me/dashboard", { auth: true }),
    [isAuthenticated]
  );

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (authLoading || !isAuthenticated) return null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Provider Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {today} · Here&apos;s your work at a glance.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href}
              href={a.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
            >
              <Icon className="h-4 w-4" />
              {a.label}
            </Link>
          );
        })}
      </div>

      {loading ? (
        <div className="mt-6 space-y-5">
          <Skeleton className="h-40 rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
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
          <Link href="/provider/onboarding" className="mt-4 block">
            <Button full size="lg">Start verification</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Trust + KYC Tier Dashboard Card */}
          <TrustDashboardCard
            score={data.provider.trustScore}
            kycTier={data.provider.kycTier ?? "TIER_1_BASIC"}
            identityStatus={data.provider.identityStatus}
            recentEvents={data.recentTrustEvents}
            onViewAll={() => {}}
          />

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              tone="urgent"
              icon={<Siren className="h-5 w-5" />}
              label="New requests"
              value={data.stats.requested}
              sub={data.stats.requested > 0 ? "Action required" : "All caught up"}
            />
            <Stat
              tone="warning"
              icon={<Hourglass className="h-5 w-5" />}
              label="Active jobs"
              value={data.stats.inProgress}
              sub={`${data.stats.accepted} accepted`}
            />
            <Stat
              tone="primary"
              icon={<CheckCircle className="h-5 w-5" />}
              label="Completed"
              value={data.stats.completed}
              sub={`${data.provider.completedBookings} all-time`}
            />
            <Stat
              tone="skilled"
              icon={<Coins className="h-5 w-5" />}
              label="Credit Balance"
              value={data.creditBalance}
              sub="Available for boost"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Earnings buckets (ux.md §6.3) */}
            <SectionCard title="Earnings" subtitle="Revenue breakdown">
              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground">Total earned</p>
                <p className="tabular text-3xl font-bold text-primary">{npr(data.earnings.totalEarnings)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-secondary/60 p-3 transition-colors hover:bg-secondary">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium uppercase tracking-wide">In escrow</span>
                  </div>
                  <p className="tabular mt-1.5 text-lg font-bold">
                    {npr(data.earnings.totalRevenue - data.earnings.totalEarnings)}
                  </p>
                </div>
                <div className="rounded-xl bg-secondary/60 p-3 transition-colors hover:bg-secondary">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium uppercase tracking-wide">Revenue Pts</span>
                  </div>
                  <p className="tabular mt-1.5 text-lg font-bold">
                    {data.earnings.totalRevenue}
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Quick Modules */}
            <div className="space-y-4">
              <Link
                href="/provider/emergencies"
                className="group flex items-center gap-4 rounded-2xl border border-urgent/20 bg-gradient-to-r from-urgent-soft/40 to-urgent-soft/10 p-5 transition-all hover:border-urgent/40 hover:from-urgent-soft/60 hover:shadow-sm"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-urgent text-urgent-foreground shadow-sm">
                  <Siren className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground group-hover:text-urgent">Emergency dispatch</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Accept nearby SOS requests — first to respond wins.
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-urgent transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/provider/badges"
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground group-hover:text-primary">Trust Badges</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Get Skill Verified & Insured to boost your profile.
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
