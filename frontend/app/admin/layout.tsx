"use client";

import { useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/kyc", label: "Verification Queue", icon: ClipboardCheck },
  { href: "/admin/skill-evidence", label: "Skill Evidence", icon: BadgeCheck },
  { href: "/admin/badges", label: "Trust Badges", icon: Award },
  { href: "/admin/providers", label: "Providers", icon: Users },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/complaints", label: "Complaints", icon: MessageSquareWarning },
  { href: "/admin/fraud", label: "Trust & Fraud", icon: Flag },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <div>
          <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {loading ? "Checking access…" : "Admin access required."}
          </p>
        </div>
      </div>
    );

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
      {/* Sidebar (ux.md §4.3) */}
      <aside className="sticky top-20 hidden h-fit w-56 shrink-0 md:block">
        <div className="mb-3 flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
            <ShieldAlert className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold">Admin Console</span>
        </div>
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
      <div className="w-full min-w-0">
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
      </div>
    </div>
  );
}
