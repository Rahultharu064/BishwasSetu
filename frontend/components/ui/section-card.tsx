import { cn } from "@/lib/utils";

// Standardized "panel" wrapper for admin dashboard/settings sections — title
// + optional subtitle/action row, consistent padding and elevation, so every
// card on the page reads as one design system instead of ad-hoc divs.
export function SectionCard({
  title,
  subtitle,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card shadow-sm",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-baseline justify-between gap-3 border-b border-border/70 px-5 py-4">
          <div>
            {title && (
              <h2 className="text-base font-bold tracking-tight">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
