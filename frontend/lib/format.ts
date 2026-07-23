// Formatting helpers — Nepal conventions (ux.md §14)
// Latin digits for prices/scores (banking convention); Nepali script for cultural terms.

export function npr(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return `NPR ${amount.toLocaleString("en-IN")}`;
}

/** Price display for a Service (fixed / range / quote). */
export function servicePrice(s: {
  pricingType?: string;
  priceMin?: number | null;
  priceMax?: number | null;
  priceFixed?: number | null;
  priceUnit?: string | null;
}): string {
  const unit = s.priceUnit ? ` / ${s.priceUnit}` : "";
  switch (s.pricingType) {
    case "fixed":
      return s.priceFixed != null ? `${npr(s.priceFixed)}${unit}` : "—";
    case "range":
      if (s.priceMin != null && s.priceMax != null)
        return `NPR ${s.priceMin.toLocaleString("en-IN")}–${s.priceMax.toLocaleString("en-IN")}${unit}`;
      if (s.priceMin != null) return `from ${npr(s.priceMin)}${unit}`;
      return "—";
    case "quote":
    default:
      return "Get a quote";
  }
}

export function relativeTime(input: string | Date): string {
  const then = new Date(input).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(input).toLocaleDateString();
}

export function formatDateTime(input: string | Date): string {
  return new Date(input).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Experience badge names (ux.md §8.2 / PRD §4.2)
export const EXPERIENCE_BADGES: Record<string, { np: string; en: string }> = {
  NEW: { np: "नविन", en: "New" },
  ESTABLISHED: { np: "अनुभवी", en: "Experienced" },
  TRUSTED_PRO: { np: "प्रवीन", en: "Trusted Pro" },
  MASTER_PROVIDER: { np: "प्रवीन", en: "Master Provider" },
};

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
