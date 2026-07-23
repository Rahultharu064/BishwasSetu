"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Users, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { providersFrom, marketStatsFrom } from "@/lib/normalize";
import { npr } from "@/lib/format";
import { FALLBACK_CATEGORIES } from "@/lib/fallback-data";
import { useLang } from "@/context/language-context";
import { CategoryIcon } from "@/components/category-icon";
import { ProviderCard, ProviderCardSkeleton } from "@/components/provider-card";
import { EmptyState, ErrorState } from "@/components/ui/states";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { t } = useLang();

  const providersReq = useFetch(
    () => api.providersByCategory(slug, { limit: 20 }),
    [slug]
  );

  const providers = providersFrom(providersReq.data);
  const stats = marketStatsFrom(providersReq.data);
  const fallbackCat = FALLBACK_CATEGORIES.find((c) => c.slug === slug);
  const catName =
    (providersReq.data as { category?: { name?: string; nameNp?: string } })
      ?.category?.name ??
    fallbackCat?.name ??
    slug.replace(/-/g, " ");
  const catNameNp =
    (providersReq.data as { category?: { nameNp?: string } })?.category
      ?.nameNp ?? fallbackCat?.nameNp;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link
        href="/services"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> All services
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <CategoryIcon name={slug} className="h-8 w-8" />
        </span>
        <div>
          <h1 className="text-2xl font-bold capitalize tracking-tight">
            {t(catName, catNameNp)}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Verified {catName.toLowerCase()} professionals near you
          </p>
        </div>
      </div>

      {/* Market stats */}
      {stats && (stats.totalProviders || stats.priceAvg) ? (
        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatTile
            icon={<Users className="h-4 w-4" />}
            label="Providers"
            value={String(stats.totalProviders ?? providers.length)}
          />
          <StatTile
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Avg trust"
            value={String(stats.avgTrustScore ?? "—")}
          />
          <StatTile
            icon={<TrendingUp className="h-4 w-4" />}
            label="Typical price"
            value={stats.priceAvg ? npr(stats.priceAvg) : "—"}
          />
        </div>
      ) : null}

      {/* Providers */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">
          {providers.length ? `${providers.length} providers` : "Providers"}
        </h2>

        {providersReq.loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProviderCardSkeleton key={i} />
            ))}
          </div>
        ) : providersReq.error ? (
          <ErrorState message={providersReq.error} onRetry={providersReq.reload} />
        ) : providers.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={`No ${catName.toLowerCase()} pros in your ward yet`}
            description="We're onboarding providers in your area. Try a wider radius or check back soon — every booking is escrow-protected."
            icon={<CategoryIcon name={slug} className="h-8 w-8" />}
          />
        )}
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="tabular mt-1 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
