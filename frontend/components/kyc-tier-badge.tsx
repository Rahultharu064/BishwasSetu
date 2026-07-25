import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KycTier } from "@/lib/types";

const TIER_META: Record<
  KycTier,
  { label: string; sublabel: string; icon: React.ReactNode; color: string; bg: string }
> = {
  TIER_1_BASIC: {
    label: "Tier 1 · Basic",
    sublabel: "ID verified — limited to jobs under NPR 1,000",
    icon: <Shield className="h-4 w-4" />,
    color: "text-muted-foreground",
    bg: "bg-secondary",
  },
  TIER_2_SKILLED: {
    label: "Tier 2 · Skilled",
    sublabel: "ID + skill certificate verified — full access",
    icon: <ShieldAlert className="h-4 w-4" />,
    color: "text-skilled",
    bg: "bg-skilled-soft",
  },
  TIER_3_VERIFIED: {
    label: "Tier 3 · Verified Pro",
    sublabel: "Background check + ongoing reviews passed",
    icon: <ShieldCheck className="h-4 w-4" />,
    color: "text-primary",
    bg: "bg-primary-soft",
  },
};

export function KycTierBadge({
  tier,
  showLabel = true,
}: {
  tier: KycTier;
  showLabel?: boolean;
}) {
  const meta = TIER_META[tier];
  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1", meta.bg, meta.color)}>
      {meta.icon}
      {showLabel && <span className="text-xs font-semibold">{meta.label}</span>}
    </div>
  );
}

export function KycTierCard({ tier }: { tier: KycTier }) {
  const meta = TIER_META[tier];
  return (
    <div className={cn("flex items-center gap-3 rounded-xl p-4", meta.bg)}>
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/60", meta.color)}>
        {meta.icon}
      </span>
      <div>
        <p className={cn("text-sm font-bold", meta.color)}>{meta.label}</p>
        <p className="text-xs text-muted-foreground">{meta.sublabel}</p>
      </div>
    </div>
  );
}
