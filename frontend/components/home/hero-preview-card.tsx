"use client";

import { BadgeCheck, Award, Home, Clock, CheckCircle2 } from "lucide-react";
import { TrustScoreRing } from "@/components/trust-score-ring";
import { useLang } from "@/context/language-context";

/**
 * Illustrative provider card shown in the hero — a static mockup that
 * mirrors the real ProviderCard/profile so newcomers see the payoff.
 */
export function HeroPreviewCard() {
  const { tr } = useLang();
  return (
    <div className="relative">
      {/* Floating: response time */}
      <div className="animate-in fade-in slide-in-from-top-2 absolute -right-2 top-6 z-10 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-lg shadow-black/[0.08] delay-700 duration-700 fill-mode-both sm:-right-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {tr("home.preview.responseTime")}
        </p>
        <p className="flex items-center gap-1 text-sm font-bold text-foreground">
          <Clock className="h-3.5 w-3.5 text-primary" /> ~ 12 min
        </p>
      </div>

      {/* Floating: booking confirmed */}
      <div className="animate-in fade-in slide-in-from-bottom-2 absolute -bottom-4 -left-2 z-10 flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg shadow-black/[0.08] delay-1000 duration-700 fill-mode-both sm:-left-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold leading-tight text-foreground">
            {tr("home.preview.bookingConfirmed")}
          </p>
          <p className="text-xs text-muted-foreground">Today, 4:30 PM</p>
        </div>
      </div>

      {/* Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-2xl shadow-black/[0.07] ring-1 ring-black/[0.02]">
        {/* subtle grid texture */}
        <div
          aria-hidden
          className="bg-dot-grid pointer-events-none absolute inset-0 opacity-[0.5] [mask-image:radial-gradient(120%_100%_at_50%_0%,black,transparent_75%)]"
        />

        <div className="relative flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-skilled-soft text-2xl font-bold text-skilled">
            AP
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground" />
            </span>
          </div>
          <p className="mt-4 text-lg font-bold text-foreground">
            Anish Prajapati
          </p>
          <p className="text-sm text-muted-foreground">
            Master Electrician · Lalitpur
          </p>

          {/* Trust score ring */}
          <div className="mt-5 flex flex-col items-center">
            <TrustScoreRing score={98} size={84} stroke={6} />
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {tr("home.preview.trustScore")}
            </p>
          </div>

          {/* Badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Chip tone="primary">
              <BadgeCheck className="h-3.5 w-3.5" /> {tr("home.preview.identityVerified")}
            </Chip>
            <Chip tone="skilled">
              <Award className="h-3.5 w-3.5" /> {tr("home.preview.skillTier")}
            </Chip>
            <Chip tone="neutral">
              <Home className="h-3.5 w-3.5" /> {tr("home.preview.jobsDone")}
            </Chip>
          </div>

          {/* Stats */}
          <div className="mt-5 grid w-full grid-cols-3 divide-x divide-border rounded-2xl bg-secondary/70 py-3">
            <Stat value="4.9★" label={tr("home.preview.rating")} />
            <Stat value="412" label={tr("home.preview.jobs")} />
            <Stat value="12" label={tr("home.preview.years")} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({
  tone,
  children,
}: {
  tone: "primary" | "skilled" | "neutral";
  children: React.ReactNode;
}) {
  const styles = {
    primary: "bg-primary-soft text-primary",
    skilled: "bg-skilled-soft text-skilled",
    neutral: "bg-secondary text-secondary-foreground",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-2">
      <p className="tabular text-base font-bold text-foreground">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
