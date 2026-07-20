import { ArrowRight } from "lucide-react";

import { BottomNav } from "@/components/bottom-nav";
import { CategoryGrid } from "@/components/category-grid";
import { EmergencyButton } from "@/components/emergency-button";
import { HeroShowcase } from "@/components/hero-showcase";
import { HeroSearch } from "@/components/hero-search";
import { HowItWorks } from "@/components/how-it-works";
import { ProviderCard } from "@/components/provider-card";
import { ProviderCta } from "@/components/provider-cta";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StatsSection } from "@/components/stats-section";
import { featuredProviders } from "@/lib/data";

function SectionHeading({
  id,
  title,
  href,
}: {
  id: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 id={id} className="text-lg font-bold text-foreground sm:text-xl">
        {title}
      </h2>
      {href && (
        <a
          href={href}
          className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          See all
          <ArrowRight className="size-4" aria-hidden />
        </a>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <SiteHeader />

      <main className="flex flex-1 flex-col gap-16 pb-24 sm:gap-20 sm:pb-16">
        <section className="border-b border-border bg-gradient-to-b from-accent/40 to-transparent">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:px-8 lg:py-20">
            <div className="flex flex-col gap-5">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Trusted help, at your door.
              </h1>
              <p className="max-w-md text-[15px] text-muted-foreground sm:text-base">
                Book verified plumbers, electricians, and cleaners across
                Nepal — with transparent trust scores, escrow-protected
                payments, and a 7-day workmanship guarantee.
              </p>
              <HeroSearch />
              <EmergencyButton />
            </div>

            <div className="hidden justify-self-center lg:flex">
              <HeroShowcase />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="categories-heading"
          className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 sm:px-6 lg:px-8"
        >
          <SectionHeading id="categories-heading" title="What do you need fixed?" href="#" />
          <CategoryGrid />
        </section>

        <section
          aria-label="Platform trust signals"
          className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8"
        >
          <StatsSection />
        </section>

        <section
          aria-labelledby="nearby-heading"
          className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 sm:px-6 lg:px-8"
        >
          <SectionHeading id="nearby-heading" title="Active in your neighborhood" href="#" />
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {featuredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </section>

        <section
          aria-labelledby="how-it-works-heading"
          className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 sm:px-6 lg:px-8"
        >
          <SectionHeading id="how-it-works-heading" title="How GharSewa works" />
          <HowItWorks />
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <ProviderCta />
        </section>
      </main>

      <SiteFooter />
      <BottomNav />
    </div>
  );
}
