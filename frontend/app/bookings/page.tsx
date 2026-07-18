"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarX2 } from "lucide-react";
import { PageSpinner } from "@/components/ui/spinner";
import { EmptyState, ErrorBanner } from "@/components/shared/states";
import { BookingCard } from "@/components/shared/booking-card";
import { Button } from "@/components/ui/button";
import { BookingApi } from "@/lib/endpoints";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const FILTERS = [
  { label: "All", value: undefined },
  { label: "Requested", value: "REQUESTED" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
] as const;

export default function BookingsPage() {
  const { user, bootstrapping } = useAuth();
  const router = useRouter();
  const [status, setStatus] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (!bootstrapping && !user) router.replace("/login?next=/bookings");
  }, [bootstrapping, user, router]);

  const isProvider = user?.role === "PROVIDER";

  const { data, loading, error, refetch } = useFetch(
    () =>
      !user
        ? Promise.resolve(null)
        : isProvider
        ? BookingApi.myProviderBookings({ status, limit: 30 })
        : BookingApi.myCustomerBookings({ status, limit: 30 }),
    [user, isProvider, status]
  );

  if (bootstrapping || !user) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My bookings</h1>
        {!isProvider && (
          <Link href="/services">
            <Button size="sm">Book a service</Button>
          </Link>
        )}
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setStatus(f.value)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              status === f.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <PageSpinner />
        ) : error ? (
          <ErrorBanner message={error} onRetry={refetch} />
        ) : !data?.bookings?.length ? (
          <EmptyState
            icon={CalendarX2}
            title="No bookings yet"
            description={
              isProvider
                ? "Accepted and completed jobs will show up here."
                : "Once you book a verified provider, you'll track it here."
            }
            action={
              !isProvider && (
                <Link href="/services">
                  <Button size="sm">Browse services</Button>
                </Link>
              )
            }
          />
        ) : (
          <div className="space-y-3">
            {data.bookings.map((b) => (
              <BookingCard key={b.id} booking={b} perspective={isProvider ? "provider" : "customer"} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
