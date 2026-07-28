"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  MapPin,
  Star,
  ShieldCheck,
  Lock,
  ChevronRight,
  Info,
  BadgeCheck,
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
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-6 md:pb-10">
      <Link
        href="/services"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>

      {/* 1. Identity block */}
      <section className="flex gap-4">
        <Avatar src={p.profilePhoto} name={name} size={80} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <TierBadge tier={p.kycTier} />
            <ExperienceBadge milestone={p.milestoneBadge} />
            {isFastResponder && <FastResponderChip />}
            {paidBadges.map((t) => (
              <TrustBadge key={t} type={t} size="default" />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
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
          </div>
        </div>
        <button
          onClick={() => setBreakdownOpen(true)}
          className="flex flex-col items-center gap-1"
          aria-label="View trust score breakdown"
        >
          <TrustScoreRing score={p.trustScore} size={60} />
          <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-primary">
            <Info className="h-3 w-3" /> Trust
          </span>
        </button>
      </section>

      {p.bio && (
        <p className="mt-4 text-[15px] leading-relaxed text-foreground">{p.bio}</p>
      )}

      {/* 2. Neighborhood proof (PRD §5.4) */}
      {data.neighborhoodStats?.length > 0 && (
        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold">
            <MapPin className="h-4 w-4 text-primary" /> Neighborhood activity
          </h2>
          <ul className="mt-2 space-y-1.5">
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
        </section>
      )}

      {/* 3. Services */}
      {p.categories && p.categories.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Services offered</h2>
          <div className="flex flex-wrap gap-2">
            {p.categories.map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium"
              >
                <BadgeCheck className="h-4 w-4 text-primary" />
                {c.category?.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 4. Guarantee banner (PRD §5.2) */}
      <section className="mt-6 flex items-center gap-3 rounded-xl bg-primary-soft p-4">
        <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
        <p className="text-sm font-medium text-foreground">
          7-Day Workmanship Guarantee on every on-platform booking.
        </p>
      </section>

      {/* 5. Reviews */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>
        {reviews.length ? (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <ReviewItem key={r.id} review={r} />
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
            <p className="text-sm font-medium">New provider</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Protected by escrow &amp; the 7-day guarantee — book with confidence.
            </p>
          </div>
        )}
      </section>

      {/* Sticky bottom CTA (ux.md §5.3) */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-background/95 p-3 backdrop-blur md:bottom-0">
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

function ReviewItem({ review }: { review: Review }) {
  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium text-foreground">
          {review.customer?.name ?? "Customer"}
        </p>
        <span className="text-xs text-muted-foreground">
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
    </li>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
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
  );
}
