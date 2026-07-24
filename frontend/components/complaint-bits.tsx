import { Badge } from "./ui/badge";
import type { ComplaintStatus, ComplaintType } from "@/lib/types";

export const COMPLAINT_TYPE_LABEL: Record<ComplaintType, string> = {
  SERVICE_QUALITY: "Service quality",
  NO_SHOW: "No-show",
  OVERCHARGING: "Overcharging",
  ABUSIVE_BEHAVIOR: "Abusive behaviour",
  FRAUD: "Fraud",
};

const STATUS: Record<
  ComplaintStatus,
  { label: string; variant: "warning" | "skilled" | "primary" | "neutral" }
> = {
  OPEN: { label: "Open", variant: "warning" },
  UNDER_REVIEW: { label: "Under review", variant: "skilled" },
  RESOLVED: { label: "Resolved", variant: "primary" },
  DISMISSED: { label: "Dismissed", variant: "neutral" },
};

export function ComplaintStatusBadge({ status }: { status: ComplaintStatus }) {
  const s = STATUS[status] ?? STATUS.OPEN;
  return (
    <Badge variant={s.variant} size="sm">
      {s.label}
    </Badge>
  );
}

// Status tracker mirrors the booking timeline (ux.md §5.6)
const STEPS: ComplaintStatus[] = ["OPEN", "UNDER_REVIEW", "RESOLVED"];

export function ComplaintTracker({ status }: { status: ComplaintStatus }) {
  const active =
    status === "DISMISSED" ? 2 : STEPS.indexOf(status);
  const labels =
    status === "DISMISSED"
      ? ["Filed", "Reviewed", "Dismissed"]
      : ["Filed", "Under review", "Resolved"];

  return (
    <div className="flex items-center">
      {labels.map((label, i) => {
        const done = i <= active;
        return (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`h-3 w-3 rounded-full ${
                  done ? "bg-primary" : "bg-border"
                }`}
              />
              <span
                className={`mt-1 whitespace-nowrap text-[10px] font-medium ${
                  done ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 rounded ${
                  i < active ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
