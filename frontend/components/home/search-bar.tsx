"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const PLACEHOLDERS = [
  "What do you need fixed?",
  "Leaking tap in Baneshwor…",
  "Deep-clean my apartment…",
  "Wiring for a new room…",
  "AC not cooling…",
];

export function SearchBar({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [ph, setPh] = useState(PLACEHOLDERS[0]);

  // Placeholder rotates by category (ux.md §5.1)
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % PLACEHOLDERS.length;
      setPh(PLACEHOLDERS[i]);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  }

  return (
    <form onSubmit={submit} className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={ph}
        aria-label="Search services"
        className="h-14 w-full rounded-xl border border-border bg-card pl-12 pr-28 text-[15px] shadow-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Search
      </button>
    </form>
  );
}
