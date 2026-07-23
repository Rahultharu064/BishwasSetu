"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Bell, Menu, X, ShieldCheck, LogOut, UserCircle2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/language-context";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-providers", label: "Become a Pro" },
];

export function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, toggle } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">
            Bishwas<span className="text-primary">Setu</span>
          </span>
        </Link>

        {/* Location (desktop) */}
        <button className="ml-2 hidden items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary sm:inline-flex">
          <MapPin className="h-4 w-4 text-primary" />
          Kathmandu
        </button>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Language toggle — persistent (ux.md §14) */}
          <button
            onClick={toggle}
            aria-label="Toggle language"
            className="rounded-full border border-border px-2.5 py-1.5 text-sm font-semibold hover:bg-secondary"
          >
            <span className={cn(lang === "ne" && "text-primary")}>ने</span>
            <span className="mx-1 text-muted-foreground">/</span>
            <span className={cn(lang === "en" && "text-primary")}>EN</span>
          </button>

          {isAuthenticated ? (
            <>
              <Link
                href="/bookings"
                aria-label="Notifications"
                className="hidden rounded-full p-2 hover:bg-secondary sm:inline-flex"
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
              </Link>
              <Link
                href={user?.role === "PROVIDER" ? "/provider" : "/account"}
                className="hidden items-center gap-1.5 rounded-full border border-border py-1.5 pl-1.5 pr-3 text-sm font-medium hover:bg-secondary sm:inline-flex"
              >
                <UserCircle2 className="h-5 w-5 text-primary" />
                {user?.name?.split(" ")[0]}
              </Link>
              <button
                onClick={() => logout()}
                aria-label="Log out"
                className="hidden rounded-full p-2 hover:bg-secondary sm:inline-flex"
              >
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </button>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}

          <button
            className="rounded-lg p-2 hover:bg-secondary md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <nav className="flex flex-col">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-border pt-3">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  full
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                >
                  Log out
                </Button>
              ) : (
                <>
                  <Link href="/login" className="flex-1" onClick={() => setOpen(false)}>
                    <Button variant="outline" full>
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1" onClick={() => setOpen(false)}>
                    <Button full>Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
