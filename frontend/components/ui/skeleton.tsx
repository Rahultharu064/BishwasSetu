import { cn } from "@/lib/utils";

// Skeleton screens on every list/profile — no blank whites, no spinners > 1s (ux.md §16)
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-secondary", className)}
      {...props}
    />
  );
}
