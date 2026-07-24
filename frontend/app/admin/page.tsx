"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, ShieldCheck, ClipboardList, AlertTriangle, Wallet, ArrowRight } from "lucide-react";
import { PageSpinner } from "@/components/ui/spinner";
import { ErrorBanner } from "@/components/shared/states";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminApi } from "@/lib/endpoints";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/lib/auth-context";
import { formatNpr } from "@/lib/utils";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, bootstrapping } = useAuth();

  React.useEffect(() => {
    if (!bootstrapping && !user) router.replace("/login?next=/admin");
    if (user && user.role !== "ADMIN" && user.role !== "MODERATOR") router.replace("/services");
  }, [bootstrapping, user, router]);

  const { data, loading, error, refetch } = useFetch(
    () => (user ? AdminApi.dashboard() : Promise.resolve(null)),
    [user]
  );

  if (bootstrapping || loading || !user) return <PageSpinner />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <ErrorBanner message={error ?? "Couldn't load the dashboard."} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin overview</h1>
          <p className="mt-1 text-muted-foreground">Pilot health at a glance.</p>
        </div>
        <Link href="/admin/kyc">
          <Button>
            KYC queue ({data.providers.pendingKycReview})
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Active users" value={data.users.total} sub={`+${data.users.newThisWeek} this week`} />
        <Stat
          icon={ShieldCheck}
          label="Verified providers"
          value={data.providers.verified}
          sub={`${data.providers.pendingKycReview} pending review`}
        />
        <Stat icon={ClipboardList} label="Bookings this month" value={data.bookings.thisMonth} sub={`${data.bookings.completed} completed all-time`} />
        <Stat icon={AlertTriangle} label="Open complaints" value={data.complaints.open} sub={`${data.complaints.critical} critical`} />
      </div>

      <Card className="mt-6 p-6">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Wallet className="h-4 w-4 text-primary" /> Revenue
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Commission (all-time)</p>
            <p className="mt-1 text-xl font-bold">{formatNpr(data.revenue.totalCommissionNpr)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Commission (this month)</p>
            <p className="mt-1 text-xl font-bold">{formatNpr(data.revenue.monthlyCommissionNpr)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg. trust score</p>
            <p className="mt-1 text-xl font-bold">{data.providers.avgTrustScore}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground/70">{sub}</p>
    </Card>
  );
}
