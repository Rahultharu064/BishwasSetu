"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Wallet, ClipboardList, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { PageSpinner } from "@/components/ui/spinner";
import { ErrorBanner, EmptyState } from "@/components/shared/states";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingCard } from "@/components/shared/booking-card";
import { TrustScoreBadge } from "@/components/shared/trust-badge";
import { ProviderApi } from "@/lib/endpoints";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/lib/auth-context";
import { formatNpr } from "@/lib/utils";

export default function ProviderDashboardPage() {
  const router = useRouter();
  const { user, bootstrapping } = useAuth();

  React.useEffect(() => {
    if (!bootstrapping && !user) router.replace("/login?next=/provider/dashboard");
    if (user && user.role !== "PROVIDER") router.replace("/services");
  }, [bootstrapping, user, router]);

  const { data, loading, error, refetch } = useFetch(
    () => (user ? ProviderApi.dashboard() : Promise.resolve(null)),
    [user]
  );

  if (bootstrapping || loading || !user) return <PageSpinner />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <ErrorBanner message={error ?? "Couldn't load your dashboard."} onRetry={refetch} />
      </div>
    );
  }

  const { provider, stats, earnings, recentBookings } = data;
  const needsVerification = provider.identityStatus !== "VERIFIED";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {provider.legalName?.split(" ")[0] ?? "there"}</h1>
          <p className="mt-1 text-muted-foreground">Here&apos;s how your work is going.</p>
        </div>
        <TrustScoreBadge score={provider.trustScore} />
      </div>

      {needsVerification && (
        <Card className="mt-6 border-warning/30 bg-warning/8">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-warning-foreground" />
              <p className="text-sm">
                {provider.identityStatus === "UNDER_REVIEW"
                  ? "Your verification is under review by our team."
                  : "Verify your identity to start accepting bookings."}
              </p>
            </div>
            {provider.identityStatus !== "UNDER_REVIEW" && (
              <Link href="/provider/kyc">
                <Button size="sm">Verify now</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Requested" value={stats.requested} />
        <StatCard icon={Clock} label="In progress" value={stats.accepted + stats.inProgress} />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} accent />
        <StatCard icon={Wallet} label="Net earnings" value={formatNpr(earnings.totalEarnings)} isText />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent bookings</h2>
        <Link href="/bookings" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4">
        {recentBookings.length === 0 ? (
          <EmptyState title="No bookings yet" description="Once customers start booking you, they'll show up here." />
        ) : (
          <div className="space-y-3">
            {recentBookings.map((b) => (
              <BookingCard key={b.id} booking={b} perspective="provider" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  isText,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  accent?: boolean;
  isText?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent ? "bg-success/12 text-success" : "bg-secondary text-muted-foreground"}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className={`mt-3 font-bold ${isText ? "text-xl" : "text-2xl"}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}
