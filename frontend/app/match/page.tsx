"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  MapPin,
  LocateFixed,
  Star,
  ShieldCheck,
  Crown,
  ArrowRight,
  Navigation,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import type { Category, SmartMatchResult, SmartMatchProvider } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { TrustScoreRing } from "@/components/trust-score-ring";
import { EmptyState, ErrorState } from "@/components/ui/states";

function MatchInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const initialCategory = params.get("category") ?? "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState(initialCategory);
  const [description, setDescription] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const [result, setResult] = useState<SmartMatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Gate to authenticated customers.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login?next=/match");
  }, [authLoading, isAuthenticated, router]);

  // Prefill saved profile location once the auth context resolves (arrives
  // asynchronously after mount) — the functional updater keeps this a no-op
  // once the user has typed their own value.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user?.district) setDistrict((d) => d || user.district!);
    if (user?.city) setCity((c) => c || user.city!);
  }, [user]);

  // Load categories for the picker.
  useEffect(() => {
    api
      .categories()
      .then((c) => setCategories(c ?? []))
      .catch(() => setCategories([]));
  }, []);

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      toast("Location isn't available on this device.", "error");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocating(false);
        toast("Location on — we'll rank by real distance.", "success");
      },
      () => {
        setLocating(false);
        toast("Couldn't get location. We'll match by district instead.", "error");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function run(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!category) e.category = "Choose the service you need.";
    if (!coords && district.trim().length < 2 && city.trim().length < 2)
      e.location = "Add your district/city or share your location.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.smartMatch({
        category,
        description: description.trim() || undefined,
        district: district.trim() || undefined,
        city: city.trim() || undefined,
        latitude: coords?.lat,
        longitude: coords?.lon,
      });
      setResult(res);
      if (!res.providers.length)
        toast("No verified pros in range yet — try a wider area.", "info");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Matching failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const top = result?.providers[0];
  const rest = useMemo(() => result?.providers.slice(1) ?? [], [result]);

  if (authLoading || !isAuthenticated)
    return (
      <div className="mx-auto max-w-lg px-4 py-10 text-center text-muted-foreground">
        Loading…
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" /> AI Smart Match
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          Find the nearest right pro
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We rank verified providers by real distance and trust, then let AI
          pick the best fit for your job.
        </p>
      </div>

      {/* ── Request form ─────────────────────────────── */}
      <form onSubmit={run} className="space-y-4 rounded-2xl border border-border bg-card p-4">
        <div>
          <Label htmlFor="category">Service needed</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
          >
            <option value="">Choose a service…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <FieldError>{errors.category}</FieldError>
        </div>

        <div>
          <Label htmlFor="desc">Describe the job (optional)</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Kitchen tap leaking, needs a same-day fix."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="district">District</Label>
            <Input
              id="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Kathmandu"
            />
          </div>
          <div>
            <Label htmlFor="city">City / Town</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Maharajgunj"
            />
          </div>
        </div>
        <FieldError>{errors.location}</FieldError>

        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-60"
        >
          <LocateFixed className="h-4 w-4" />
          {coords ? "Using your location ✓" : locating ? "Locating…" : "Use my current location"}
        </button>

        <Button type="submit" full size="lg" disabled={loading}>
          <Sparkles className="h-4 w-4" />
          {loading ? "Matching…" : "Match me with a pro"}
        </Button>
      </form>

      {/* ── Results ──────────────────────────────────── */}
      <div className="mt-6">
        {error ? (
          <ErrorState message={error} onRetry={() => setResult(null)} />
        ) : result ? (
          result.providers.length ? (
            <div className="space-y-4">
              {result.match.aiEnabled && result.match.aiReason && top && (
                <div className="rounded-2xl border border-primary/30 bg-primary-soft/50 p-4">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <Sparkles className="h-4 w-4" /> AI recommends
                  </div>
                  <p className="mt-1 text-sm text-foreground">{result.match.aiReason}</p>
                </div>
              )}

              {top && <MatchCard provider={top} highlight />}

              {rest.length > 0 && (
                <>
                  <p className="pt-1 text-sm font-medium text-muted-foreground">
                    Other nearby pros
                  </p>
                  <div className="space-y-3">
                    {rest.map((p) => (
                      <MatchCard key={p.id} provider={p} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <EmptyState
              title="No verified pros in range yet"
              description="Try a wider district or a different service — the network is still growing in your area."
            />
          )
        ) : (
          <p className="px-1 text-center text-xs text-muted-foreground">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
            Priority partners are shown first, but never a far or lower-trust pro
            over a clearly better one.
          </p>
        )}
      </div>
    </div>
  );
}

// ── One matched provider ────────────────────────────────────────
function MatchCard({
  provider,
  highlight,
}: {
  provider: SmartMatchProvider;
  highlight?: boolean;
}) {
  const name = provider.legalName || "Provider";
  return (
    <div
      className={`rounded-2xl border bg-card p-4 shadow-sm ${
        highlight ? "border-primary/40 ring-1 ring-primary-soft" : "border-border"
      }`}
    >
      <div className="flex gap-4">
        <Avatar src={provider.profilePhoto} name={name} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {highlight && (
                  <Badge variant="primary" size="sm">
                    <Sparkles className="h-3 w-3" /> Best match
                  </Badge>
                )}
                {provider.isPriorityPartner && (
                  <Badge variant="skilled" size="sm">
                    <Crown className="h-3 w-3" /> Priority partner
                  </Badge>
                )}
              </div>
              <p className="mt-1 truncate font-semibold text-foreground">{name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {provider.distanceKm != null && (
                  <span className="inline-flex items-center gap-1">
                    <Navigation className="h-3.5 w-3.5" />
                    {provider.distanceKm} km away
                  </span>
                )}
                {(provider.serviceArea || provider.city) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {[provider.serviceArea, provider.city].filter(Boolean).join(", ")}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  {provider.completedBookings} jobs done
                </span>
              </div>
            </div>
            <TrustScoreRing score={provider.trustScore} size={48} stroke={4} />
          </div>

          {provider.skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {provider.skills.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <Link href={`/providers/${provider.id}/book`} className="flex-1">
              <Button full size="sm">
                Book this pro <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/providers/${provider.id}`}>
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatchPage() {
  return (
    <Suspense fallback={null}>
      <MatchInner />
    </Suspense>
  );
}
