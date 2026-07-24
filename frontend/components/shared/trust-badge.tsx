import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrustScoreBadge({ score, className }: { score: number; className?: string }) {
  const tone =
    score >= 75
      ? "bg-success/12 text-success"
      : score >= 50
      ? "bg-gold/18 text-gold-foreground"
      : "bg-secondary text-muted-foreground";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold",
        tone,
        className
      )}
    >
      <ShieldCheck className="h-4 w-4" />
      Trust {Math.round(score)}
    </div>
  );
}

export function VerifiedMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-success/12 px-2.5 py-1 text-xs font-medium text-success",
        className
      )}
      title="Identity verified by BishwasSetu"
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      Verified
    </span>
  );
}
