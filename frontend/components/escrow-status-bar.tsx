import { Lock, Check } from "lucide-react";
import type { EscrowStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

// 4-step stepper: Paid → Held → Job Done → Released (ux.md §3 / §9.1)
const STEPS = ["Paid", "Held", "Job Done", "Released"];

function stepIndex(status: EscrowStatus): number {
  switch (status) {
    case "PENDING":
      return 0;
    case "HELD":
      return 1;
    case "DISPUTED":
      return 2;
    case "RELEASED":
      return 3;
    case "REFUNDED":
      return 3;
    default:
      return -1;
  }
}

export function EscrowStatusBar({ status }: { status: EscrowStatus }) {
  if (status === "NONE") return null;
  const active = stepIndex(status);

  return (
    <div className="flex items-center">
      {STEPS.map((label, i) => {
        const done = i <= active;
        return (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs",
                  done
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {i === 1 ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : done ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "mt-1 whitespace-nowrap text-[10px] font-medium",
                  done ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-0.5 flex-1 rounded",
                  i < active ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
