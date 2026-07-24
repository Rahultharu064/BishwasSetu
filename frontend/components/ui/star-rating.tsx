import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  count,
  size = "sm",
  className,
}: {
  rating: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const iconSize = size === "md" ? "h-4.5 w-4.5" : "h-3.5 w-3.5";
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.round(rating);
          return (
            <Star
              key={i}
              className={cn(iconSize, filled ? "fill-gold text-gold" : "fill-none text-border")}
            />
          );
        })}
      </div>
      <span className="text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
      {typeof count === "number" && (
        <span className="text-sm text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
