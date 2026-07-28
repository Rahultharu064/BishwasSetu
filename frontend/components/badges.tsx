import { ShieldCheck, BadgeCheck, Zap, Award, Umbrella, Fingerprint } from "lucide-react";
import { Badge } from "./ui/badge";
import { EXPERIENCE_BADGES } from "@/lib/format";
import type { KycTier, MilestoneBadge, TrustBadgeType } from "@/lib/types";

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

// Paid Trust Badges (PRD §4.3) — verified trust signals shown on profiles.
const TRUST_BADGE_META: Record<
  TrustBadgeType,
  { label: string; icon: typeof Award; title: string }
> = {
  SKILL_VERIFIED: {
    label: "Skill Verified",
    icon: Award,
    title: "Trade skill verified through reviewed work samples or a certificate",
  },
  BACKGROUND_CHECKED: {
    label: "Background Checked",
    icon: Fingerprint,
    title: "Passed a criminal-record background check",
  },
  INSURED: {
    label: "Insured",
    icon: Umbrella,
    title: "Carries valid liability insurance",
  },
  FAST_RESPONDER: {
    label: "Fast Responder",
    icon: Zap,
    title: "Accepts emergency jobs within 5 minutes",
  },
};

export function TrustBadge({
  type,
  size = "sm",
}: {
  type: TrustBadgeType;
  size?: "sm" | "default" | "lg";
}) {
  const meta = TRUST_BADGE_META[type];
  if (!meta) return null;
  const Icon = meta.icon;
  const variant = type === "FAST_RESPONDER" ? "urgentSoft" : "skilled";
  return (
    <Badge variant={variant} size={size} title={meta.title}>
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </Badge>
  );
}
