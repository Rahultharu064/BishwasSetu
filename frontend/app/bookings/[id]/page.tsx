"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useToast } from "@/context/toast-context";
import { npr, formatDateTime } from "@/lib/format";
import type { Booking } from "@/lib/types";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { EscrowStatusBar } from "@/components/escrow-status-bar";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { StarRatingInput } from "@/components/ui/star-rating";
import { Textarea, Label } from "@/components/ui/input";

const COMPLAINT_TYPES = [
  { value: "SERVICE_QUALITY", label: "Poor service quality" },
  { value: "NO_SHOW", label: "Provider didn't show up" },
  { value: "OVERCHARGING", label: "Overcharging" },
  { value: "ABUSIVE_BEHAVIOR", label: "Abusive behaviour" },
  { value: "FRAUD", label: "Fraud" },
];

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { data, loading, error, reload } = useFetch<Booking>(
    () => api.bookingById(id),
    [id]
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Inline review (ux.md §5.5)
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Complaint (ux.md §5.6)
  const [cType, setCType] = useState("SERVICE_QUALITY");
  const [cDesc, setCDesc] = useState("");
  const [cError, setCError] = useState<string | null>(null);

  async function completeJob() {
    setBusy(true);
    try {
      await api.updateBookingStatus(id, "COMPLETED");
      // Optionally leave a review in the same step.
      if (rating > 0) {
        try {
          await api.createReview({
            bookingId: id,
            rating,
            comment: comment.trim().length >= 10 ? comment.trim() : undefined,
          });
        } catch {
          /* review is optional — don't block the release */
        }
      }
      toast("Payment released. Thanks for confirming!", "success");
      setConfirmOpen(false);
      reload();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't update.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function submitComplaint() {
    if (cDesc.trim().length < 20) {
      setCError("Please describe the problem in at least 20 characters.");
      return;
    }
    setCError(null);
    setBusy(true);
    try {
      await api.createComplaint({ bookingId: id, type: cType, description: cDesc.trim() });
      toast("Complaint filed — escrow is paused while we review.", "success");
      setComplaintOpen(false);
      setCDesc("");
      reload();
    } catch (err) {
      setCError(err instanceof ApiError ? err.message : "Couldn't file the complaint.");
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );

  if (error || !data)
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ErrorState message={error ?? "Booking not found."} onRetry={reload} />
      </div>
    );

  const b = data;
  const providerName =
    b.provider?.legalName || b.provider?.user?.name || "Provider";
  const canComplete = b.status === "IN_PROGRESS" || b.status === "ACCEPTED";

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-6 md:pb-10">
      <Link
        href="/bookings"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> My bookings
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {b.category?.name ?? "Service"}
        </h1>
        <BookingStatusBadge status={b.status} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Booking #{b.id.slice(0, 8)}
      </p>

      {/* Escrow status */}
      {b.escrowStatus !== "NONE" && (
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold">
            <Lock className="h-4 w-4 text-primary" /> Escrow status
          </h2>
          <EscrowStatusBar status={b.escrowStatus} />
          {b.amount != null && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <span className="tabular font-semibold text-foreground">
                {npr(b.amount)}
              </span>{" "}
              held safely by BishwasSetu
            </p>
          )}
        </div>
      )}

      {/* Provider */}
      <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
        <Avatar src={b.provider?.profilePhoto} name={providerName} size={48} />
        <div className="flex-1">
          <p className="font-semibold">{providerName}</p>
          {b.provider && (
            <Link
              href={`/providers/${b.provider.id}`}
              className="text-sm text-primary hover:underline"
            >
              View profile
            </Link>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="mt-5 space-y-3 rounded-xl border border-border bg-card p-4 text-sm">
        {b.scheduledAt && (
          <Row label="Scheduled">{formatDateTime(b.scheduledAt)}</Row>
        )}
        {b.address && (
          <Row label="Address">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {b.address}
            </span>
          </Row>
        )}
        {b.notes && <Row label="Notes">{b.notes}</Row>}
      </div>

      {/* Guarantee */}
      <div className="mt-5 flex items-center gap-3 rounded-xl bg-primary-soft p-4">
        <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-foreground">
          Covered by the 7-Day Workmanship Guarantee.
        </p>
      </div>

      {/* Actions */}
      {canComplete && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-background/95 p-3 backdrop-blur md:bottom-0">
          <div className="mx-auto flex max-w-2xl gap-3 px-1">
            <Button variant="outline" onClick={() => setComplaintOpen(true)}>
              <AlertTriangle className="h-4 w-4" /> Report a problem
            </Button>
            <Button full onClick={() => setConfirmOpen(true)}>
              <CheckCircle2 className="h-4 w-4" /> Job Complete
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation dialog (ux.md §5.5) */}
      <Sheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Release payment?"
      >
        <p className="text-sm text-muted-foreground">
          This releases{" "}
          <span className="tabular font-semibold text-foreground">
            {npr(b.amount)}
          </span>{" "}
          to {providerName}. Are you satisfied with the work?
        </p>

        {/* Optional inline review */}
        <div className="mt-4 rounded-xl border border-border p-4">
          <p className="text-sm font-medium">Rate this job (optional)</p>
          <div className="mt-2">
            <StarRatingInput value={rating} onChange={setRating} />
          </div>
          {rating > 0 && (
            <Textarea
              className="mt-3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What went well? (optional, helps other customers)"
            />
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <Button
            variant="outline"
            full
            onClick={() => setConfirmOpen(false)}
            disabled={busy}
          >
            Not yet
          </Button>
          <Button full onClick={completeJob} disabled={busy}>
            {busy ? "Releasing…" : "Yes, release"}
          </Button>
        </div>
      </Sheet>

      {/* Complaint flow (ux.md §5.6) */}
      <Sheet
        open={complaintOpen}
        onClose={() => setComplaintOpen(false)}
        title="Report a problem"
      >
        <p className="text-sm text-muted-foreground">
          Filing a complaint pauses the escrow release while our team reviews it.
        </p>
        <div className="mt-4">
          <Label>What went wrong?</Label>
          <div className="flex flex-col gap-2">
            {COMPLAINT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setCType(t.value)}
                className={`rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  cType === t.value
                    ? "border-urgent bg-urgent-soft text-urgent"
                    : "border-border hover:bg-secondary"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="cdesc">Describe what happened</Label>
          <Textarea
            id="cdesc"
            value={cDesc}
            onChange={(e) => setCDesc(e.target.value)}
            placeholder="Give us the details so we can help (at least 20 characters)."
          />
          {cError && (
            <p className="mt-1.5 text-sm text-urgent" role="alert">
              {cError}
            </p>
          )}
        </div>
        <div className="mt-5 flex gap-3">
          <Button
            variant="outline"
            full
            onClick={() => setComplaintOpen(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            full
            onClick={submitComplaint}
            disabled={busy}
          >
            {busy ? "Filing…" : "File complaint"}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{children}</span>
    </div>
  );
}
