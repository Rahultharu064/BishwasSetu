import { cn } from "@/lib/utils";

const EXPERIENCE_CONFIG = {
  new: { ne: "नविन", en: "New · under 1 year" },
  experienced: { ne: "अनुभवी", en: "Experienced · 1–2 years" },
  expert: { ne: "प्रविण", en: "Expert · 2+ years" },
} as const;

export function ExperienceBadge({
  level,
  className,
}: {
  level: keyof typeof EXPERIENCE_CONFIG;
  className?: string;
}) {
  const config = EXPERIENCE_CONFIG[level];

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground",
        className,
      )}
      title={config.en}
    >
      {config.ne}
    </span>
  );
}
