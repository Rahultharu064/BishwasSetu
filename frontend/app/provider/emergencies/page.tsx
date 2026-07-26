"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Siren,
  MapPin,
  Navigation,
  Percent,
  Zap,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import type { EmergencyOffer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";

const FAST_RESPONDER_MIN = 5;

function offersFrom(data: unknown): EmergencyOffer[] {
  if (data && typeof data === "object" && "offers" in data) {
    const o = (data as { offers?: EmergencyOffer[] }).offers;
    if (Array.isArray(o)) return o;
  }
  return [];
}

/** mm:ss remaining until `iso`, or null once elapsed. */
function countdown(iso: string, now: number): string | null {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return null;
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ProviderEmergenciesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!authLoading && !isAuthenticated)
      router.replace("/login?next=/provider/emergencies");
  }, [authLoading, isAuthenticated, router]);

  // Offers expire inside a 10-minute window — poll briskly, tick every second.
  const req = useFetch(
    () => api.providerEmergencyOffers(),
    [isAuthenticated],
    { pollMs: 8000, enabled: isAuthenticated }
  );
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const offers = useMemo(
    () => offersFrom(req.data).filter((o) => countdown(o.expiresAt, now)),
    [req.data, now]
  );

  async function accept(o: EmergencyOffer) {
    setBusyId(o.requestId);
    try {
      const booking = await api.acceptEmergency(o.requestId);
      toast("Job accepted! Head over — payment is on the emergency tier.", "success");
      router.push(booking?.id ? `/bookings/${booking.id}` : "/provider/jobs");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Couldn't accept — it may be taken.",
        "error"
      );
      req.reload();
    } finally {
      setBusyId(null);
    }
  }

  async function decline(o: EmergencyOffer) {
    setBusyId(o.requestId);
    try {
      await api.declineEmergency(o.requestId);
      req.reload();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Couldn't decline.",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  }

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-6">
      <Link
        href="/provider"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Dashboard
      </Link>

      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-urgent-soft text-urgent">
          <Siren className="h-5 w-5" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Emergency jobs</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Nearby SOS requests. Accept within {FAST_RESPONDER_MIN} minutes to earn a
        Fast Responder badge — first to accept wins the job.
      </p>

      <div className="mt-5">
        {req.loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : req.error ? (
          <ErrorState message={req.error} onRetry={req.reload} />
        ) : offers.length === 0 ? (
          <EmptyState
            title="No emergencies right now"
            description="Keep your availability on — new SOS requests appear here instantly."
            icon={<Siren className="h-8 w-8" />}
          />
        ) : (
          <ul className="space-y-3">
            {offers.map((o) => {
              const left = countdown(o.expiresAt, now);
              const urgent = new Date(o.expiresAt).getTime() - now < 120_000;
              return (
                <li
                  key={o.offerId}
                  className="rounded-xl border border-urgent/30 bg-urgent-soft/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-bold capitalize">
                          {o.category}
                        </p>
                        <Badge variant="urgentSoft" size="sm">
                          <Zap className="h-3 w-3" /> Emergency
                        </Badge>
                      </div>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground">
                        <Navigation className="h-3.5 w-3.5 text-urgent" />
                        {o.distanceKm.toFixed(1)} km away
                      </p>
                    </div>
                    {left && (
                      <div
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-center ${
                          urgent
                            ? "bg-urgent text-urgent-foreground"
                            : "bg-card text-foreground"
                        }`}
                      >
                        <p className="tabular text-lg font-bold leading-none">
                          {left}
                        </p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-wide opacity-80">
                          left
                        </p>
                      </div>
                    )}
                  </div>

                  {o.addressLabel && (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {o.addressLabel}
                    </p>
                  )}
                  {o.description && (
                    <p className="mt-2 rounded-lg bg-card p-2.5 text-sm">
                      {o.description}
                    </p>
                  )}

                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Percent className="h-3 w-3" />
                    Flat {o.commissionPct}% emergency commission
                  </p>

                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={busyId === o.requestId}
                      onClick={() => decline(o)}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="urgent"
                      className="flex-1"
                      disabled={busyId === o.requestId}
                      onClick={() => accept(o)}
                    >
                      {busyId === o.requestId ? "Accepting…" : "Accept job"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
