import { MapPin } from "lucide-react";

import { cn } from "@/lib/utils";

export function NeighborhoodTag({
  neighborhood,
  jobsThisMonth,
  className,
}: {
  neighborhood: string;
  jobsThisMonth: number;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-1 text-xs text-muted-foreground",
        className,
      )}
      title={`${jobsThisMonth} GPS-verified jobs completed in ${neighborhood} this month`}
    >
      <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden />
      <span className="truncate">
        {jobsThisMonth} jobs in {neighborhood} this month
      </span>
    </p>
  );
}
