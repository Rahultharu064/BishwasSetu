"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useToast } from "@/context/toast-context";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/language-context";
import { npr, formatDateTime } from "@/lib/format";
import type { Booking } from "@/lib/types";
import type { StringKey } from "@/lib/i18n";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { EscrowStatusBar } from "@/components/escrow-status-bar";
import { EscrowPaymentCard } from "@/components/escrow-payment-card";
import { BookingLifecycle } from "@/components/booking-lifecycle";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { StarRatingInput } from "@/components/ui/star-rating";
import { Textarea, Label } from "@/components/ui/input";

const COMPLAINT_TYPES: { value: string; labelKey: StringKey }[] = [
  { value: "SERVICE_QUALITY", labelKey: "bookings.detail.complaintType.SERVICE_QUALITY" },
  { value: "NO_SHOW", labelKey: "bookings.detail.complaintType.NO_SHOW" },
  { value: "OVERCHARGING", labelKey: "bookings.detail.complaintType.OVERCHARGING" },
  { value: "ABUSIVE_BEHAVIOR", labelKey: "bookings.detail.complaintType.ABUSIVE_BEHAVIOR" },
  { value: "FRAUD", labelKey: "bookings.detail.complaintType.FRAUD" },
];

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { toast } = useToast();
  const [active, setActive] = useState(false);
  const { user } = useAuth();
  const { tr } = useLang();
  const { data, loading, error, reload } = useFetch<Booking>(
    () => api.bookingById(id),
    [id],
    { pollMs: 12000, enabled: active }
  );
  const viewerRole: "CUSTOMER" | "PROVIDER" =
    user?.role === "PROVIDER" ? "PROVIDER" : "CUSTOMER";

  // Poll while the booking is live so status updates arrive without a refresh.
  // `active` deliberately lags one render behind `data` — it gates the same
  // useFetch call that produces `data`, so it can't be derived inline without
  // creating a circular read (this render's poll `enabled` would depend on
  // this render's own fetch result).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(
      !!data &&
        ["REQUESTED", "ACCEPTED", "IN_PROGRESS"].includes(data.status)
    );
  }, [data]);

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
      if (b.escrow?.status === "HELD") {
        // Real escrow-paid booking — release via the dedicated endpoint so
        // the payout split, 7-day guarantee and notifications actually fire.
        const gps = await getBestEffortLocation();
        await api.releaseEscrow(b.escrow.id, gps);
      } else {
        // Cash / no-escrow booking — plain status flip.
        await api.updateBookingStatus(id, "COMPLETED");
      }
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
      toast(tr("bookings.detail.toastReleased"), "success");
      setConfirmOpen(false);
      reload();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : tr("bookings.detail.errUpdateFailed"), "error");
    } finally {
      setBusy(false);
    }
  }

  async function submitComplaint() {
    if (cDesc.trim().length < 20) {
      setCError(tr("bookings.detail.errComplaintLen"));
      return;
    }
    setCError(null);
    setBusy(true);
    try {
      await api.createComplaint({ bookingId: id, type: cType, description: cDesc.trim() });
      toast(tr("bookings.detail.toastComplaintFiled"), "success");
      setComplaintOpen(false);
      setCDesc("");
      reload();
    } catch (err) {
      setCError(err instanceof ApiError ? err.message : tr("bookings.detail.errComplaintFailed"));
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
        <ErrorState message={error ?? tr("bookings.detail.bookingNotFound")} onRetry={reload} />
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
        <ChevronLeft className="h-4 w-4" /> {tr("bookings.detail.backToBookings")}
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {b.category?.name ?? tr("bookings.serviceFallback")}
        </h1>
        <BookingStatusBadge status={b.status} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {tr("bookings.detail.bookingId", { id: b.id.slice(0, 8) })}
      </p>

      {/* Live status timeline */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">{tr("bookings.detail.liveStatus")}</h2>
          {active && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              {tr("bookings.detail.live")}
            </span>
          )}
        </div>
        <BookingLifecycle status={b.status} />
      </div>

      {/* Escrow Payment Card */}
      {b.amount != null && b.amount > 0 && (
        <div className="mt-6">
          <EscrowPaymentCard
            amountNpr={b.amount}
            escrowStatus={b.escrowStatus}
            isEmergency={false}
            viewerRole={viewerRole}
            onPayNow={async (gateway) => {
              try {
                const returnUrl = `${window.location.origin}/bookings/${b.id}/payment-return`;
                const result = await api.initiateEscrow({
                  bookingId: b.id,
                  gateway,
                  returnUrl,
                });
                if (gateway === "ESEWA" && result.formFields) {
                  // eSewa ePay v2 requires a signed POST form submit.
                  const form = document.createElement("form");
                  form.method = "POST";
                  form.action = result.paymentUrl;
                  for (const [key, value] of Object.entries(result.formFields)) {
                    const input = document.createElement("input");
                    input.type = "hidden";
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                  }
                  document.body.appendChild(form);
                  form.submit();
                } else {
                  window.location.href = result.paymentUrl;
                }
              } catch (err) {
                toast(err instanceof ApiError ? err.message : tr("bookings.detail.errPaymentFailed"), "error");
              }
            }}
            onReleaseFunds={completeJob}
          />
        </div>
      )}

      {/* Escrow status (legacy bar — shown when no amount) */}
      {b.escrowStatus !== "NONE" && (b.amount == null || b.amount === 0) && (
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold">
            <Lock className="h-4 w-4 text-primary" /> {tr("bookings.detail.escrowStatus")}
          </h2>
          <EscrowStatusBar status={b.escrowStatus} />
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
              {tr("bookings.detail.viewProfile")}
            </Link>
          )}
        </div>
        {["ACCEPTED", "IN_PROGRESS", "COMPLETED"].includes(b.status) && (
          <Link href={`/messages/${b.id}`}>
            <Button variant="soft" size="sm">
              <MessageCircle className="h-4 w-4" /> {tr("bookings.detail.message")}
            </Button>
          </Link>
        )}
      </div>

      {/* Details */}
      <div className="mt-5 space-y-3 rounded-xl border border-border bg-card p-4 text-sm">
        {b.scheduledAt && (
          <Row label={tr("bookings.detail.scheduled")}>{formatDateTime(b.scheduledAt)}</Row>
        )}
        {b.address && (
          <Row label={tr("bookings.detail.address")}>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {b.address}
            </span>
          </Row>
        )}
        {b.notes && <Row label={tr("bookings.detail.notes")}>{b.notes}</Row>}
      </div>

      {/* Guarantee */}
      <div className="mt-5 flex items-center gap-3 rounded-xl bg-primary-soft p-4">
        <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-foreground">
          {tr("bookings.detail.guaranteeText")}
        </p>
      </div>

      {/* Actions */}
      {canComplete && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-background/95 p-3 backdrop-blur md:bottom-0">
          <div className="mx-auto flex max-w-2xl gap-3 px-1">
            <Button variant="outline" onClick={() => setComplaintOpen(true)}>
              <AlertTriangle className="h-4 w-4" /> {tr("bookings.detail.reportProblem")}
            </Button>
            <Button full onClick={() => setConfirmOpen(true)}>
              <CheckCircle2 className="h-4 w-4" /> {tr("bookings.detail.jobComplete")}
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation dialog (ux.md §5.5) */}
      <Sheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={tr("bookings.detail.releaseTitle")}
      >
        <p className="text-sm text-muted-foreground">
          {tr("bookings.detail.releaseBody", { amount: npr(b.amount), name: providerName })}
        </p>

        {/* Optional inline review */}
        <div className="mt-4 rounded-xl border border-border p-4">
          <p className="text-sm font-medium">{tr("bookings.detail.rateJob")}</p>
          <div className="mt-2">
            <StarRatingInput value={rating} onChange={setRating} />
          </div>
          {rating > 0 && (
            <Textarea
              className="mt-3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={tr("bookings.detail.reviewPlaceholder")}
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
            {tr("bookings.detail.notYet")}
          </Button>
          <Button full onClick={completeJob} disabled={busy}>
            {busy ? tr("bookings.detail.releasing") : tr("bookings.detail.yesRelease")}
          </Button>
        </div>
      </Sheet>

      {/* Complaint flow (ux.md §5.6) */}
      <Sheet
        open={complaintOpen}
        onClose={() => setComplaintOpen(false)}
        title={tr("bookings.detail.reportProblem")}
      >
        <p className="text-sm text-muted-foreground">
          {tr("bookings.detail.complaintIntro")}
        </p>
        <div className="mt-4">
          <Label>{tr("bookings.detail.whatWentWrong")}</Label>
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
                {tr(t.labelKey)}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="cdesc">{tr("bookings.detail.describeWhatHappened")}</Label>
          <Textarea
            id="cdesc"
            value={cDesc}
            onChange={(e) => setCDesc(e.target.value)}
            placeholder={tr("bookings.detail.describePlaceholder")}
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
            {tr("bookings.detail.cancel")}
          </Button>
          <Button
            variant="destructive"
            full
            onClick={submitComplaint}
            disabled={busy}
          >
            {busy ? tr("bookings.detail.filing") : tr("bookings.detail.fileComplaint")}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

/** Best-effort GPS for neighborhood tagging — never blocks or fails the release. */
function getBestEffortLocation(): Promise<{ latitude: number; longitude: number } | undefined> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(undefined);
      return;
    }
    const timeout = setTimeout(() => resolve(undefined), 3000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeout);
        resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      () => {
        clearTimeout(timeout);
        resolve(undefined);
      },
      { timeout: 3000 }
    );
  });
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
