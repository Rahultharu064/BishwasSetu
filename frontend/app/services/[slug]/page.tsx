"use client";

import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageSpinner } from "@/components/ui/spinner";
import { EmptyState, ErrorBanner } from "@/components/shared/states";
import { ProviderCard } from "@/components/shared/provider-card";
import { Input } from "@/components/ui/input";
import { ProviderApi } from "@/lib/endpoints";
import { useFetch } from "@/lib/use-fetch";
import { formatNpr } from "@/lib/utils";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [serviceArea, setServiceArea] = React.useState("");

  const { data, loading, error, refetch } = useFetch(
    () => ProviderApi.providersByCategory(slug, { serviceArea: serviceArea || undefined, limit: 24 }),
    [slug, serviceArea]
  );

  if (loading && !data) return <PageSpinner />;

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <ErrorBanner message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/services" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> All categories
      </Link>

      <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{data?.category.name ?? slug}</h1>
          <p className="mt-1 text-muted-foreground">
            {data?.pagination.total ?? 0} verified providers in this category
          </p>
        </div>
        <Input
          value={serviceArea}
          onChange={(e) => setServiceArea(e.target.value)}
          placeholder="Filter by area, e.g. Baneshwor"
          className="sm:w-64"
        />
      </div>

      {data?.marketStats && data.marketStats.totalBookings > 0 && (
        <div className="mt-6 flex flex-wrap gap-6 rounded-2xl border border-border bg-secondary/40 px-5 py-4 text-sm">
          <Stat label="Typical price range" value={`${formatNpr(data.marketStats.priceMin)} – ${formatNpr(data.marketStats.priceMax)}`} />
          <Stat label="Average trust score" value={String(data.marketStats.avgTrustScore)} />
          <Stat label="Completed jobs" value={String(data.marketStats.totalBookings)} />
        </div>
      )}

      <div className="mt-8">
        {!data?.providers?.length ? (
          <EmptyState
            title="No providers here yet"
            description="This category doesn't have a verified provider in your area yet. Check back soon."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.providers.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}
