"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  ClipboardCheck,
  Users,
  MessageSquareWarning,
  LayoutDashboard,
  BadgeCheck,
  Flag,
  Award,
  Layers,
  ExternalLink,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/kyc", label: "Verification Queue", icon: ClipboardCheck },
  { href: "/admin/skill-evidence", label: "Skill Evidence", icon: BadgeCheck },
  { href: "/admin/badges", label: "Trust Badges", icon: Award },
  { href: "/admin/providers", label: "Providers", icon: Users },
  { href: "/admin/services", label: "Services", icon: Layers },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/complaints", label: "Complaints", icon: MessageSquareWarning },
  { href: "/admin/fraud", label: "Trust & Fraud", icon: Flag },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin =
    user?.role === "ADMIN" || user?.role === "MODERATOR";

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/admin-login");
    } else if (!isAdmin) {
      router.replace("/");
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading || !isAuthenticated || !isAdmin)
    return (
      <div className="flex min-h-dvh items-center justify-center px-4 text-center">
        <div>
          <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {loading ? "Checking access…" : "Admin access required."}
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-dvh flex-col bg-secondary/40">
      {/* Admin top bar — own shell, deliberately not the public SiteHeader
          (see components/site-chrome.tsx) so the console reads as a
          dedicated back-office surface, not a page wrapped in the site. */}
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link href="/admin" className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <span className="hidden text-sm sm:inline">
              Bishwas<span className="text-primary">Setu</span>{" "}
              <span className="text-muted-foreground">Admin</span>
            </span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="ml-auto hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground sm:inline-flex"
          >
            View site <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <div className="relative ml-2 sm:ml-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-secondary"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                {initials(user?.name ?? "Admin")}
              </span>
              <span className="hidden text-left leading-tight md:block">
                <span className="block text-sm font-semibold">
                  {user?.name}
                </span>
                <span className="block text-xs capitalize text-muted-foreground">
                  {user?.role?.toLowerCase()}
                </span>
              </span>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden
                />
                <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                  <div className="px-2.5 py-2 sm:hidden">
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {user?.role?.toLowerCase()}
                    </p>
                  </div>
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground hover:bg-secondary sm:hidden"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ExternalLink className="h-4 w-4" /> View site
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-urgent hover:bg-urgent-soft"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6">
        {/* Sidebar (ux.md §4.3) */}
        <aside className="sticky top-[4.5rem] hidden h-fit w-56 shrink-0 md:block">
          <nav className="space-y-1">
            {NAV.map((n) => {
              const active = n.exact
                ? pathname === n.href
                : pathname.startsWith(n.href);
              const Icon = n.icon;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile top tabs */}
        <main className="w-full min-w-0">
          <nav className="no-scrollbar mb-4 flex gap-2 overflow-x-auto md:hidden">
            {NAV.map((n) => {
              const active = n.exact
                ? pathname === n.href
                : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium",
                    active
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
