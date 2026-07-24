import { Check, Loader2 } from "lucide-react";
import type { BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

// Vertical lifecycle timeline (ux.md §3, §5.5) with a live "current" pulse.
const STAGES: { key: string; label: string; hint: string }[] = [
  { key: "REQUESTED", label: "Requested", hint: "Waiting for the provider to accept" },
  { key: "ACCEPTED", label: "Accepted", hint: "Provider confirmed — heading your way" },
  { key: "IN_PROGRESS", label: "In progress", hint: "Work is underway" },
  { key: "COMPLETED", label: "Awaiting your confirmation", hint: "Tap Job Complete to release payment" },
];

const ORDER: Record<string, number> = {
  REQUESTED: 0,
  ACCEPTED: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
};

export function BookingLifecycle({ status }: { status: BookingStatus }) {
  // Terminal negative states short-circuit the timeline.
  if (status === "REJECTED" || status === "CANCELLED") {
    return (
      <div className="rounded-xl border border-border bg-secondary p-4 text-sm text-muted-foreground">
        This booking was {status === "REJECTED" ? "declined" : "cancelled"}.
      </div>
    );
  }

  const current = ORDER[status] ?? 0;
  const finished = status === "COMPLETED";

  return (
    <ol className="relative space-y-1">
      {STAGES.map((stage, i) => {
        const done = i < current || (finished && i === current);
        const active = i === current && !finished;
        return (
          <li key={stage.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs",
                  done
                    ? "bg-primary text-primary-foreground"
                    : active
                      ? "bg-primary-soft text-primary ring-4 ring-primary-soft"
                      : "bg-secondary text-muted-foreground"
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" />
                ) : active ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  i + 1
                )}
              </span>
              {i < STAGES.length - 1 && (
                <span
                  className={cn(
                    "my-0.5 w-0.5 flex-1",
                    done ? "bg-primary" : "bg-border"
                  )}
                  style={{ minHeight: 22 }}
                />
              )}
            </div>
            <div className={cn("pb-3", !done && !active && "opacity-60")}>
              <p className="text-sm font-medium leading-tight">
                {stage.label}
                {active && (
                  <span className="ml-2 text-xs font-semibold text-primary">
                    live
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{stage.hint}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
