import { ShieldCheck, BadgeCheck, Zap } from "lucide-react";
import { Badge } from "./ui/badge";
import { EXPERIENCE_BADGES } from "@/lib/format";
import type { KycTier, MilestoneBadge } from "@/lib/types";

// TierBadge (ux.md §3): Tier 1 Basic (gray) · Tier 2 Skilled (blue) · Tier 3 Verified & Insured (primary)
export function TierBadge({
  tier,
  size = "default",
}: {
  tier: KycTier;
  size?: "sm" | "default" | "lg";
}) {
  if (tier === "TIER_3_VERIFIED")
    return (
      <Badge variant="primary" size={size}>
        <ShieldCheck className="h-3.5 w-3.5" />
        Verified &amp; Insured
      </Badge>
    );
  if (tier === "TIER_2_SKILLED")
    return (
      <Badge variant="skilled" size={size}>
        <BadgeCheck className="h-3.5 w-3.5" />
        Skilled
      </Badge>
    );
  return (
    <Badge variant="outline" size={size}>
      Basic
    </Badge>
  );
}

// Experience badge — नविन / अनुभवी / प्रवीन, Nepali-first with EN tooltip (ux.md §8.2)
export function ExperienceBadge({
  milestone,
  size = "default",
}: {
  milestone: MilestoneBadge;
  size?: "sm" | "default" | "lg";
}) {
  const b = EXPERIENCE_BADGES[milestone] ?? EXPERIENCE_BADGES.NEW;
  return (
    <Badge variant="neutral" size={size} title={b.en}>
      {b.np}
      <span className="font-normal text-muted-foreground">· {b.en}</span>
    </Badge>
  );
}

export function FastResponderChip() {
  return (
    <Badge variant="urgentSoft" size="sm" title="Accepts emergency jobs within 5 minutes">
      <Zap className="h-3 w-3" />
      Fast Responder
    </Badge>
  );
}
