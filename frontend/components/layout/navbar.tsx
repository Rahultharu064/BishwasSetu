"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, ShieldCheck, ChevronDown, LogOut, LayoutDashboard, CalendarCheck, UserCog } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const NAV_LINKS = [{ href: "/services", label: "Browse services" }];

export function Navbar() {
  const { user, bootstrapping, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  const homeHref =
    user?.role === "ADMIN" || user?.role === "MODERATOR"
      ? "/admin"
      : user?.role === "PROVIDER"
      ? "/provider/dashboard"
      : "/bookings";

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-4.5 w-4.5" />
          </span>
          <span className="text-[15px] font-bold">BishwasSetu</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                pathname.startsWith(link.href) && "bg-secondary text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          {user?.role === "CUSTOMER" && (
            <Link
              href="/bookings"
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                pathname.startsWith("/bookings") && "bg-secondary text-foreground"
              )}
            >
              My bookings
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {bootstrapping ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-secondary" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 transition-colors hover:bg-secondary"
              >
                <Avatar name={user.name || user.role} size="sm" />
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-popover p-1.5 shadow-[var(--shadow-lifted)]">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-medium">{user.name || "Your account"}</p>
                    <p className="text-xs capitalize text-muted-foreground">{user.role.toLowerCase()}</p>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <MenuLink href={homeHref} icon={LayoutDashboard}>
                    {user.role === "PROVIDER" ? "Dashboard" : user.role === "CUSTOMER" ? "My bookings" : "Admin panel"}
                  </MenuLink>
                  {user.role === "PROVIDER" && (
                    <MenuLink href="/provider/kyc" icon={UserCog}>
                      Verification (KYC)
                    </MenuLink>
                  )}
                  {user.role === "CUSTOMER" && (
                    <MenuLink href="/bookings" icon={CalendarCheck}>
                      My bookings
                    </MenuLink>
                  )}
                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/8"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-secondary">
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href={homeHref} className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-secondary">
                  {user.role === "PROVIDER" ? "Dashboard" : user.role === "CUSTOMER" ? "My bookings" : "Admin panel"}
                </Link>
                <button onClick={handleLogout} className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/8">
                  Log out
                </button>
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button className="w-full">Get started</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-secondary">
      <Icon className="h-4 w-4 text-muted-foreground" />
      {children}
    </Link>
  );
}
