import Link from "next/link";
import { cn } from "@/lib/utils";

const STAT_TONE = {
  primary: "bg-primary-soft text-primary",
  skilled: "bg-skilled-soft text-skilled",
  warning: "bg-warning-soft text-warning",
  urgent: "bg-urgent-soft text-urgent",
  neutral: "bg-secondary text-secondary-foreground",
} as const;

export type StatTone = keyof typeof STAT_TONE;

/**
 * Shared stat tile used across admin/provider dashboards — icon badge, big
 * number, label, optional sub-line. One definition so every dashboard reads
 * as the same design system instead of drifting per-page copies.
 */
export function StatCard({
  icon,
  label,
  value,
  sub,
  tone = "neutral",
  href,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone?: StatTone;
  href?: string;
  className?: string;
}) {
  const body = (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow",
        href && "hover:shadow-md hover:border-primary/30",
        className
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full",
          STAT_TONE[tone]
        )}
      >
        {icon}
      </span>
      <p className="tabular mt-3 text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1.5 text-sm font-medium text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );

  if (!href) return body;

  return (
    <Link href={href} className="block">
      {body}
    </Link>
  );
}
