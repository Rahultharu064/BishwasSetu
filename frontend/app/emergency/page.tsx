"use client";

import { useEffect, useRef, useState } from "react";
import {
  Zap,
  MapPin,
  ChevronLeft,
  MessageSquare,
  Clock,
  LocateFixed,
  CheckCircle2,
} from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/language-context";
import { useToast } from "@/context/toast-context";
import type { StringKey } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import Link from "next/link";

const EMERGENCY_CATEGORIES: { slug: string; labelKey: StringKey }[] = [
  { slug: "plumbing", labelKey: "emergency.category.plumbing" },
  { slug: "electrical", labelKey: "emergency.category.electrical" },
  { slug: "ac-cooling", labelKey: "emergency.category.acCooling" },
  { slug: "appliance-repair", labelKey: "emergency.category.applianceRepair" },
  { slug: "cleaning", labelKey: "emergency.category.cleaning" },
  { slug: "carpentry", labelKey: "emergency.category.carpentry" },
];

type Stage = "category" | "confirm" | "matching" | "accepted" | "no-match";

// ── Radar Animation ───────────────────────────────────────────

function RadarAnimation({ label }: { label: string }) {
  const { tr } = useLang();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + 1), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
      <div className="relative flex h-48 w-48 items-center justify-center">
        {/* Static rings */}
        <div className="absolute inset-0 rounded-full border-2 border-urgent/15" />
        <div className="absolute inset-8 rounded-full border-2 border-urgent/20" />
        <div className="absolute inset-16 rounded-full border-2 border-urgent/30" />
        {/* Sweep */}
        <div
          className="animate-radar absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(232,84,47,0.3) 60deg, transparent 90deg)",
          }}
        />
        {/* Ping dots at ring edges — animate on each sweep */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-urgent/60"
            style={{
              top: `${20 + i * 15}%`,
              left: `${15 + i * 25}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: "1.8s",
            }}
          />
        ))}
        {/* Centre icon */}
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-urgent shadow-lg shadow-urgent/30">
          <Zap className="h-6 w-6 text-urgent-foreground" fill="currentColor" />
        </div>
      </div>
      <p className="mt-6 text-lg font-bold">{tr("emergency.stage3.finding")}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      <div className="mt-4 flex items-center gap-1.5 text-xs text-urgent">
        <Clock className="h-3.5 w-3.5" />
        <span className="tabular">{tr("emergency.stage3.searchWindow")}</span>
      </div>
      {/* animated provider count */}
      <div className="mt-6 flex gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-10 w-10 animate-pulse rounded-full bg-urgent-soft"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {count === 0
          ? tr("emergency.stage3.scanning")
          : tr("emergency.stage3.providersNotified", { count: Math.min(count * 2, 8) })}
      </p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────

export default function EmergencyPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { tr } = useLang();
  const { toast } = useToast();

  const [stage, setStage] = useState<Stage>("category");
  const [category, setCategory] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locating, setLocating] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Grab the browser's location for accurate dispatch (Nepal-bounded on the API).
  function captureLocation() {
    if (!("geolocation" in navigator)) {
      toast(tr("emergency.toast.noLocationSupport"), "error");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast(tr("emergency.toast.locationCaptured"), "success");
      },
      () => {
        setLocating(false);
        toast(tr("emergency.toast.locationFailed"), "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Poll the real dispatch status until a pro accepts or the window closes.
  useEffect(() => {
    if (stage !== "matching" || !requestId) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.getEmergencyStatus(requestId);
        if (res.status === "ACCEPTED" || res.status === "IN_PROGRESS") {
          setBookingId(res.bookingId ?? null);
          setStage("accepted");
        } else if (
          res.status === "EXPIRED" ||
          res.status === "CANCELLED" ||
          res.status === "COMPLETED"
        ) {
          setStage("no-match");
        }
      } catch {
        /* keep polling through transient errors */
      }
    }, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [stage, requestId]);

  async function dispatchEmergency() {
    if (!isAuthenticated) {
      router.push("/login?next=/emergency");
      return;
    }
    if (!category) return;
    if (!coords) {
      toast(tr("emergency.toast.needLocation"), "error");
      return;
    }
    setBusy(true);
    try {
      const res = await api.createEmergency({
        category,
        description: description.trim() || undefined,
        latitude: coords.lat,
        longitude: coords.lng,
        addressLabel: address.trim() || undefined,
      });
      setRequestId(res.id);
      setStage("matching");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : tr("emergency.toast.dispatchFailed"),
        "error"
      );
    } finally {
      setBusy(false);
    }
  }

  async function cancelDispatch() {
    if (pollRef.current) clearInterval(pollRef.current);
    if (requestId) {
      try {
        await api.cancelEmergency(requestId);
      } catch {
        /* best-effort */
      }
    }
    setRequestId(null);
    setStage("category");
    setCategory(null);
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col px-4 py-6">
      {stage !== "category" && stage !== "matching" && (
        <button
          onClick={() =>
            setStage((s) =>
              s === "confirm"
                ? "category"
                : s === "no-match"
                  ? "confirm"
                  : "category"
            )
          }
          className="mb-4 inline-flex items-center gap-1 self-start text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> {tr("emergency.back")}
        </button>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <span className="animate-urgent-pulse flex h-12 w-12 items-center justify-center rounded-full bg-urgent text-urgent-foreground shadow-lg shadow-urgent/30">
          <Zap className="h-6 w-6" fill="currentColor" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{tr("emergency.title")}</h1>
          <p className="text-sm text-muted-foreground">{tr("emergency.subtitle")}</p>
        </div>
      </div>

      {/* Stage 1 — category */}
      {stage === "category" && (
        <div>
          <h2 className="mb-3 font-semibold">{tr("emergency.stage1.heading")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {EMERGENCY_CATEGORIES.map((c) => (
              <button
                key={c.slug}
                id={`emergency-cat-${c.slug}`}
                onClick={() => {
                  setCategory(c.slug);
                  setStage("confirm");
                }}
                className="flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-urgent/60 hover:bg-urgent-soft hover:shadow-sm active:scale-95"
              >
                <CategoryIcon name={c.slug} className="h-9 w-9 text-urgent" />
                <span className="font-semibold">{tr(c.labelKey)}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {tr("emergency.stage1.note")}
          </p>
        </div>
      )}

      {/* Stage 2 — address confirm */}
      {stage === "confirm" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-urgent/20 bg-urgent-soft p-4">
            <p className="text-sm font-medium text-urgent">
              {tr("emergency.stage2.banner")}
            </p>
          </div>

          <h2 className="font-semibold">{tr("emergency.stage2.heading")}</h2>
          <div className="rounded-xl border border-border bg-card p-4">
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="h-4 w-4 text-urgent" /> {tr("emergency.stage2.addressLabel")}
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={tr("emergency.stage2.addressPlaceholder")}
              id="emergency-address-input"
            />

            <button
              type="button"
              onClick={captureLocation}
              disabled={locating}
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                coords
                  ? "border-primary/40 bg-primary-soft text-primary"
                  : "border-urgent/40 text-urgent hover:bg-urgent-soft"
              }`}
              id="emergency-locate-btn"
            >
              {coords ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> {tr("emergency.stage2.locationShared")}
                </>
              ) : (
                <>
                  <LocateFixed className="h-4 w-4" />
                  {locating
                    ? tr("emergency.stage2.gettingLocation")
                    : tr("emergency.stage2.shareLocation")}
                </>
              )}
            </button>
            <p className="mt-1.5 text-center text-xs text-muted-foreground">
              {tr("emergency.stage2.gpsNote")}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <label className="mb-1.5 block text-sm font-medium">
              {tr("emergency.stage2.describeLabel")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={tr("emergency.stage2.describePlaceholder")}
              rows={3}
              className="w-full resize-none rounded-lg bg-secondary px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              id="emergency-description-input"
            />
          </div>

          <Button
            variant="urgent"
            full
            size="lg"
            onClick={dispatchEmergency}
            disabled={busy || !coords}
            id="find-pro-now-btn"
          >
            <Zap className="h-5 w-5" fill="currentColor" />
            {busy ? tr("emergency.stage2.dispatching") : tr("emergency.stage2.findProNow")}
          </Button>
          {!coords && (
            <p className="-mt-2 text-center text-xs text-muted-foreground">
              {tr("emergency.stage2.shareToDispatch")}
            </p>
          )}
        </div>
      )}

      {/* Stage 3 — radar */}
      {stage === "matching" && (
        <>
          <RadarAnimation
            label={`${category} emergency${address ? ` · ${address}` : ""}`}
          />
          <Button
            variant="ghost"
            className="mx-auto"
            onClick={cancelDispatch}
          >
            {tr("emergency.stage3.cancel")}
          </Button>
        </>
      )}

      {/* Stage 4 — accepted */}
      {stage === "accepted" && (
        <div className="rounded-2xl border border-primary/40 bg-primary-soft p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Zap className="h-7 w-7" fill="currentColor" />
          </div>
          <p className="mt-4 text-xl font-bold text-primary">{tr("emergency.stage4.title")}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {tr("emergency.stage4.body")}
          </p>
          {bookingId ? (
            <Link href={`/bookings/${bookingId}`}>
              <Button full className="mt-5">{tr("emergency.stage4.viewBooking")}</Button>
            </Link>
          ) : (
            <Link href="/bookings">
              <Button full className="mt-5">{tr("emergency.stage4.goToBookings")}</Button>
            </Link>
          )}
        </div>
      )}

      {/* Stage 5 — no match */}
      {stage === "no-match" && (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-urgent-soft text-urgent">
            <MessageSquare className="h-6 w-6" />
          </div>
          <p className="mt-3 text-lg font-bold">{tr("emergency.stage5.title")}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {tr("emergency.stage5.body")}
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Link href={category ? `/services/${category}` : "/services"}>
              <Button variant="outline" full>
                {tr("emergency.stage5.browseInstead")}
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => {
                setStage("category");
                setCategory(null);
              }}
            >
              {tr("emergency.stage5.tryAgain")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
