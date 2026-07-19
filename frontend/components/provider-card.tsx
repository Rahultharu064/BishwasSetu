import { Star, Zap } from "lucide-react";

import { ExperienceBadge } from "@/components/experience-badge";
import { NeighborhoodTag } from "@/components/neighborhood-tag";
import { TierBadge } from "@/components/tier-badge";
import { TrustScoreRing } from "@/components/trust-score-ring";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Provider } from "@/lib/data";

export function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <Card className="flex w-64 shrink-0 flex-col gap-3 p-4 snap-start sm:w-full">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground"
            aria-hidden
          >
            {provider.initials}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold leading-tight text-foreground">
              {provider.name}
            </h3>
            <p className="truncate text-sm text-muted-foreground">
              {provider.category}
            </p>
          </div>
        </div>
        <TrustScoreRing score={provider.trustScore} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <TierBadge tier={provider.tier} />
        <ExperienceBadge level={provider.experienceBadge} />
      </div>

      <NeighborhoodTag
        neighborhood={provider.neighborhood}
        jobsThisMonth={provider.jobsThisMonth}
      />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star className="size-3.5 fill-warning text-warning" aria-hidden />
          <span className="font-medium text-foreground">
            {(provider.trustScore / 20).toFixed(1)}
          </span>
          ({provider.reviewCount})
        </span>
        {provider.fastResponder && (
          <span className="flex items-center gap-1 text-accent-urgent">
            <Zap className="size-3.5 fill-accent-urgent" aria-hidden />
            Fast Responder
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <p className="text-sm text-muted-foreground">
          from{" "}
          <span className="font-bold text-foreground tabular-nums">
            NPR {provider.priceFrom}
          </span>
        </p>
        <Button size="sm">Book Now</Button>
      </div>
    </Card>
  );
}
