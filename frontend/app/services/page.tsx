"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { FALLBACK_CATEGORIES } from "@/lib/fallback-data";
import type { Category } from "@/lib/types";
import { CategoryIcon } from "@/components/category-icon";
import { useLang } from "@/context/language-context";
import { SearchBar } from "@/components/home/search-bar";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServicesPage() {
  const { t } = useLang();
  const { data, loading } = useFetch<Category[]>(() => api.categories(), []);
  const categories = data && data.length ? data : FALLBACK_CATEGORIES;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">All services</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a category to see verified providers near you.
        </p>
      </div>

      <div className="mb-8 max-w-2xl">
        <SearchBar />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/services/${c.slug}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <CategoryIcon name={c.slug || c.name} className="h-7 w-7" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">
                  {t(c.name, c.nameNp)}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  {c._count?.providers ?? 0} verified pros
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
