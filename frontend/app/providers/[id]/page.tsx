"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  MapPin,
  Star,
  ShieldCheck,
  Lock,
  Info,
  BadgeCheck,
  Briefcase,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { relativeTime } from "@/lib/format";
import type { Provider, Review } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { TrustScoreRing } from "@/components/trust-score-ring";
import { TierBadge, ExperienceBadge, FastResponderChip, TrustBadge } from "@/components/badges";
import type { TrustBadgeType } from "@/lib/types";
import { TrustBreakdownSheet } from "@/components/trust-breakdown-sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { SectionCard } from "@/components/ui/section-card";

interface ProfileResponse {
  provider: Provider & { badges?: { badgeType: string }[] };
  trustBreakdown: unknown;
  neighborhoodStats: { neighborhood: string; homesHelped: number }[];
}

export default function ProviderProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, loading, error, reload } = useFetch<ProfileResponse>(
    () => apiRequest<ProfileResponse>(`/providers/${id}`),
    [id]
  );
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  if (loading) return <ProfileSkeleton />;
  if (error || !data)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState
          message={error ?? "This provider isn't available."}
          onRetry={reload}
        />
      </div>
    );

  const p = data.provider;
  const name = p.legalName || p.user?.name || "Provider";
  const reviews = p.reviews ?? [];
  const rating = reviews.length
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : null;
  const isFastResponder = p.badges?.some((b) => b.badgeType === "FAST_RESPONDER");
  // Paid trust badges (PRD §4.3) — backend returns only ACTIVE badges here.
  const paidBadges = (p.badges ?? [])
    .map((b) => b.badgeType as TrustBadgeType)
    .filter((t) => t === "SKILL_VERIFIED" || t === "BACKGROUND_CHECKED" || t === "INSURED");

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 lg:pb-10">
      <Link
        href="/services"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-8">
        <div className="min-w-0">
          {/* 1. Identity hero */}
          <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary-soft/70 via-card to-card p-5 shadow-sm sm:p-6">
            <div className="flex gap-4">
              <Avatar
                src={p.profilePhoto}
                name={name}
                size={84}
                className="ring-4 ring-background shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
                  <button
                    onClick={() => setBreakdownOpen(true)}
                    className="flex shrink-0 flex-col items-center gap-1 lg:hidden"
                    aria-label="View trust score breakdown"
                  >
                    <TrustScoreRing score={p.trustScore} size={56} />
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-primary">
                      <Info className="h-3 w-3" /> Trust
                    </span>
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <TierBadge tier={p.kycTier} />
                  <ExperienceBadge milestone={p.milestoneBadge} />
                  {isFastResponder && <FastResponderChip />}
                  {paidBadges.map((t) => (
                    <TrustBadge key={t} type={t} size="default" />
                  ))}
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
                  {p.serviceArea && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {p.serviceArea}
                    </span>
                  )}
                  {rating != null && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="tabular font-medium text-foreground">
                        {rating.toFixed(1)}
                      </span>
                      ({reviews.length})
                    </span>
                  )}
                  <span className="tabular">{p.completedBookings} jobs done</span>
                  {!!p.yearsExperience && (
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="h-4 w-4" /> {p.yearsExperience}
                      {p.yearsExperience === 1 ? " year" : " years"} experience
                    </span>
                  )}
                </div>
                <div className="mt-2.5">
                  <span
                    className={
                      p.isAvailable
                        ? "inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                        : "inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
                    }
                  >
                    <span
                      className={
                        p.isAvailable
                          ? "h-2 w-2 rounded-full bg-primary"
                          : "h-2 w-2 rounded-full bg-muted-foreground/50"
                      }
                      aria-hidden
                    />
                    {p.isAvailable ? "Available for new bookings" : "Not currently available"}
                  </span>
                </div>
              </div>
            </div>

            {p.bio && (
              <p className="mt-4 text-[15px] leading-relaxed text-foreground">{p.bio}</p>
            )}
          </section>

          {/* 2. Neighborhood proof (PRD §5.4) */}
          {data.neighborhoodStats?.length > 0 && (
            <SectionCard title="Neighborhood activity" className="mt-5">
              <ul className="space-y-1.5">
                {data.neighborhoodStats.map((n) => (
                  <li key={n.neighborhood} className="text-sm text-muted-foreground">
                    Worked for{" "}
                    <span className="font-semibold text-foreground">
                      {n.homesHelped} homes
                    </span>{" "}
                    in {n.neighborhood} this month
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {/* 3. Services */}
          {p.categories && p.categories.length > 0 && (
            <SectionCard title="Services offered" className="mt-5">
              <div className="flex flex-wrap gap-2">
                {p.categories.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm font-medium"
                  >
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    {c.category?.name}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}

          {/* 4. Guarantee banner (PRD §5.2) */}
          <section className="mt-5 flex items-center gap-3 rounded-xl bg-primary-soft p-4">
            <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
            <p className="text-sm font-medium text-foreground">
              7-Day Workmanship Guarantee on every on-platform booking.
            </p>
          </section>

          {/* 5. Reviews */}
          <SectionCard
            title={`Reviews${reviews.length > 0 ? ` (${reviews.length})` : ""}`}
            className="mt-5"
          >
            {reviews.length ? (
              <>
                <RatingSummary reviews={reviews} average={rating!} />
                <ul className="mt-5 space-y-4 border-t border-border pt-5">
                  {reviews.map((r) => (
                    <ReviewItem key={r.id} review={r} />
                  ))}
                </ul>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center">
                <p className="text-sm font-medium">New provider</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Protected by escrow &amp; the 7-day guarantee — book with confidence.
                </p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Desktop booking sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trust score</p>
                  <p className="tabular text-3xl font-bold">{Math.round(p.trustScore)}</p>
                </div>
                <button
                  onClick={() => setBreakdownOpen(true)}
                  aria-label="View trust score breakdown"
                >
                  <TrustScoreRing score={p.trustScore} size={56} />
                </button>
              </div>
              <button
                onClick={() => setBreakdownOpen(true)}
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Info className="h-3 w-3" /> See how this is calculated
              </button>

              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Jobs completed</span>
                  <span className="tabular font-medium">{p.completedBookings}</span>
                </div>
                {rating != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="tabular font-medium">
                      {rating.toFixed(1)} ({reviews.length})
                    </span>
                  </div>
                )}
                {!!p.yearsExperience && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-medium">{p.yearsExperience} yrs</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Availability</span>
                  <span className={p.isAvailable ? "font-medium text-primary" : "font-medium text-muted-foreground"}>
                    {p.isAvailable ? "Available now" : "Unavailable"}
                  </span>
                </div>
              </div>

              <Link href={`/providers/${id}/book`} className="mt-4 block">
                <Button full size="lg">
                  Book Now
                </Button>
              </Link>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 text-primary" /> Escrow-protected payment
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-2xl border border-primary/20 bg-primary-soft/60 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-foreground">
                Covered by BishwasSetu&apos;s 7-day workmanship guarantee — if
                something&apos;s wrong, we make it right.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Sticky bottom CTA on mobile/tablet — the sidebar above replaces it on desktop */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-background/95 p-3 backdrop-blur md:bottom-0 lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-1">
          <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <Lock className="h-4 w-4 text-primary" /> Escrow-protected
          </div>
          <Link href={`/providers/${id}/book`} className="ml-auto flex-1 sm:max-w-xs">
            <Button full size="lg">
              Book Now
            </Button>
          </Link>
        </div>
      </div>

      <TrustBreakdownSheet
        open={breakdownOpen}
        onClose={() => setBreakdownOpen(false)}
        score={p.trustScore}
        tier={p.kycTier}
      />
    </div>
  );
}

function RatingSummary({
  reviews,
  average,
}: {
  reviews: Review[];
  average: number;
}) {
  const counts = useMemo(() => {
    const c = [0, 0, 0, 0, 0]; // index 0 = 5★ … index 4 = 1★
    for (const r of reviews) {
      const idx = 5 - Math.min(5, Math.max(1, Math.round(r.rating)));
      c[idx]++;
    }
    return c;
  }, [reviews]);

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="text-center sm:w-28 sm:shrink-0">
        <p className="tabular text-4xl font-bold">{average.toFixed(1)}</p>
        <div className="mt-1 flex justify-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={
                i < Math.round(average)
                  ? "h-3.5 w-3.5 fill-warning text-warning"
                  : "h-3.5 w-3.5 text-border"
              }
            />
          ))}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{reviews.length} reviews</p>
      </div>
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star, i) => {
          const count = counts[i];
          const pct = reviews.length ? (count / reviews.length) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 text-muted-foreground">{star}</span>
              <Star className="h-3 w-3 shrink-0 fill-warning text-warning" />
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-warning"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-5 text-right tabular text-muted-foreground">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewItem({ review }: { review: Review }) {
  return (
    <li className="flex gap-3">
      <Avatar name={review.customer?.name ?? "Customer"} size={36} />
      <div className="min-w-0 flex-1 rounded-xl border border-border bg-secondary/30 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-medium text-foreground">
            {review.customer?.name ?? "Customer"}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {relativeTime(review.createdAt)}
          </span>
        </div>
        <div className="mt-1 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={
                i < review.rating
                  ? "h-4 w-4 fill-warning text-warning"
                  : "h-4 w-4 text-border"
              }
            />
          ))}
        </div>
        {review.comment && (
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {review.comment}
          </p>
        )}
      </div>
    </li>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
        <div>
          <div className="flex gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="mt-6 h-24 w-full rounded-xl" />
          <Skeleton className="mt-4 h-40 w-full rounded-xl" />
        </div>
        <Skeleton className="mt-6 hidden h-64 w-full rounded-2xl lg:mt-0 lg:block" />
      </div>
    </div>
  );
}
