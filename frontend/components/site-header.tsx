"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { MapPin, Menu, X, ShieldCheck, LogOut, UserCircle2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/language-context";
import { NotificationBell } from "./notification-bell";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, toggle, tr } = useLang();
  const [open, setOpen] = useState(false);

  const NAV = [
    { href: "/services", label: tr("nav.services") },
    { href: "/how-it-works", label: tr("nav.howItWorks") },
    { href: "/for-providers", label: tr("nav.becomeAPro") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-24 max-w-6xl items-center justify-between relative px-4">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden">
            <Image
              src="/LOGO.png"
              alt="BishwasSetu Icon"
              width={100}
              height={100}
              className="h-full w-full object-contain mix-blend-multiply drop-shadow-sm"
              priority
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold tracking-tight leading-none">
              <span className="text-[#0E7C5B]">Bishwas</span><span className="text-[#F15A24]">Setu</span>
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1.5">
              <div className="h-[1.5px] w-4 bg-slate-400 dark:bg-slate-500"></div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                Bridge of Trust
              </span>
              <div className="h-[1.5px] w-4 bg-slate-400 dark:bg-slate-500"></div>
            </div>
          </div>
        </Link>

        {/* Center Nav */}
        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-4 py-2 text-[15px] font-medium text-muted-foreground transition-all hover:bg-secondary/60 hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Language toggle — persistent (ux.md §14) */}
          <button
            onClick={toggle}
            aria-label={tr("nav.toggleLanguage")}
            className="rounded-full border border-border px-2.5 py-1.5 text-sm font-semibold hover:bg-secondary"
          >
            <span className={cn(lang === "ne" && "text-primary")}>ने</span>
            <span className="mx-1 text-muted-foreground">/</span>
            <span className={cn(lang === "en" && "text-primary")}>EN</span>
          </button>

          {isAuthenticated ? (
            <>
              <NotificationBell className="hidden sm:inline-flex" />
              <Link
                href={
                  user?.role === "PROVIDER"
                    ? "/provider"
                    : user?.role === "ADMIN" || user?.role === "MODERATOR"
                      ? "/admin"
                      : "/account"
                }
                className="hidden items-center gap-1.5 rounded-full border border-border py-1.5 pl-1.5 pr-3 text-sm font-medium hover:bg-secondary sm:inline-flex"
              >
                <UserCircle2 className="h-5 w-5 text-primary" />
                {user?.name?.split(" ")[0]}
              </Link>
              <button
                onClick={() => logout()}
                aria-label={tr("nav.logout")}
                className="hidden rounded-full p-2 hover:bg-secondary sm:inline-flex"
              >
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </button>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {tr("nav.login")}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">{tr("nav.signup")}</Button>
              </Link>
            </div>
          )}

          <button
            className="rounded-lg p-2 hover:bg-secondary md:hidden"
            aria-label={tr("nav.menu")}
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
                  {tr("nav.logout")}
                </Button>
              ) : (
                <>
                  <Link href="/login" className="flex-1" onClick={() => setOpen(false)}>
                    <Button variant="outline" full>
                      {tr("nav.login")}
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1" onClick={() => setOpen(false)}>
                    <Button full>{tr("nav.signup")}</Button>
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
