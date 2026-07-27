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
} from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { providersFrom } from "@/lib/normalize";
import { FALLBACK_CATEGORIES } from "@/lib/fallback-data";
import type { Category } from "@/lib/types";
import { SearchBar } from "@/components/home/search-bar";
import { CategoryGrid, CategoryGridSkeleton } from "@/components/home/category-grid";
import { EmergencyButton } from "@/components/emergency-button";
import { ProviderCard, ProviderCardSkeleton } from "@/components/provider-card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const cats = useFetch<Category[]>(() => api.categories(), []);
  const featured = useFetch(() => api.searchProviders({ limit: 6 }), []);

  const categories =
    cats.data && cats.data.length ? cats.data : FALLBACK_CATEGORIES;
  const providers = providersFrom(featured.data);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary-soft/70 via-primary-soft/20 to-background">
        {/* soft decorative glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-card px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Nepal&apos;s trusted home services marketplace
            </span>
            <h1 className="mt-5 text-[2rem] font-bold leading-[1.1] tracking-tight text-foreground md:text-[3.25rem]">
              Verified pros for
              <br className="hidden sm:block" /> every home job
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              Book plumbers, electricians, cleaners and more — with transparent
              trust scores and escrow-protected payments.
            </p>

            <div className="mt-7">
              <SearchBar />
            </div>

            {/* Secondary actions */}
            <div className="mx-auto mt-4 grid max-w-md gap-2.5 sm:grid-cols-2">
              <Link href="/match" className="sm:order-1">
                <Button variant="soft" full size="lg">
                  <Sparkles className="h-4 w-4" /> AI Smart Match
                </Button>
              </Link>
              <div className="sm:order-2">
                <EmergencyButton />
              </div>
            </div>
            <p className="mt-2.5 text-xs text-muted-foreground">
              Burst pipe or sparking outlet? Emergency dispatch finds the
              nearest verified pro in under a minute.
            </p>

            {/* Trust proof chips */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <Star className="h-4 w-4 fill-warning text-warning" />
                4.8 average rating
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Identity-verified pros
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <Lock className="h-4 w-4 text-primary" />
                Escrow-protected
              </span>
            </div>
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
