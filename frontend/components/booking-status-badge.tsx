import { Badge } from "./ui/badge";
import type { BookingStatus } from "@/lib/types";

const MAP: Record<
  BookingStatus,
  { label: string; variant: "soft" | "skilled" | "warning" | "neutral" | "urgentSoft" | "primary" }
> = {
  REQUESTED: { label: "Requested", variant: "warning" },
  ACCEPTED: { label: "Accepted", variant: "skilled" },
  IN_PROGRESS: { label: "In progress", variant: "skilled" },
  COMPLETED: { label: "Completed", variant: "primary" },
  REJECTED: { label: "Rejected", variant: "urgentSoft" },
  CANCELLED: { label: "Cancelled", variant: "neutral" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const s = MAP[status] ?? MAP.REQUESTED;
  return (
    <Badge variant={s.variant} size="sm">
      {s.label}
    </Badge>
  );
}
