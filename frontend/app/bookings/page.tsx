"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarCheck, Lock, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { npr, formatDateTime } from "@/lib/format";
import type { Booking } from "@/lib/types";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { EscrowStatusBar } from "@/components/escrow-status-bar";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function BookingsInner() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login?next=/bookings");
  }, [authLoading, isAuthenticated, router]);

  const { data, loading, error, reload } = useFetch<Booking[]>(
    () => api.myCustomerBookings(),
    [isAuthenticated]
  );

  const bookings = Array.isArray(data) ? data : [];
  const active = bookings.filter((b) =>
    ["REQUESTED", "ACCEPTED", "IN_PROGRESS"].includes(b.status)
  );
  const past = bookings.filter((b) =>
    ["COMPLETED", "REJECTED", "CANCELLED"].includes(b.status)
  );

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">My bookings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Track jobs and escrow status in one place.
      </p>

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-6">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No bookings yet"
            description="Find a verified pro and book your first service — protected by escrow and a 7-day guarantee."
            icon={<CalendarCheck className="h-8 w-8" />}
            action={{ label: "Browse services", onClick: () => router.push("/services") }}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {active.length > 0 && (
            <Section title="Active">
              {active.map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))}
            </Section>
          )}
          {past.length > 0 && (
            <Section title="Past">
              {past.map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const providerName =
    booking.provider?.legalName || booking.provider?.user?.name || "Provider";
  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="block rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">
            {booking.category?.name ?? "Service"}
          </p>
          <p className="text-sm text-muted-foreground">with {providerName}</p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
        {booking.scheduledAt && (
          <span>{formatDateTime(booking.scheduledAt)}</span>
        )}
        {booking.amount != null && (
          <span className="tabular inline-flex items-center gap-1 font-medium text-foreground">
            <Lock className="h-3.5 w-3.5 text-primary" />
            {npr(booking.amount)}
          </span>
        )}
      </div>

      {booking.escrowStatus && booking.escrowStatus !== "NONE" && (
        <div className="mt-4">
          <EscrowStatusBar status={booking.escrowStatus} />
        </div>
      )}

      <div className="mt-3 flex items-center justify-end text-sm font-medium text-primary">
        View details <ChevronRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={null}>
      <BookingsInner />
    </Suspense>
  );
}
