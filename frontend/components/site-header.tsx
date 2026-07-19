"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [language, setLanguage] = useState<"en" | "ne">("en");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
            घ
          </span>
          <span className="hidden text-[15px] sm:inline">GharSewa Nepal</span>
        </Link>

        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary sm:flex-none"
        >
          <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
          <span className="truncate">Maharajgunj, Kathmandu</span>
          <ChevronDown className="size-3.5 shrink-0" aria-hidden />
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setLanguage((l) => (l === "en" ? "ne" : "en"))}
            className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            aria-label="Toggle language between Nepali and English"
          >
            <span className={language === "ne" ? "text-primary" : ""}>ने</span>
            <span className="text-muted-foreground"> / </span>
            <span className={language === "en" ? "text-primary" : ""}>EN</span>
          </button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="relative"
          >
            <Bell aria-hidden />
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-accent-urgent" />
          </Button>
        </div>
      </div>
    </header>
  );
}
