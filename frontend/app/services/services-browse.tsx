"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PageSpinner } from "@/components/ui/spinner";
import { EmptyState, ErrorBanner } from "@/components/shared/states";
import { ProviderCard } from "@/components/shared/provider-card";
import { ServiceApi, ProviderApi } from "@/lib/endpoints";
import { useFetch } from "@/lib/use-fetch";

export default function ServicesBrowse() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <ServicesBrowseInner />
    </Suspense>
  );
}

function ServicesBrowseInner() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const [query, setQuery] = React.useState(q);

  const { data: categories, loading: catsLoading } = useFetch(() => ServiceApi.categories(), []);
  const {
    data: searchResults,
    loading: searchLoading,
    error: searchError,
  } = useFetch(
    () => (q ? ProviderApi.search({ q, limit: 20 }) : Promise.resolve(null)),
    [q]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/services${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Browse services</h1>
      <p className="mt-1.5 text-muted-foreground">Find a verified provider for the job.</p>

      <form onSubmit={handleSearch} className="relative mt-6 max-w-lg">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search providers or services…"
          className="h-12 pl-11"
        />
      </form>

      {q && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold">
            Results for &ldquo;{q}&rdquo;
          </h2>
          <div className="mt-4">
            {searchLoading ? (
              <PageSpinner label="Searching…" />
            ) : searchError ? (
              <ErrorBanner message={searchError} />
            ) : !searchResults?.providers?.length ? (
              <EmptyState title="No providers found" description="Try a different search term or browse a category below." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.providers.map((p) => (
                  <ProviderCard key={p.id} provider={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-lg font-semibold">All categories</h2>
        {catsLoading ? (
          <PageSpinner />
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {(categories ?? []).map((c) => (
              <Link key={c.id} href={`/services/${c.slug}`}>
                <Card className="group flex h-full flex-col items-start gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lifted)]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-xl">
                    {c.icon ?? "🛠️"}
                  </span>
                  <div>
                    <p className="font-semibold group-hover:text-primary">{c.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {c._count?.providers ?? 0} verified providers
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
