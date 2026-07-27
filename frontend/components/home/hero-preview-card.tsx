import { BadgeCheck, Award, Home, Clock, CheckCircle2 } from "lucide-react";
import { TrustScoreRing } from "@/components/trust-score-ring";

/**
 * Illustrative provider card shown in the hero — a static mockup that
 * mirrors the real ProviderCard/profile so newcomers see the payoff.
 */
export function HeroPreviewCard() {
  return (
    <div className="relative">
      {/* Floating: response time */}
      <div className="absolute -right-2 top-6 z-10 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-lg shadow-black/10 sm:-right-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Response time
        </p>
        <p className="flex items-center gap-1 text-sm font-bold text-foreground">
          <Clock className="h-3.5 w-3.5 text-primary" /> ~ 12 min
        </p>
      </div>

      {/* Floating: booking confirmed */}
      <div className="absolute -bottom-4 -left-2 z-10 flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg shadow-black/10 sm:-left-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold leading-tight text-foreground">
            Booking confirmed
          </p>
          <p className="text-xs text-muted-foreground">Today, 4:30 PM</p>
        </div>
      </div>

      {/* Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-xl shadow-black/5">
        {/* subtle grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5] [mask-image:radial-gradient(120%_100%_at_50%_0%,black,transparent_75%)]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-skilled-soft text-2xl font-bold text-skilled">
            AP
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
              Trust score
            </p>
          </div>

          {/* Badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Chip tone="primary">
              <BadgeCheck className="h-3.5 w-3.5" /> Identity verified
            </Chip>
            <Chip tone="skilled">
              <Award className="h-3.5 w-3.5" /> Skill Tier 2 Expert
            </Chip>
            <Chip tone="neutral">
              <Home className="h-3.5 w-3.5" /> 412+ jobs
            </Chip>
          </div>

          {/* Stats */}
          <div className="mt-5 grid w-full grid-cols-3 divide-x divide-border rounded-2xl bg-secondary/70 py-3">
            <Stat value="4.9★" label="Rating" />
            <Stat value="412" label="Jobs" />
            <Stat value="12" label="Years" />
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
