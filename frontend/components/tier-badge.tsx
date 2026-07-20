import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Tier } from "@/lib/data";
import { cn } from "@/lib/utils";

const TIER_CONFIG: Record<
  Tier,
  { label: string; variant: "outline" | "skilled" | "primary" }
> = {
  1: { label: "Basic", variant: "outline" },
  2: { label: "Skilled", variant: "skilled" },
  3: { label: "Verified & Insured", variant: "primary" },
};

export function TierBadge({ tier, className }: { tier: Tier; className?: string }) {
  const config = TIER_CONFIG[tier];

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {tier === 3 && <ShieldCheck className="size-3.5" aria-hidden />}
      {config.label}
      {tier === 2 && <span aria-hidden>✓</span>}
    </Badge>
  );
}
