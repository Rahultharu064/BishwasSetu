"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Lock,
  TrendingUp,
  Briefcase,
  ShieldCheck,
  Coins,
  ChevronRight,
  Siren,
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

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Provider dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {user?.name}, here&apos;s your work at a glance.
      </p>

      {loading ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
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
            <Button full>Start verification</Button>
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

          {/* Earnings buckets (ux.md §6.3) */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Earnings
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <EarningTile
                icon={<Lock className="h-4 w-4" />}
                label="In escrow"
                value={npr(
                  data.earnings.totalRevenue - data.earnings.totalEarnings
                )}
              />
              <EarningTile
                icon={<Wallet className="h-4 w-4" />}
                label="Earned"
                value={npr(data.earnings.totalEarnings)}
              />
              <EarningTile
                icon={<TrendingUp className="h-4 w-4" />}
                label="Revenue pts"
                value={String(data.earnings.totalRevenue)}
              />
            </div>
          </div>

          {/* Jobs */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Jobs
              </h2>
              <Link
                href="/provider/jobs"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Manage jobs
                {data.stats.requested > 0 && (
                  <span className="tabular ml-1 rounded-full bg-urgent-soft px-1.5 text-[11px] font-semibold text-urgent">
                    {data.stats.requested} new
                  </span>
                )}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <Link href="/provider/jobs" className="grid grid-cols-4 gap-3">
              <StatTile label="New" value={data.stats.requested} />
              <StatTile label="Accepted" value={data.stats.accepted} />
              <StatTile label="Active" value={data.stats.inProgress} />
              <StatTile label="Done" value={data.stats.completed} />
            </Link>
          </div>

          {/* Emergency dispatch inbox */}
          <Link
            href="/provider/emergencies"
            className="flex items-center gap-3 rounded-2xl border border-urgent/30 bg-urgent-soft/30 p-5 transition-colors hover:bg-urgent-soft/50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-urgent text-urgent-foreground">
              <Siren className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold">Emergency jobs</p>
              <p className="text-sm text-muted-foreground">
                Accept nearby SOS requests — first to respond wins
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-urgent" />
          </Link>

          {/* Boost */}
          <Link
            href="/provider/boost"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Coins className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold">Boost & credits</p>
              <p className="tabular text-sm text-muted-foreground">
                Balance: {data.creditBalance} credits
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </div>
      )}
    </div>
  );
}

function EarningTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="tabular mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <p className="tabular text-xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
