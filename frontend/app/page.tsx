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
import { useLang } from "@/context/language-context";
import type { Category } from "@/lib/types";
import { HeroSearch } from "@/components/home/hero-search";
import { HeroPreviewCard } from "@/components/home/hero-preview-card";
import { CategoryGrid, CategoryGridSkeleton } from "@/components/home/category-grid";
import { MarketplaceSteps } from "@/components/home/marketplace-steps";
import { TrustProcess } from "@/components/home/trust-process";
import { StatsBand } from "@/components/home/stats-band";
import { Testimonials } from "@/components/home/testimonials";
import { AppDownload } from "@/components/home/app-download";
import { Faq } from "@/components/home/faq";
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

export default function HomePage() {
  const { tr } = useLang();
  const cats = useFetch<Category[]>(() => api.categories(), []);
  const featured = useFetch(() => api.searchProviders({ limit: 6 }), []);

  const categories =
    cats.data && cats.data.length ? cats.data : FALLBACK_CATEGORIES;
  const providers = providersFrom(featured.data);

  const HERO_TRUST = [
    { icon: ShieldCheck, label: tr("home.hero.trust1") },
    { icon: CreditCard, label: tr("home.hero.trust2") },
    { icon: Headphones, label: tr("home.hero.trust3") },
    { icon: Award, label: tr("home.hero.trust4") },
  ];

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary-soft/60 via-background to-warning-soft/40">
        {/* subtle textured depth, fading toward the edges */}
        <div
          aria-hidden
          className="bg-dot-grid pointer-events-none absolute inset-0 opacity-[0.4] [mask-image:radial-gradient(85%_65%_at_50%_0%,black,transparent_75%)]"
        />
        {/* soft decorative glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-24 h-96 w-96 rounded-full bg-primary/15 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-warning/15 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-skilled/10 blur-[100px]"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 md:py-16 lg:grid-cols-2 lg:gap-8">
          {/* Left — copy + search */}
          <div>
            <span className="animate-in fade-in slide-in-from-bottom-2 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-primary shadow-sm duration-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              {tr("home.hero.badge")}
            </span>

            <h1 className="animate-in fade-in slide-in-from-bottom-4 mt-5 text-[2.5rem] font-bold leading-[1.05] tracking-tight text-balance text-foreground delay-100 duration-700 fill-mode-both sm:text-5xl lg:text-[3.5rem]">
              {tr("home.hero.title")}
              <span className="text-primary">.</span>
            </h1>

            <p className="animate-in fade-in slide-in-from-bottom-4 mt-5 max-w-md text-base text-muted-foreground delay-200 duration-700 fill-mode-both md:text-lg">
              {tr("home.hero.subtitle")}
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-4 mt-7 max-w-xl delay-300 duration-700 fill-mode-both">
              <HeroSearch />
            </div>

            {/* Popular categories */}
            <div className="animate-in fade-in mt-4 flex flex-wrap items-center gap-2 text-sm delay-500 duration-700 fill-mode-both">
              <span className="text-muted-foreground">{tr("home.hero.popular")}</span>
              {POPULAR.map((p) => (
                <Link
                  key={p}
                  href={`/search?q=${encodeURIComponent(p)}`}
                  className="rounded-full border border-border bg-card px-3 py-1 font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary hover:shadow-sm"
                >
                  {p}
                </Link>
              ))}
            </div>

            {/* Secondary actions */}
            <div className="animate-in fade-in slide-in-from-bottom-4 mt-6 flex flex-wrap gap-3 delay-500 duration-700 fill-mode-both">
              <Link href="/match">
                <Button variant="soft" className="shadow-sm transition-shadow hover:shadow-md">
                  <Sparkles className="h-4 w-4" /> {tr("home.hero.aiSmartMatch")}
                </Button>
              </Link>
              <EmergencyButton />
            </div>
          </div>

          {/* Right — provider preview */}
          <div className="animate-in fade-in slide-in-from-right-6 mx-auto w-full max-w-md delay-200 duration-1000 fill-mode-both lg:mx-0 lg:ml-auto">
            <HeroPreviewCard />
          </div>
        </div>

        {/* Trust strip band */}
        <div className="relative border-t border-border bg-card/60 backdrop-blur">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-3 px-4 py-4 md:grid-cols-4">
            {HERO_TRUST.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.label} className="group flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary transition-transform group-hover:scale-105">
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
                {tr("home.categories.heading")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {tr("home.categories.subtitle")}
              </p>
            </div>
            <Link
              href="/services"
              className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
            >
              {tr("home.categories.allServices")} <ArrowRight className="h-4 w-4" />
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
        <MarketplaceSteps />

        {/* ── Quality control / trust process ─────────────── */}
        <TrustProcess />

        {/* ── Growth stats ──────────────────────────────── */}
        <StatsBand />

        {/* ── Testimonials ──────────────────────────────── */}
        <Testimonials />

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

        {/* ── Mobile app CTA ─────────────────────────────── */}
        <AppDownload />

        {/* ── FAQ ────────────────────────────────────────── */}
        <Faq />
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
