"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  BadgeCheck,
  Camera,
  ArrowRight,
  Star,
  MapPin,
  Sparkles,
  CreditCard,
  Headphones,
  Award,
} from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { providersFrom } from "@/lib/normalize";
import { FALLBACK_CATEGORIES } from "@/lib/fallback-data";
import type { Category } from "@/lib/types";
import { HeroSearch } from "@/components/home/hero-search";
import { HeroPreviewCard } from "@/components/home/hero-preview-card";
import { CategoryGrid, CategoryGridSkeleton } from "@/components/home/category-grid";
import { EmergencyButton } from "@/components/emergency-button";
import { ProviderCard, ProviderCardSkeleton } from "@/components/provider-card";
import { Button } from "@/components/ui/button";

const POPULAR = [
  "Electrician",
  "Plumbing",
  "Deep cleaning",
  "Solar",
  "AC repair",
];

const HERO_TRUST = [
  { icon: ShieldCheck, label: "4-stage verification" },
  { icon: CreditCard, label: "Escrow-protected payments" },
  { icon: Headphones, label: "24/7 incident support" },
  { icon: Award, label: "Damage cover up to NPR 1L" },
];

export default function HomePage() {
  const cats = useFetch<Category[]>(() => api.categories(), []);
  const featured = useFetch(() => api.searchProviders({ limit: 6 }), []);

  const categories =
    cats.data && cats.data.length ? cats.data : FALLBACK_CATEGORIES;
  const providers = providersFrom(featured.data);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary-soft/60 via-background to-warning-soft/40">
        {/* soft decorative glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-warning/10 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 md:py-16 lg:grid-cols-2 lg:gap-8">
          {/* Left — copy + search */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-primary shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Nepal&apos;s most trusted marketplace
            </span>

            <h1 className="mt-5 text-[2.5rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
              Hire verified local professionals with total confidence
              <span className="text-primary">.</span>
            </h1>

            <p className="mt-5 max-w-md text-base text-muted-foreground md:text-lg">
              Every provider on BishwasSetu passes a 4-stage identity, skill and
              reference check. Book in minutes — backed by escrow and a service
              guarantee.
            </p>

            <div className="mt-7 max-w-xl">
              <HeroSearch />
            </div>

            {/* Popular categories */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Popular:</span>
              {POPULAR.map((p) => (
                <Link
                  key={p}
                  href={`/search?q=${encodeURIComponent(p)}`}
                  className="rounded-full border border-border bg-card px-3 py-1 font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {p}
                </Link>
              ))}
            </div>

            {/* Secondary actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/match">
                <Button variant="soft">
                  <Sparkles className="h-4 w-4" /> AI Smart Match
                </Button>
              </Link>
              <EmergencyButton />
            </div>
          </div>

          {/* Right — provider preview */}
          <div className="mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
            <HeroPreviewCard />
          </div>
        </div>

        {/* Trust strip band */}
        <div className="relative border-t border-border bg-card/60 backdrop-blur">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-3 px-4 py-4 md:grid-cols-4">
            {HERO_TRUST.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.label} className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {t.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
        {/* ── Categories ─────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Browse by category
              </h2>
              <p className="text-sm text-muted-foreground">
                Every provider is identity-verified before they can take jobs.
              </p>
            </div>
            <Link
              href="/services"
              className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
            >
              All services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {cats.loading ? (
            <CategoryGridSkeleton />
          ) : (
            <CategoryGrid categories={categories} />
          )}
        </section>

        {/* ── Trust strip ───────────────────────────────── */}
        <section className="grid gap-3 sm:grid-cols-3">
          <TrustStat
            icon={<ShieldCheck className="h-5 w-5" />}
            title="1,000+ Verified Providers"
            sub="Tiered KYC — identity, skill & insurance checked"
          />
          <TrustStat
            icon={<Lock className="h-5 w-5" />}
            title="Escrow-Protected Payments"
            sub="Money released only when you confirm the job is done"
          />
          <TrustStat
            icon={<BadgeCheck className="h-5 w-5" />}
            title="7-Day Workmanship Guarantee"
            sub="On every on-platform booking, no extra cost"
          />
        </section>

        {/* ── Featured / nearby providers ───────────────── */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Top-rated near you
              </h2>
              <p className="text-sm text-muted-foreground">
                Ranked by trust score — never by who paid more.
              </p>
            </div>
            <Link
              href="/search"
              className="text-sm font-semibold text-primary hover:underline"
            >
              See all
            </Link>
          </div>

          {featured.loading ? (
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProviderCardSkeleton key={i} />
              ))}
            </div>
          ) : providers.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {providers.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          ) : (
            <NewMarketplaceCta />
          )}
        </section>

        {/* ── How it works ──────────────────────────────── */}
        <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-xl font-bold tracking-tight">How BishwasSetu works</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Step
              n={1}
              title="Find a verified pro"
              body="Search or browse categories. Compare real trust scores, tiers and neighborhood activity."
            />
            <Step
              n={2}
              title="Book & pay into escrow"
              body="Your payment is held safely by BishwasSetu — the provider is only paid when you're satisfied."
            />
            <Step
              n={3}
              title="Confirm & review"
              body="Tap “Job Complete” to release payment. Rate the work — it powers the trust score."
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/how-it-works">
              <Button variant="outline">Learn more</Button>
            </Link>
            <Link href="/services">
              <Button>Get started</Button>
            </Link>
          </div>
        </section>

        {/* ── Provider CTA ──────────────────────────────── */}
        <section className="overflow-hidden rounded-2xl bg-primary text-primary-foreground">
          <div className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="max-w-xl">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <Camera className="h-3.5 w-3.5" /> Skill-first onboarding
              </div>
              <h2 className="text-2xl font-bold">Are you a skilled tradesperson?</h2>
              <p className="mt-1.5 text-primary-foreground/90">
                Start earning in minutes with just a phone number and 3 work
                photos. Build a portable, verified reputation.
              </p>
            </div>
            <Link href="/for-providers" className="shrink-0">
              <Button variant="urgent" size="lg">
                Become a Pro <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function TrustStat({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        {icon}
      </span>
      <div>
        <p className="font-semibold leading-tight text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="relative">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground shadow-sm ring-4 ring-primary-soft">
        {n}
      </span>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function NewMarketplaceCta() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Star className="h-6 w-6" />
      </div>
      <p className="mt-3 font-semibold">Providers are joining your area</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Pick a category to see verified pros near you — every new booking is
        protected by escrow and a 7-day guarantee.
      </p>
      <Link href="/services" className="mt-4 inline-block">
        <Button variant="soft" size="sm">
          <MapPin className="h-4 w-4" /> Browse categories
        </Button>
      </Link>
    </div>
  );
}
