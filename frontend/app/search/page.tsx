"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { providersFrom } from "@/lib/normalize";
import type { Pagination } from "@/lib/types";
import { SearchBar } from "@/components/home/search-bar";
import { ProviderCard, ProviderCardSkeleton } from "@/components/provider-card";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SORTS = [
  { key: "trust", label: "Trust Score" },
  { key: "distance", label: "Distance" },
  { key: "price", label: "Price" },
];

function SearchInner() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const [sort, setSort] = useState("trust");
  const [tierFloor, setTierFloor] = useState(true); // Tier 2+ default (ux.md §5.2)
  const [page, setPage] = useState(1);

  // A new search term or sort order invalidates whatever page we were on.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [q, sort]);

  const req = useFetch(
    () => api.searchProviders({ q: q || undefined, page, limit: 20, sort }),
    [q, sort, page]
  );
  const providers = providersFrom(req.data).filter((p) =>
    tierFloor ? p.kycTier !== "TIER_1_BASIC" : true
  );
  const pagination = (req.data as { pagination?: Pagination } | undefined)
    ?.pagination;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="max-w-2xl">
        <SearchBar initial={q} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" /> Sort:
        </span>
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              sort === s.key
                ? "border-primary bg-primary-soft text-primary"
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {s.label}
          </button>
        ))}
        <button
          onClick={() => setTierFloor((v) => !v)}
          className={`ml-auto rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            tierFloor
              ? "border-primary bg-primary-soft text-primary"
              : "border-border text-muted-foreground hover:bg-secondary"
          }`}
        >
          Skilled &amp; verified only
        </button>
      </div>

      <div className="mt-6">
        <div className="mb-4 flex items-center gap-2">
          <h1 className="text-lg font-semibold">
            {q ? `Results for “${q}”` : "All providers"}
          </h1>
          {!req.loading && (
            <Badge variant="soft" size="sm">
              {pagination?.total ?? providers.length}
            </Badge>
          )}
        </div>

        {req.loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProviderCardSkeleton key={i} />
            ))}
          </div>
        ) : req.error ? (
          <ErrorState message={req.error} onRetry={req.reload} />
        ) : providers.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matching providers yet"
            description="Try a different keyword, remove the tier filter, or expand your search radius."
            action={
              tierFloor
                ? { label: "Include all tiers", onClick: () => setTierFloor(false) }
                : undefined
            }
          />
        )}

        {!req.loading && !req.error && pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
