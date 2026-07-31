"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
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
  Settings,
  ExternalLink,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

// Grouped like a product sidebar (Overview / Verification / Catalog & people
// / Trust & safety) rather than one flat list — reads better once there are
// this many destinations.
const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    title: "Verification",
    items: [
      { href: "/admin/kyc", label: "Verification Queue", icon: ClipboardCheck },
      { href: "/admin/skill-evidence", label: "Skill Evidence", icon: BadgeCheck },
      { href: "/admin/badges", label: "Trust Badges", icon: Award },
    ],
  },
  {
    title: "Catalog & people",
    items: [
      { href: "/admin/providers", label: "Providers", icon: Users },
      { href: "/admin/services", label: "Services", icon: Layers },
      { href: "/admin/users", label: "Users", icon: Users },
    ],
  },
  {
    title: "Trust & safety",
    items: [
      { href: "/admin/complaints", label: "Complaints", icon: MessageSquareWarning },
      { href: "/admin/fraud", label: "Trust & Fraud", icon: Flag },
    ],
  },
];

const NAV_FOOTER: NavItem[] = [
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const NAV_FLAT = [...NAV_GROUPS.flatMap((g) => g.items), ...NAV_FOOTER];

function currentPageTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  // Longest-prefix match so nested routes (e.g. a future /admin/kyc/:id)
  // still resolve to their parent nav item's label.
  const match = NAV_FLAT.filter((n) => pathname.startsWith(n.href)).sort(
    (a, b) => b.href.length - a.href.length
  )[0];
  return match?.label ?? "Admin";
}

// Real signal, not decoration — pings the same /health route the Settings →
// Platform tab reads, once on mount. A dot instead of a poller: good enough
// to catch "API is down" without hammering the endpoint every few seconds.
function StatusIndicator() {
  const [status, setStatus] = useState<"checking" | "ok" | "down">("checking");

  useEffect(() => {
    let cancelled = false;
    api
      .systemHealth()
      .then((h) => !cancelled && setStatus(h.status === "ok" ? "ok" : "down"))
      .catch(() => !cancelled && setStatus("down"));
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") return null;

  return (
    <span
      className="hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline-flex"
      title={status === "ok" ? "API is operational" : "API is unreachable"}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "ok" ? "bg-primary" : "bg-urgent"
        )}
        aria-hidden
      />
      {status === "ok" ? "Operational" : "API unreachable"}
    </span>
  );
}

// Shared nav body — rendered once inside the fixed desktop sidebar and once
// inside the mobile drawer, so both stay in lockstep instead of drifting.
// `onNavigate` is only passed by the drawer, to close itself on tap.
function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-2.5 rounded-lg border-l-2 px-2.5 py-2 text-sm transition-all active:scale-[0.99]",
      active
        ? "border-primary bg-primary-soft font-semibold text-primary shadow-sm"
        : "border-transparent font-medium text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground"
    );

  return (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {NAV_GROUPS.map((group) => (
          <nav key={group.title} className="space-y-0.5">
            <p className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.title}
            </p>
            {group.items.map((n) => {
              const active = n.exact
                ? pathname === n.href
                : pathname.startsWith(n.href);
              const Icon = n.icon;
              return (
                <Link key={n.href} href={n.href} onClick={onNavigate} className={linkClass(active)}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        ))}
      </div>

      <nav className="shrink-0 space-y-0.5 border-t border-border p-3">
        {NAV_FOOTER.map((n) => {
          const active = pathname.startsWith(n.href);
          const Icon = n.icon;
          return (
            <Link key={n.href} href={n.href} onClick={onNavigate} className={linkClass(active)}>
              <Icon className="h-4 w-4 shrink-0" />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Close the drawer whenever the route changes (tapping a link already
  // closes it via onNavigate, but this also covers back/forward nav).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarOpen(false);
  }, [pathname]);

  // Lock page scroll and support Escape while the drawer is open — same
  // pattern as components/ui/sheet.tsx's modal.
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSidebarOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

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
    <div className="min-h-dvh bg-secondary/40">
      {/* Full-height sidebar (Linear/Vercel/Stripe-style shell) — fixed to
          the viewport edge-to-edge top-to-bottom, not sticky-within-content,
          so it reads as a permanent surface rather than page furniture that
          happens to follow the scroll. Desktop only; mobile keeps the
          horizontal tab bar in the content flow below. */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card md:flex">
        <Link
          href="/admin"
          className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 font-bold"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
            <ShieldAlert className="h-4 w-4" />
          </span>
          <span className="text-sm">
            Bishwas<span className="text-primary">Setu</span>{" "}
            <span className="text-muted-foreground">Admin</span>
          </span>
        </Link>

        <SidebarNav pathname={pathname} />
      </aside>

      {/* Mobile drawer — icon-triggered open/close, full viewport height,
          replaces the old horizontal scrolling tab row so small screens get
          the same grouped sidebar as desktop instead of a flattened list. */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity md:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />
      <aside
        className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col border-r border-border bg-card shadow-xl transition-transform duration-300 ease-in-out md:hidden"
        // Inline transform, not translate-x-0/-translate-x-full utility
        // classes — both compile to the same `--tw-translate-x` custom
        // property and raced in dev-mode Tailwind v4's layer ordering,
        // leaving the drawer stuck off-screen. An inline style always wins
        // the cascade, so it can't lose that race.
        style={{ transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)" }}
        aria-hidden={!sidebarOpen}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <Link
            href="/admin"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 font-bold"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <span className="text-sm">
              Bishwas<span className="text-primary">Setu</span>{" "}
              <span className="text-muted-foreground">Admin</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarNav pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Content column — offset by the fixed sidebar's width on desktop */}
      <div className="flex min-h-dvh flex-col md:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 shadow-sm backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4">
            {/* Hamburger + brand shown here only when the fixed sidebar is
                hidden (mobile) — opens the slide-in drawer above. */}
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="-ml-1.5 rounded-lg p-2 text-muted-foreground hover:bg-secondary md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/admin" className="flex items-center gap-2 font-bold md:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
                <ShieldAlert className="h-4 w-4" />
              </span>
            </Link>

            <h1 className="truncate text-sm font-semibold text-foreground">
              {currentPageTitle(pathname)}
            </h1>

            <div className="ml-auto flex items-center gap-2">
              <StatusIndicator />
              <Link
                href="/"
                target="_blank"
                className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground sm:inline-flex"
              >
                View site <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="relative">
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

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
