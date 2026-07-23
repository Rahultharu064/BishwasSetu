import Link from "next/link";
import {
  Camera,
  Phone,
  BadgeCheck,
  ShieldCheck,
  Wallet,
  TrendingUp,
  Zap,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Become a Pro — BishwasSetu",
  description:
    "Start earning in minutes with skill-first onboarding. Build a portable, verified reputation on Nepal's trusted home services platform.",
};

export default function ForProvidersPage() {
  return (
    <div>
      <section className="border-b border-border bg-gradient-to-b from-primary-soft/60 to-background">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
            <Camera className="h-3.5 w-3.5" /> Skill-first onboarding
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
            Your skills deserve steady work
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground md:text-lg">
            Start with just a phone number and 3 work photos. Level up to unlock
            bigger jobs — a CTEVT certificate says more than an ID ever could.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/register?role=provider">
              <Button size="lg">Get started free</Button>
            </Link>
            <Link href="/provider/onboarding">
              <Button variant="outline" size="lg">
                See the tiers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-14 px-4 py-12">
        {/* Tier ladder */}
        <section>
          <h2 className="text-center text-2xl font-bold tracking-tight">
            Grow through three tiers
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <TierCard
              level="Tier 1"
              name="Basic"
              icon={<Phone className="h-5 w-5" />}
              reqs={["Phone OTP", "Profile photo", "3 work photos"]}
              unlock="Accept jobs under NPR 1,000 — start today"
            />
            <TierCard
              level="Tier 2"
              name="Skilled"
              highlight
              icon={<BadgeCheck className="h-5 w-5" />}
              reqs={["Everything in Tier 1", "CTEVT / professional certificate"]}
              unlock="All standard jobs + a Skilled badge"
            />
            <TierCard
              level="Tier 3"
              name="Verified & Insured"
              icon={<ShieldCheck className="h-5 w-5" />}
              reqs={["Everything in Tier 2", "Citizenship / passport", "Video selfie"]}
              unlock="High-value jobs, Trust badge, insurance eligibility"
            />
          </div>
        </section>

        {/* Why */}
        <section className="grid gap-4 md:grid-cols-3">
          <Feature
            icon={<Wallet className="h-5 w-5" />}
            title="Guaranteed payment"
            body="Customers pay into escrow before you start. Complete the job — the money is yours."
          />
          <Feature
            icon={<TrendingUp className="h-5 w-5" />}
            title="Rank on merit"
            body="On-platform work earns Verified Revenue Points that boost your search ranking — never pay-to-win."
          />
          <Feature
            icon={<Zap className="h-5 w-5" />}
            title="Emergency jobs"
            body="Accept urgent dispatches within 5 minutes to earn the Fast Responder badge and a 12% priority tier."
          />
        </section>

        {/* No dark patterns */}
        <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-xl font-bold">Fair by design</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "No monthly subscription — you never pay during idle months",
              "No auto-renewing charges — you control every rupee",
              "No paid ranking override — trust can't be bought",
              "Direct messaging only after a booking is accepted",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="overflow-hidden rounded-2xl bg-primary p-8 text-center text-primary-foreground">
          <h2 className="text-2xl font-bold">Ready in under 5 minutes</h2>
          <p className="mx-auto mt-2 max-w-md text-primary-foreground/90">
            Join hundreds of verified pros already earning on BishwasSetu.
          </p>
          <Link href="/register?role=provider" className="mt-5 inline-block">
            <Button variant="urgent" size="lg">
              Become a Pro
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}

function TierCard({
  level,
  name,
  icon,
  reqs,
  unlock,
  highlight,
}: {
  level: string;
  name: string;
  icon: React.ReactNode;
  reqs: string[];
  unlock: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlight
          ? "border-primary bg-primary-soft/50 shadow-sm"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {icon}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {level}
          </p>
          <p className="font-bold">{name}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
        {reqs.map((r) => (
          <li key={r} className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {r}
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-lg bg-card p-3 text-sm font-medium text-foreground">
        → {unlock}
      </p>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
        {icon}
      </span>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
