import { cn } from "@/lib/utils";

// Circular progress (0–100), color-stepped: <50 gray, 50–69 amber, 70+ primary (ux.md §3)
function ringColor(score: number): string {
  if (score >= 70) return "var(--primary)";
  if (score >= 50) return "var(--warning)";
  return "var(--muted-foreground)";
}

export function TrustScoreRing({
  score,
  size = 56,
  stroke = 5,
  className,
}: {
  score: number;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped / 100);
  const color = ringColor(clamped);

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Trust score ${clamped} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="tabular font-bold leading-none"
          style={{ fontSize: size * 0.3, color }}
        >
          {clamped}
        </span>
      </div>
    </div>
  );
}
