import {
  Wrench,
  Zap,
  Sparkles,
  Paintbrush,
  Hammer,
  Trees,
  Bug,
  Snowflake,
  Truck,
  Wind,
  KeyRound,
  Refrigerator,
  type LucideIcon,
} from "lucide-react";

// Map a category (by slug/name keyword) to a canonical Lucide icon (ux.md §2.4)
const MAP: { keys: string[]; icon: LucideIcon }[] = [
  { keys: ["plumb", "pipe", "water"], icon: Wrench },
  { keys: ["electric", "wiring", "light"], icon: Zap },
  { keys: ["clean"], icon: Sparkles },
  { keys: ["paint"], icon: Paintbrush },
  { keys: ["carpent", "furniture", "wood"], icon: Hammer },
  { keys: ["garden", "landscap"], icon: Trees },
  { keys: ["pest"], icon: Bug },
  { keys: ["ac", "air", "cool", "hvac"], icon: Snowflake },
  { keys: ["move", "moving", "shift"], icon: Truck },
  { keys: ["appliance", "fridge", "washing"], icon: Refrigerator },
  { keys: ["vent", "duct"], icon: Wind },
  { keys: ["lock", "key", "security"], icon: KeyRound },
];

export function categoryIcon(nameOrSlug: string): LucideIcon {
  const s = (nameOrSlug || "").toLowerCase();
  for (const entry of MAP) {
    if (entry.keys.some((k) => s.includes(k))) return entry.icon;
  }
  return Wrench;
}

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = categoryIcon(name);
  return <Icon className={className} />;
}
