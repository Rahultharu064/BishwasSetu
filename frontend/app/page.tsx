import { ArrowRight } from "lucide-react";

import { BottomNav } from "@/components/bottom-nav";
import { CategoryGrid } from "@/components/category-grid";
import { EmergencyButton } from "@/components/emergency-button";
import { HeroSearch } from "@/components/hero-search";
import { ProviderCard } from "@/components/provider-card";
import { SiteHeader } from "@/components/site-header";
import { TrustStrip } from "@/components/trust-strip";
import { featuredProviders } from "@/lib/data";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pb-24 pt-6 sm:pb-10">
        <section className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Trusted help, at your door.
            </h1>
            <p className="mt-1 text-[15px] text-muted-foreground">
              Verified providers, escrow-protected payments, guaranteed work.
            </p>
          </div>
          <HeroSearch />
        </section>

        <section aria-label="Emergency dispatch">
          <EmergencyButton />
        </section>

        <section aria-labelledby="categories-heading" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 id="categories-heading" className="text-lg font-bold text-foreground">
              What do you need fixed?
            </h2>
            <a
              href="#"
              className="flex items-center gap-1 text-sm font-medium text-primary"
            >
              See all
              <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
          <CategoryGrid />
        </section>

        <section aria-label="Platform trust signals">
          <TrustStrip />
        </section>

        <section aria-labelledby="nearby-heading" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 id="nearby-heading" className="text-lg font-bold text-foreground">
              Active in your neighborhood
            </h2>
            <a
              href="#"
              className="flex items-center gap-1 text-sm font-medium text-primary"
            >
              See all
              <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {featuredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
