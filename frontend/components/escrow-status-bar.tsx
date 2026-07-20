import { CircleCheck } from "lucide-react";

import { cn } from "@/lib/utils";

const steps = ["Paid & held", "Job in progress", "Awaiting confirmation", "Released"];

export function EscrowStatusBar({
  activeStep = 1,
  className,
}: {
  activeStep?: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex items-center", className)}>
      {steps.map((step, index) => {
        const isComplete = index < activeStep;
        const isCurrent = index === activeStep;

        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-[10px] font-bold",
                  isComplete && "bg-primary text-primary-foreground",
                  isCurrent && "border-2 border-primary text-primary",
                  !isComplete && !isCurrent && "border border-border text-muted-foreground",
                )}
              >
                {isComplete ? <CircleCheck className="size-4" aria-hidden /> : index + 1}
              </span>
              <span className="w-16 text-center text-[10px] font-medium leading-tight text-muted-foreground">
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span
                className={cn(
                  "-mt-4 h-0.5 flex-1",
                  isComplete ? "bg-primary" : "bg-border",
                )}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
