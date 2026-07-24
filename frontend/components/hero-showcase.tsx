import { Lock, Star } from "lucide-react";

import { EscrowStatusBar } from "@/components/escrow-status-bar";
import { ExperienceBadge } from "@/components/experience-badge";
import { TierBadge } from "@/components/tier-badge";
import { TrustScoreRing } from "@/components/trust-score-ring";
import { Card } from "@/components/ui/card";

export function HeroShowcase() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-primary/10 blur-2xl"
      />
      <Card className="w-full max-w-sm p-5 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground"
              aria-hidden
            >
              BT
            </div>
            <div>
              <p className="font-semibold leading-tight text-foreground">
                Bikash Tamang
              </p>
              <p className="text-sm text-muted-foreground">Electrician</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <TierBadge tier={3} />
                <ExperienceBadge level="expert" />
              </div>
            </div>
          </div>
          <TrustScoreRing score={92} />
        </div>

        <div className="mt-5 flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="size-4 fill-warning text-warning" aria-hidden />
          <span className="font-medium text-foreground">4.6</span>
          (214 reviews) · Maharajgunj
        </div>

        <div className="mt-5 rounded-2xl bg-secondary p-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Lock className="size-4 text-primary" aria-hidden />
            NPR 2,500 held safely by GharSewa
          </p>
          <EscrowStatusBar activeStep={1} className="mt-4" />
        </div>
      </Card>
    </div>
  );
}
