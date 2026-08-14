"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { providersFrom } from "@/lib/normalize";
import type { Provider } from "@/lib/types";
import type { Pagination } from "@/lib/admin-types";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrustScoreRing } from "@/components/trust-score-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";

const FILTERS = [
  { value: "", label: "All" },
  { value: "VERIFIED", label: "Verified" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "REJECTED", label: "Rejected" },
  { value: "INCOMPLETE", label: "Incomplete" },
];

const STATUS_TONE: Record<string, "soft" | "warning" | "urgentSoft" | "neutral"> = {
  VERIFIED: "soft",
  UNDER_REVIEW: "warning",
  REJECTED: "urgentSoft",
  INCOMPLETE: "neutral",
  PENDING_DOCUMENTS: "warning",
};

export default function AdminProvidersPage() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const req = useFetch(
    () =>
      api.adminProviders({
        identityStatus: status || undefined,
        search: query || undefined,
        page,
        limit: 30,
      }),
    [status, query, page]
  );

  const providers = providersFrom(req.data) as (Provider & {
    _count?: { bookings?: number };
    user?: { name: string; email?: string; phone?: string };
  })[];
  const pagination = (req.data as { pagination?: Pagination } | undefined)
    ?.pagination;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Providers</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        All registered providers across every verification state.
      </p>

      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(search.trim());
        }}
        className="relative mt-4 max-w-md"
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or service area…"
          className="pl-10"
        />
      </form>

      {/* Filters */}
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            onClick={() => {
              setPage(1);
              setStatus(f.value);
            }}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium ${
              status === f.value
                ? "border-primary bg-primary-soft text-primary"
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {req.loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : req.error ? (
          <ErrorState message={req.error} onRetry={req.reload} />
        ) : providers.length === 0 ? (
          <EmptyState
            title="No providers found"
            description="Try a different filter or search term."
          />
        ) : (
          <ul className="space-y-3">
            {providers.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
              >
                <Avatar
                  src={p.profilePhoto}
                  name={p.legalName || p.user?.name || "Provider"}
                  size={44}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {p.legalName || p.user?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {p.serviceArea ?? "—"} · {p._count?.bookings ?? 0} bookings
                  </p>
                  <div className="mt-1">
                    <Badge
                      variant={STATUS_TONE[p.identityStatus] ?? "neutral"}
                      size="sm"
                    >
                      {p.identityStatus.replace(/_/g, " ").toLowerCase()}
                    </Badge>
                  </div>
                </div>
                <TrustScoreRing score={p.trustScore} size={40} stroke={4} />
                {p.identityStatus === "VERIFIED" && (
                  <Link
                    href={`/providers/${p.id}`}
                    target="_blank"
                    aria-label="View public profile"
                    className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-primary"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!req.loading && !req.error && pagination && pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between">
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
  );
}
