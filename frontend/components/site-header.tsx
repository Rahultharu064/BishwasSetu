"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  MapPin,
  Menu,
  X,
  Zap,
  ShieldCheck,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/providers", label: "Find Providers" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [language, setLanguage] = useState<"en" | "ne">("en");
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("#")[0]) && href.split("#")[0] !== "";
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 font-bold text-foreground"
            aria-label="GharSewa Nepal — Home"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
              घ
            </span>
            <span className="hidden text-[15px] sm:inline">GharSewa Nepal</span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav
            aria-label="Main"
            className="hidden items-center gap-1 md:flex"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isActive(href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
                aria-current={isActive(href) ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Right side controls ── */}
          <div className="flex items-center gap-1.5">

            {/* Location pill — hidden on xs */}
            <button
              type="button"
              className="hidden items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary sm:flex"
              aria-label="Change location"
            >
              <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden />
              <span className="max-w-[110px] truncate text-xs">Maharajgunj, KTM</span>
              <ChevronDown className="size-3 shrink-0" aria-hidden />
            </button>

            {/* Language toggle */}
            <button
              type="button"
              onClick={() => setLanguage((l) => (l === "en" ? "ne" : "en"))}
              className="hidden rounded-full border border-border px-2.5 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary sm:block"
              aria-label="Toggle language"
            >
              <span className={language === "ne" ? "text-primary" : ""}>ने</span>
              <span className="text-muted-foreground"> / </span>
              <span className={language === "en" ? "text-primary" : ""}>EN</span>
            </button>

            {/* Notifications bell */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="relative hidden sm:inline-flex"
            >
              <Bell className="size-4.5" aria-hidden />
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-accent-urgent" />
            </Button>

            {/* Emergency dispatch — desktop */}
            <Link href="/services?emergency=true" className="hidden lg:block">
              <Button
                variant="urgent"
                size="sm"
                className="gap-1.5"
                aria-label="Emergency — find a provider now"
              >
                <Zap className="size-3.5 fill-current" aria-hidden />
                Emergency
              </Button>
            </Link>

            {/* Auth CTAs */}
            <Link href="/login" className="hidden md:block">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <User className="size-4" aria-hidden />
                Log in
              </Button>
            </Link>

            <Link href="/register" className="hidden md:block">
              <Button variant="primary" size="sm" className="gap-1.5">
                <ShieldCheck className="size-4" aria-hidden />
                Get Started
              </Button>
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? (
                <X className="size-5" aria-hidden />
              ) : (
                <Menu className="size-5" aria-hidden />
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="border-t border-border bg-background pb-4 md:hidden">
            <nav aria-label="Mobile" className="flex flex-col gap-0.5 px-4 pt-3">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive(href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                  aria-current={isActive(href) ? "page" : undefined}
                >
                  {label}
                </Link>
              ))}

              {/* Mobile: Emergency */}
              <Link
                href="/services?emergency=true"
                onClick={() => setMobileOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-lg bg-accent-urgent/10 px-4 py-2.5 text-sm font-semibold text-accent-urgent transition-colors hover:bg-accent-urgent/20"
              >
                <Zap className="size-4 fill-current" aria-hidden />
                Emergency Dispatch
              </Link>
            </nav>

            {/* Mobile: Location + Language */}
            <div className="mt-3 flex items-center gap-2 px-4">
              <button
                type="button"
                className="flex flex-1 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary"
              >
                <MapPin className="size-4 text-primary" aria-hidden />
                <span className="truncate">Maharajgunj, Kathmandu</span>
                <ChevronDown className="size-3.5 ml-auto" aria-hidden />
              </button>

              <button
                type="button"
                onClick={() => setLanguage((l) => (l === "en" ? "ne" : "en"))}
                className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-secondary"
                aria-label="Toggle language"
              >
                <span className={language === "ne" ? "text-primary" : ""}>ने</span>
                <span className="text-muted-foreground"> / </span>
                <span className={language === "en" ? "text-primary" : ""}>EN</span>
              </button>
            </div>

            {/* Mobile: Auth */}
            <div className="mt-3 flex gap-2 px-4">
              <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full gap-1.5">
                  <User className="size-4" aria-hidden />
                  Log in
                </Button>
              </Link>
              <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" className="w-full gap-1.5">
                  <ShieldCheck className="size-4" aria-hidden />
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
