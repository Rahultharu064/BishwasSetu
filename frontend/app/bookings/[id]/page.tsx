"use client";

import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, CalendarClock, MapPin, Zap, ShieldCheck } from "lucide-react";
import { PageSpinner } from "@/components/ui/spinner";
import { ErrorBanner } from "@/components/shared/states";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";
import { BookingStatusBadge, EscrowStatusBadge } from "@/components/shared/status-badge";
import { ReviewForm } from "@/components/shared/review-form";
import { BookingApi } from "@/lib/endpoints";
import { API_BASE_URL, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/lib/auth-context";
import { formatDateTime, formatNpr } from "@/lib/utils";
import { submitEsewaForm } from "@/lib/esewa-submit";

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, bootstrapping } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!bootstrapping && !user) router.replace(`/login?next=/bookings/${id}`);
  }, [bootstrapping, user, id, router]);

  const { data: booking, loading, error, refetch } = useFetch(
    () => (user ? BookingApi.get(id) : Promise.resolve(null)),
    [user, id]
  );

  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [cancelReason, setCancelReason] = React.useState("");
  const [showCancelForm, setShowCancelForm] = React.useState(false);
  const [reviewSubmitted, setReviewSubmitted] = React.useState(false);

  if (bootstrapping || loading || !user) return <PageSpinner />;
  if (error || !booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <ErrorBanner message={error ?? "Booking not found."} onRetry={refetch} />
      </div>
    );
  }

  const isProvider = user.role === "PROVIDER";
  const perspectiveName = isProvider ? booking.customer?.name : booking.provider?.legalName;

  async function runAction(key: string, fn: () => Promise<unknown>) {
    setActionError(null);
    setActionLoading(key);
    try {
      await fn();
      refetch();
      setShowCancelForm(false);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "That action couldn't be completed.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handlePay(method: "KHALTI" | "ESEWA") {
    setActionError(null);
    setActionLoading("pay");
    try {
      const returnUrl =
        method === "KHALTI" ? `${API_BASE_URL}/payments/khalti/return` : `${API_BASE_URL}/payments/esewa/success`;
      const result = await BookingApi.pay(id, { paymentMethod: method, returnUrl });
      if (method === "KHALTI" && result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else if (method === "ESEWA" && result.esewaUrl && result.esewaParams) {
        submitEsewaForm(result.esewaUrl, result.esewaParams);
      }
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not start payment.");
      setActionLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/bookings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> All bookings
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{booking.category?.name ?? "Booking"}</h1>
        <BookingStatusBadge status={booking.status} />
      </div>

      {actionError && <ErrorBanner message={actionError} />}

      <Card className="mt-5">
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-center gap-3">
            <Avatar name={perspectiveName} size="lg" />
            <div>
              <p className="text-xs text-muted-foreground">{isProvider ? "Customer" : "Provider"}</p>
              <p className="font-semibold">{perspectiveName ?? "—"}</p>
            </div>
          </div>

          <div className="grid gap-3 border-t border-border pt-5 text-sm sm:grid-cols-2">
            <Detail icon={CalendarClock} label="Scheduled" value={formatDateTime(booking.scheduledAt)} />
            {booking.neighborhood && <Detail icon={MapPin} label="Area" value={booking.neighborhood} />}
            {booking.isEmergency && <Detail icon={Zap} label="Priority" value="Emergency request" />}
            <Detail icon={ShieldCheck} label="Payment" value={<EscrowStatusBadge status={booking.escrowStatus} />} />
          </div>

          <div className="border-t border-border pt-5">
            <p className="text-xs font-medium text-muted-foreground">Job description</p>
            <p className="mt-1.5 text-sm">{booking.description}</p>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-5">
            <span className="text-sm text-muted-foreground">Agreed price</span>
            <span className="text-lg font-bold">{formatNpr(booking.priceNpr)}</span>
          </div>

          {booking.cancelReason && (
            <p className="rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
              Cancelled: {booking.cancelReason}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Provider actions ───────────────────────────────── */}
      {isProvider && booking.status === "REQUESTED" && (
        <div className="mt-6 space-y-3">
          <Button
            className="w-full"
            size="lg"
            loading={actionLoading === "accept"}
            onClick={() => runAction("accept", () => BookingApi.updateStatus(id, { status: "ACCEPTED" }))}
          >
            Accept booking
          </Button>
          {!showCancelForm ? (
            <Button variant="outline" className="w-full" onClick={() => setShowCancelForm(true)}>
              Decline
            </Button>
          ) : (
            <CancelForm
              label="Reason for declining"
              value={cancelReason}
              onChange={setCancelReason}
              loading={actionLoading === "reject"}
              onCancel={() => setShowCancelForm(false)}
              onSubmit={() =>
                runAction("reject", () =>
                  BookingApi.updateStatus(id, { status: "REJECTED", cancelReason: cancelReason })
                )
              }
            />
          )}
        </div>
      )}

      {isProvider && booking.status === "ACCEPTED" && (
        <div className="mt-6 space-y-3">
          <Button
            className="w-full"
            size="lg"
            loading={actionLoading === "in_progress"}
            onClick={() => runAction("in_progress", () => BookingApi.updateStatus(id, { status: "IN_PROGRESS" }))}
          >
            Start job
          </Button>
          <Button
            variant="outline"
            className="w-full"
            loading={actionLoading === "complete"}
            onClick={() => runAction("complete", () => BookingApi.updateStatus(id, { status: "COMPLETED" }))}
          >
            Mark job complete
          </Button>
        </div>
      )}

      {isProvider && booking.status === "IN_PROGRESS" && (
        <Button
          className="mt-6 w-full"
          size="lg"
          loading={actionLoading === "complete"}
          onClick={() => runAction("complete", () => BookingApi.updateStatus(id, { status: "COMPLETED" }))}
        >
          Mark job complete
        </Button>
      )}

      {/* ── Customer actions ───────────────────────────────── */}
      {!isProvider && booking.status === "REQUESTED" && (
        <div className="mt-6">
          {!showCancelForm ? (
            <Button variant="outline" className="w-full" onClick={() => setShowCancelForm(true)}>
              Cancel request
            </Button>
          ) : (
            <CancelForm
              label="Reason for cancelling"
              value={cancelReason}
              onChange={setCancelReason}
              loading={actionLoading === "cancel"}
              onCancel={() => setShowCancelForm(false)}
              onSubmit={() =>
                runAction("cancel", () =>
                  BookingApi.updateStatus(id, { status: "CANCELLED", cancelReason: cancelReason })
                )
              }
            />
          )}
        </div>
      )}

      {!isProvider &&
        booking.status === "ACCEPTED" &&
        booking.paymentMethod !== "CASH" &&
        booking.escrowStatus !== "HELD" &&
        booking.escrowStatus !== "RELEASED" && (
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardContent className="space-y-3 pt-6">
              <p className="text-sm font-medium">Pay now to confirm your booking</p>
              <p className="text-xs text-muted-foreground">
                Funds are held in escrow and only released to the provider once you tap &ldquo;Job
                complete.&rdquo;
              </p>
              <div className="flex gap-2">
                <Button className="flex-1" loading={actionLoading === "pay"} onClick={() => handlePay("KHALTI")}>
                  Pay with Khalti
                </Button>
                <Button variant="outline" className="flex-1" loading={actionLoading === "pay"} onClick={() => handlePay("ESEWA")}>
                  Pay with eSewa
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      {!isProvider && booking.status === "IN_PROGRESS" && booking.escrowStatus === "HELD" && (
        <Button
          className="mt-6 w-full"
          size="lg"
          loading={actionLoading === "complete"}
          onClick={() => runAction("complete", () => BookingApi.updateStatus(id, { status: "COMPLETED" }))}
        >
          Confirm job complete &amp; release payment
        </Button>
      )}

      {!isProvider && booking.status === "COMPLETED" && !reviewSubmitted && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="mb-4 text-sm font-medium">Leave a review</p>
            <ReviewForm bookingId={id} onSubmitted={() => setReviewSubmitted(true)} />
          </CardContent>
        </Card>
      )}

      {!isProvider && booking.status === "COMPLETED" && reviewSubmitted && (
        <p className="mt-6 rounded-xl bg-success/10 px-4 py-3 text-center text-sm text-success">
          Thanks for your review!
        </p>
      )}
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

function CancelForm({
  label,
  value,
  onChange,
  onSubmit,
  onCancel,
  loading,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <Card className="p-4">
      <Label htmlFor="reason">{label}</Label>
      <Textarea id="reason" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Let them know why…" />
      <div className="mt-3 flex gap-2">
        <Button variant="destructive" size="sm" loading={loading} disabled={!value.trim()} onClick={onSubmit}>
          Confirm
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Never mind
        </Button>
      </div>
    </Card>
  );
}
