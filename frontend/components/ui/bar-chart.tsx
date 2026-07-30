"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface BarChartDatum {
  label: string;
  value: number;
  /** Extra line shown in the hover tooltip, e.g. "9 completed". */
  detail?: string;
}

// Single-series bar chart — one brand hue, no legend needed (dataviz: "a
// single series needs no legend box — the title names it"). Built in plain
// HTML/CSS rather than SVG so it stays responsive without a resize observer.
export function BarChart({
  data,
  valueFormatter = (v) => v.toLocaleString(),
  height = 160,
  className,
}: {
  data: BarChartDatum[];
  valueFormatter?: (value: number) => string;
  height?: number;
  className?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const labelEvery = data.length > 8 ? Math.ceil(data.length / 6) : 1;

  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground"
        style={{ height }}
      >
        No activity in this period yet.
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className="flex items-end gap-1.5 border-b border-border"
        style={{ height }}
        role="img"
        aria-label={`Bar chart — ${data
          .map((d) => `${d.label}: ${valueFormatter(d.value)}`)
          .join(", ")}`}
      >
        {data.map((d, i) => {
          const pct = d.value === 0 ? 0 : Math.max((d.value / max) * 100, 4);
          const active = hover === i;
          return (
            <div
              key={`${d.label}-${i}`}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {active && (
                <div className="pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background shadow-lg">
                  <div className="font-semibold">{valueFormatter(d.value)}</div>
                  {d.detail && (
                    <div className="text-background/70">{d.detail}</div>
                  )}
                  <div className="text-background/70">{d.label}</div>
                </div>
              )}
              <div
                aria-hidden
                className={cn(
                  "w-full rounded-t-[4px] transition-colors",
                  active ? "bg-primary" : "bg-primary/80"
                )}
                style={{ height: `${pct}%`, minHeight: d.value > 0 ? 3 : 0 }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1.5" aria-hidden>
        {data.map((d, i) => (
          <div key={`${d.label}-${i}`} className="flex-1 text-center">
            {i % labelEvery === 0 && (
              <span className="text-[10px] font-medium text-muted-foreground">
                {d.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
