"use client";

import { useEffect, useState } from "react";
import { Zap, MapPin, ChevronLeft, MessageSquare, Clock } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

const EMERGENCY_CATEGORIES = [
  { slug: "plumbing", label: "Plumbing" },
  { slug: "electrical", label: "Electrical" },
  { slug: "ac-cooling", label: "AC / Cooling" },
  { slug: "appliance-repair", label: "Appliance" },
  { slug: "cleaning", label: "Cleaning" },
  { slug: "carpentry", label: "Carpentry" },
];

type Stage = "category" | "confirm" | "matching" | "accepted" | "no-match";

// ── Radar Animation ───────────────────────────────────────────

function RadarAnimation({ label }: { label: string }) {
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
      <p className="mt-6 text-lg font-bold">Finding your nearest verified pro…</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      <div className="mt-4 flex items-center gap-1.5 text-xs text-urgent">
        <Clock className="h-3.5 w-3.5" />
        <span className="tabular">Searching within 10km · up to 10 min</span>
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
        {count === 0 ? "Scanning area…" : `${Math.min(count * 2, 8)} providers notified`}
      </p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────

export default function EmergencyPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [stage, setStage] = useState<Stage>("category");
  const [category, setCategory] = useState<string | null>(null);
  const [address, setAddress] = useState("Maharajgunj, Kathmandu");
  const [description, setDescription] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Auto-expire matching screen after 10 min
  useEffect(() => {
    if (stage !== "matching") return;
    const id = setTimeout(() => setStage("no-match"), 10 * 60 * 1000);
    return () => clearTimeout(id);
  }, [stage]);

  // Poll for acceptance
  useEffect(() => {
    if (stage !== "matching" || !requestId) return;
    const poll = setInterval(async () => {
      try {
        const res = await api.bookingById(requestId); // reuse booking fetch for status
        if (res?.status === "ACCEPTED" || res?.status === "IN_PROGRESS") {
          setStage("accepted");
          clearInterval(poll);
        }
      } catch {
        /* ignore poll errors */
      }
    }, 5000);
    return () => clearInterval(poll);
  }, [stage, requestId]);

  async function dispatchEmergency() {
    if (!isAuthenticated) {
      router.push("/login?next=/emergency");
      return;
    }
    setBusy(true);
    try {
      // In real wiring: call POST /emergency with category, lat/lng etc.
      // For now we simulate success
      await new Promise((r) => setTimeout(r, 800));
      setStage("matching");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not dispatch. Try again.", "error");
    } finally {
      setBusy(false);
    }
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
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <span className="animate-urgent-pulse flex h-12 w-12 items-center justify-center rounded-full bg-urgent text-urgent-foreground shadow-lg shadow-urgent/30">
          <Zap className="h-6 w-6" fill="currentColor" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Emergency Dispatch</h1>
          <p className="text-sm text-muted-foreground">
            Nearest verified pro · 12% priority fee · Tier 2+ only
          </p>
        </div>
      </div>

      {/* Stage 1 — category */}
      {stage === "category" && (
        <div>
          <h2 className="mb-3 font-semibold">What&apos;s the emergency?</h2>
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
                <span className="font-semibold">{c.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Only Tier 2+ verified providers · 12% emergency fee applies
          </p>
        </div>
      )}

      {/* Stage 2 — address confirm */}
      {stage === "confirm" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-urgent/20 bg-urgent-soft p-4">
            <p className="text-sm font-medium text-urgent">
              ⚡ Emergency mode — a 12% priority fee is added. Providers who accept within 5 min
              earn a Fast Responder badge.
            </p>
          </div>

          <h2 className="font-semibold">Confirm your location</h2>
          <div className="rounded-xl border border-border bg-card p-4">
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="h-4 w-4 text-urgent" /> Service address
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your current address"
              id="emergency-address-input"
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <label className="mb-1.5 block text-sm font-medium">
              Describe the problem (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Water pipe burst in bathroom, need urgent fix"
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
            disabled={busy}
            id="find-pro-now-btn"
          >
            <Zap className="h-5 w-5" fill="currentColor" />
            {busy ? "Dispatching…" : "Find me a pro now"}
          </Button>
        </div>
      )}

      {/* Stage 3 — radar */}
      {stage === "matching" && (
        <RadarAnimation
          label={`${category} emergency · ${address}`}
        />
      )}

      {/* Stage 4 — accepted */}
      {stage === "accepted" && (
        <div className="rounded-2xl border border-primary/40 bg-primary-soft p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Zap className="h-7 w-7" fill="currentColor" />
          </div>
          <p className="mt-4 text-xl font-bold text-primary">Pro on the way! 🎉</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            A verified provider has accepted your emergency request and is heading your
            way. You&apos;ll receive an SMS confirmation shortly.
          </p>
          {requestId && (
            <Link href={`/bookings/${requestId}`}>
              <Button full className="mt-5">View booking details</Button>
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
          <p className="mt-3 text-lg font-bold">No pros available right now</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            We&apos;ve queued your request and will SMS you the moment a verified provider
            accepts. No charge until one is on the way.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Link href={category ? `/services/${category}` : "/services"}>
              <Button variant="outline" full>
                Browse scheduled bookings instead
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => {
                setStage("category");
                setCategory(null);
              }}
            >
              Try again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
