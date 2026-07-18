"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Star, Search, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ServiceApi } from "@/lib/endpoints";
import { useFetch } from "@/lib/use-fetch";
import type { Category } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const { data: categories, loading, error } = useFetch(() => ServiceApi.categories(), []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query.trim() ? `/services?q=${encodeURIComponent(query.trim())}` : "/services");
  }

  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/60 to-background">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            Kathmandu Valley pilot &middot; every provider identity-verified
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Home services you can{" "}
            <span className="text-primary">actually trust.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground text-balance">
            Book verified plumbers, electricians, and cleaners. Payment stays in
            escrow until the job is done — no surprises, no disappearing acts.
          </p>

          <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-lg gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What do you need help with?"
                className="h-13 pl-11 text-base"
              />
            </div>
            <Button type="submit" size="lg">
              Search
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <Link href="/register" className="font-medium text-primary hover:underline">
              Become a verified provider &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Trust pillars */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3">
          <Pillar
            icon={ShieldCheck}
            title="Identity-verified providers"
            text="Every provider passes ID + photo verification before they can accept a booking."
          />
          <Pillar
            icon={Lock}
            title="Escrow-protected payments"
            text="Your payment is held securely and only released to the provider when you confirm the job's done."
          />
          <Pillar
            icon={Star}
            title="Trust scores that are earned"
            text="Rankings are built from real, on-platform completed jobs — never bought with credits."
          />
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Browse by category</h2>
            <p className="mt-1 text-muted-foreground">Find the right pro for the job.</p>
          </div>
          <Link href="/services" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-6 w-6" />
          </div>
        ) : error ? (
          <p className="text-center text-sm text-muted-foreground">Couldn&apos;t load categories right now.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {(categories ?? []).map((c: Category) => (
              <Link key={c.id} href={`/services/${c.slug}`}>
                <Card className="group flex h-full flex-col items-start gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lifted)]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-xl">
                    {c.icon ?? "🛠️"}
                  </span>
                  <div>
                    <p className="font-semibold group-hover:text-primary">{c.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {c._count?.providers ?? 0} verified providers
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight">How BishwasSetu works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Step
              n={1}
              title="Find a verified pro"
              text="Browse by category, compare trust scores and reviews, pick who fits your job."
            />
            <Step
              n={2}
              title="Book & pay securely"
              text="Pay through the app. Your money stays in escrow — the provider isn't paid until the job's confirmed."
            />
            <Step
              n={3}
              title="Confirm & rate"
              text="Tap Job Complete when you're satisfied, funds release instantly, then leave a review."
            />
          </div>
        </div>
      </section>

      {/* Provider CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Card className="flex flex-col items-start gap-6 overflow-hidden bg-primary p-8 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:p-12">
          <div>
            <h2 className="text-2xl font-bold">Steady work, built on your reputation.</h2>
            <p className="mt-2 max-w-md text-primary-foreground/80">
              Get verified, build a portable trust score from real completed jobs, and
              get matched with customers who are ready to book.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-primary-foreground/80">
              {["Manual, fast KYC review", "No monthly fees while idle", "Commission only on completed jobs"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <Link href="/register">
            <Button variant="primary" size="lg" className="shrink-0 bg-accent">
              Become a provider
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
}

function Pillar({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        {n}
      </span>
      <p className="mt-4 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
