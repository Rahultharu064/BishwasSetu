"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { categories } from "@/lib/data";

const rotatingPrompts = categories.map((c) => `Need a ${c.label.toLowerCase()}?`);

export function HeroSearch() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % rotatingPrompts.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring">
      <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="sr-only">Search for a service</span>
      <input
        type="search"
        placeholder={rotatingPrompts[index]}
        className="w-full min-w-0 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </label>
  );
}
