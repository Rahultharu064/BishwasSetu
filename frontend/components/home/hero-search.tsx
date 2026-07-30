"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { useLang } from "@/context/language-context";

/**
 * Two-field hero search (what + where) styled as a single white pill,
 * collapsing to a stacked layout on small screens.
 */
export function HeroSearch() {
  const router = useRouter();
  const { tr } = useLang();
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("Kathmandu");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (what.trim()) params.set("q", what.trim());
    if (where.trim()) params.set("loc", where.trim());
    const qs = params.toString();
    router.push(`/search${qs ? `?${qs}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-black/5 sm:flex-row sm:items-center sm:rounded-full sm:pl-4"
    >
      <label className="flex flex-1 items-center gap-3 px-2 py-1.5">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {tr("search.whatLabel")}
          </span>
          <input
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder={tr("search.whatPlaceholder")}
            aria-label={tr("search.ariaWhat")}
            className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </span>
      </label>

      <span className="hidden h-8 w-px shrink-0 bg-border sm:block" />

      <label className="flex flex-1 items-center gap-3 px-2 py-1.5">
        <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {tr("search.whereLabel")}
          </span>
          <input
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder={tr("search.wherePlaceholder")}
            aria-label={tr("search.ariaWhere")}
            className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </span>
      </label>

      <button
        type="submit"
        className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 sm:rounded-full"
      >
        <Search className="h-4 w-4" /> {tr("common.search")}
      </button>
    </form>
  );
}
