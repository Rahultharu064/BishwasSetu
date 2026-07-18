import { Badge } from "@/components/ui/badge";

const BOOKING_STATUS_MAP: Record<string, { label: string; variant: "neutral" | "success" | "warning" | "destructive" | "accent" }> = {
  REQUESTED: { label: "Requested", variant: "warning" },
  ACCEPTED: { label: "Accepted", variant: "accent" },
  IN_PROGRESS: { label: "In progress", variant: "accent" },
  COMPLETED: { label: "Completed", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "neutral" },
};

export function BookingStatusBadge({ status }: { status: string }) {
  const meta = BOOKING_STATUS_MAP[status] ?? { label: status, variant: "neutral" as const };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

const KYC_STATUS_MAP: Record<string, { label: string; variant: "neutral" | "success" | "warning" | "destructive" }> = {
  INCOMPLETE: { label: "Incomplete", variant: "neutral" },
  PENDING_DOCUMENTS: { label: "Documents needed", variant: "warning" },
  UNDER_REVIEW: { label: "Under review", variant: "warning" },
  VERIFIED: { label: "Verified", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
};

export function KycStatusBadge({ status }: { status: string }) {
  const meta = KYC_STATUS_MAP[status] ?? { label: status, variant: "neutral" as const };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

const ESCROW_STATUS_MAP: Record<string, { label: string; variant: "neutral" | "success" | "warning" | "destructive" }> = {
  NONE: { label: "Not paid", variant: "neutral" },
  PENDING: { label: "Payment pending", variant: "warning" },
  HELD: { label: "Payment secured", variant: "success" },
  RELEASED: { label: "Paid out", variant: "success" },
  REFUNDED: { label: "Refunded", variant: "neutral" },
  DISPUTED: { label: "Disputed", variant: "destructive" },
};

export function EscrowStatusBadge({ status }: { status: string }) {
  const meta = ESCROW_STATUS_MAP[status] ?? { label: status, variant: "neutral" as const };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
