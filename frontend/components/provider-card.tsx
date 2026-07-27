import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Avatar } from "./ui/avatar";
import { TrustScoreRing } from "./trust-score-ring";
import { TierBadge, ExperienceBadge } from "./badges";
import { npr } from "@/lib/format";
import type { Provider } from "@/lib/types";

// <ProviderCard> anatomy per ux.md §3
export function ProviderCard({
  provider,
  priceFrom,
}: {
  provider: Provider;
  priceFrom?: number | null;
}) {
  const name = provider.legalName || provider.user?.name || "Provider";
  const reviewCount = provider._count?.reviews ?? provider.reviews?.length ?? 0;
  const rating =
    provider.reviews && provider.reviews.length
      ? provider.reviews.reduce((a, r) => a + r.rating, 0) /
        provider.reviews.length
      : null;

  return (
    <Link
      href={`/providers/${provider.id}`}
      className="group flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <Avatar src={provider.profilePhoto} name={name} size={56} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
              {name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <TierBadge tier={provider.kycTier} size="sm" />
              <ExperienceBadge milestone={provider.milestoneBadge} size="sm" />
            </div>
          </div>
          <TrustScoreRing score={provider.trustScore} size={48} stroke={4} />
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {provider.serviceArea && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {provider.serviceArea}
            </span>
          )}
          {rating != null && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              <span className="tabular font-medium text-foreground">
                {rating.toFixed(1)}
              </span>
              <span>({reviewCount})</span>
            </span>
          )}
          {priceFrom != null && (
            <span className="tabular font-medium text-foreground">
              from {npr(priceFrom)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProviderCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-4">
      <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-secondary" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-24 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-40 animate-pulse rounded bg-secondary" />
      </div>
    </div>
  );
}
