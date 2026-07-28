"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Briefcase,
  MapPin,
  CalendarClock,
  Clock,
  Hourglass,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { npr, formatDateTime, relativeTime } from "@/lib/format";
import type { Booking, ProviderBookingsResponse } from "@/lib/types";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Textarea, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";

const FILTERS = [
  { value: "", label: "All" },
  { value: "REQUESTED", label: "New requests" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "IN_PROGRESS", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
];

const LIVE_STATES = ["REQUESTED", "ACCEPTED", "IN_PROGRESS"];

function bookingsFrom(data: unknown): ProviderBookingsResponse {
  const empty: ProviderBookingsResponse = {
    bookings: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
  };
  if (data && typeof data === "object" && "bookings" in data)
    return data as ProviderBookingsResponse;
  return empty;
}

export default function ProviderJobsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [status, setStatus] = useState("");
  const [live, setLive] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [declining, setDeclining] = useState<Booking | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated)
      router.replace("/login?next=/provider/jobs");
  }, [authLoading, isAuthenticated, router]);

  const req = useFetch(
    () => api.providerBookings({ status: status || undefined, limit: 20 }),
    [status, isAuthenticated],
    { pollMs: 15000, enabled: live }
  );
  const { bookings } = useMemo(() => bookingsFrom(req.data), [req.data]);

  // Keep polling only while at least one job is still in flight. `live` gates
  // the same useFetch call that produces `bookings`, so it can't be derived
  // inline without a circular read — it deliberately lags one render behind.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLive(bookings.some((b) => LIVE_STATES.includes(b.status)));
  }, [bookings]);

  async function advance(b: Booking, next: string, cancelReason?: string) {
    setBusyId(b.id);
    try {
      await api.updateBookingStatus(b.id, next, cancelReason);
      const msg: Record<string, string> = {
        ACCEPTED: "Job accepted — the customer can now pay into escrow.",
        REJECTED: "Request declined.",
        IN_PROGRESS: "Job started. Good luck!",
      };
      toast(msg[next] ?? "Updated.", "success");
      setDeclining(null);
      setReason("");
      req.reload();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Couldn't update the job.",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  }

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6">
      <Link
        href="/provider"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My jobs</h1>
        {live && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Live
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Accept new requests fast — response time feeds your trust score.
      </p>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            onClick={() => setStatus(f.value)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium ${
              status === f.value
                ? "border-primary bg-primary-soft text-primary"
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {req.loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : req.error ? (
          <ErrorState message={req.error} onRetry={req.reload} />
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No jobs here yet"
            description="New booking requests will show up the moment a customer books you."
            icon={<Briefcase className="h-8 w-8" />}
          />
        ) : (
          <ul className="space-y-3">
            {bookings.map((b) => {
              const customerName = b.customer?.name ?? "Customer";
              const isRequest = b.status === "REQUESTED";
              const isAccepted = b.status === "ACCEPTED";
              const isActive = b.status === "IN_PROGRESS";
              return (
                <li
                  key={b.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={customerName} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">
                          {b.category?.name ?? "Service"}
                        </p>
                        <BookingStatusBadge status={b.status} />
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {customerName} · {relativeTime(b.createdAt)}
                      </p>

                      <div className="mt-2 space-y-1 text-sm text-foreground">
                        {b.scheduledAt && (
                          <p className="flex items-center gap-1.5 text-muted-foreground">
                            <CalendarClock className="h-3.5 w-3.5" />
                            {formatDateTime(b.scheduledAt)}
                          </p>
                        )}
                        {b.address && (
                          <p className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {b.address}
                          </p>
                        )}
                      </div>

                      {b.notes && (
                        <p className="mt-2 rounded-lg bg-secondary p-2.5 text-sm">
                          {b.notes}
                        </p>
                      )}
                    </div>
                    {b.amount != null && (
                      <div className="shrink-0 text-right">
                        <p className="tabular font-bold">{npr(b.amount)}</p>
                        <p className="text-xs text-muted-foreground">quoted</p>
                      </div>
                    )}
                  </div>

                  {/* Status-driven actions */}
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    {isRequest && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === b.id}
                          onClick={() => {
                            setDeclining(b);
                            setReason("");
                          }}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          disabled={busyId === b.id}
                          onClick={() => advance(b, "ACCEPTED")}
                        >
                          {busyId === b.id ? "…" : "Accept job"}
                        </Button>
                      </>
                    )}
                    {isAccepted &&
                      (b.escrowStatus === "HELD" ? (
                        <Button
                          size="sm"
                          disabled={busyId === b.id}
                          onClick={() => advance(b, "IN_PROGRESS")}
                        >
                          {busyId === b.id ? "…" : "Start job"}
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Hourglass className="h-3.5 w-3.5" />
                          Waiting for customer payment
                        </span>
                      ))}
                    {isActive && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Awaiting customer confirmation to release payment
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Decline reason sheet */}
      <Sheet
        open={!!declining}
        onClose={() => setDeclining(null)}
        title="Decline this request?"
      >
        {declining && (
          <>
            <p className="text-sm text-muted-foreground">
              A short reason is shared with the customer and helps us route
              future requests better.
            </p>
            <div className="mt-4">
              <Label htmlFor="decline-reason">Reason</Label>
              <Textarea
                id="decline-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. I'm fully booked on that date."
              />
            </div>
            <Button
              full
              className="mt-5"
              disabled={busyId === declining.id || reason.trim().length < 5}
              onClick={() => advance(declining, "REJECTED", reason.trim())}
            >
              {busyId === declining.id ? "Saving…" : "Confirm decline"}
            </Button>
          </>
        )}
      </Sheet>
    </div>
  );
}
