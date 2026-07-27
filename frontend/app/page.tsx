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
      <section className="border-b border-border bg-gradient-to-b from-primary-soft/60 to-background">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Nepal&apos;s trusted home services marketplace
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
              Verified pros for every home job
            </h1>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              Book plumbers, electricians, cleaners and more — with transparent
              trust scores and escrow-protected payments.
            </p>

            <div className="mt-6">
              <SearchBar />
            </div>

            <div className="mx-auto mt-3 max-w-md">
              <Link href="/match">
                <Button variant="soft" full size="lg">
                  <Sparkles className="h-4 w-4" /> AI Smart Match — find the nearest pro
                </Button>
              </Link>
            </div>

            <div className="mx-auto mt-4 max-w-md">
              <EmergencyButton />
              <p className="mt-2 text-xs text-muted-foreground">
                Burst pipe or sparking outlet? Get matched with the nearest
                verified pro in under a minute.
              </p>
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
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
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
    <div>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft font-bold text-primary">
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
