"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  MapPin,
  Wallet,
  Globe,
  ShieldCheck,
  LogOut,
  ChevronRight,
  UserCircle2,
  MessageSquareWarning,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { lang, toggle } = useLang();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login?next=/account");
  }, [loading, isAuthenticated, router]);

  if (loading || !user) return null;

  const rows = [
    { href: "/bookings", icon: <CalendarCheck className="h-5 w-5" />, label: "My bookings" },
    { href: "/complaints", icon: <MessageSquareWarning className="h-5 w-5" />, label: "My complaints" },
    { href: "/account/addresses", icon: <MapPin className="h-5 w-5" />, label: "Saved addresses" },
    { href: "/account/payments", icon: <Wallet className="h-5 w-5" />, label: "Payment methods" },
    { href: "/trust-safety", icon: <ShieldCheck className="h-5 w-5" />, label: "Trust & Safety" },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* Identity */}
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
          <UserCircle2 className="h-9 w-9" />
        </span>
        <div>
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">
            {user.email || user.phone}
          </p>
          <Badge variant="soft" size="sm" className="mt-1">
            {user.role === "PROVIDER" ? "Provider" : "Customer"}
          </Badge>
        </div>
      </div>

      {user.role === "PROVIDER" && (
        <Link href="/provider" className="mt-6 block">
          <div className="flex items-center gap-3 rounded-xl bg-primary p-4 text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
            <span className="flex-1 font-semibold">Go to provider dashboard</span>
            <ChevronRight className="h-5 w-5" />
          </div>
        </Link>
      )}

      {(user.role === "ADMIN" || user.role === "MODERATOR") && (
        <Link href="/admin" className="mt-6 block">
          <div className="flex items-center gap-3 rounded-xl bg-foreground p-4 text-background">
            <ShieldCheck className="h-5 w-5" />
            <span className="flex-1 font-semibold">Open admin console</span>
            <ChevronRight className="h-5 w-5" />
          </div>
        </Link>
      )}

      {/* Menu */}
      <div className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {rows.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="flex items-center gap-3 p-4 transition-colors hover:bg-secondary"
          >
            <span className="text-primary">{r.icon}</span>
            <span className="flex-1 font-medium">{r.label}</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary"
        >
          <span className="text-primary">
            <Globe className="h-5 w-5" />
          </span>
          <span className="flex-1 font-medium">Language</span>
          <span className="text-sm font-semibold text-muted-foreground">
            {lang === "ne" ? "नेपाली" : "English"}
          </span>
        </button>
      </div>

      <Button
        variant="outline"
        full
        className="mt-6"
        onClick={async () => {
          await logout();
          router.push("/");
        }}
      >
        <LogOut className="h-4 w-4" /> Log out
      </Button>
    </div>
  );
}
