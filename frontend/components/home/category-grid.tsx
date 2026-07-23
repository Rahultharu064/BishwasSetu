"use client";

import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { useLang } from "@/context/language-context";
import type { Category } from "@/lib/types";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const { t } = useLang();
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-4 md:grid-cols-8">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/services/${c.slug}`}
          className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center shadow-sm transition-colors hover:border-primary/40"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <CategoryIcon name={c.slug || c.name} className="h-6 w-6" />
          </span>
          <span className="text-xs font-medium leading-tight text-foreground">
            {t(c.name, c.nameNp)}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3"
        >
          <div className="h-12 w-12 animate-pulse rounded-full bg-secondary" />
          <div className="h-3 w-12 animate-pulse rounded bg-secondary" />
        </div>
      ))}
    </div>
  );
}
