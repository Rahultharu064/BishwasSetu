"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarCheck, Zap, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Customer bottom tab bar (ux.md §4.1) — one-thumb, one-hand (P3)
const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/emergency", label: "Emergency", icon: Zap, center: true },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/account", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 px-2">
        {TABS.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          if (tab.center) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center py-1"
              >
                <span className="animate-urgent-pulse -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-urgent text-urgent-foreground shadow-lg">
                  <Icon className="h-6 w-6" fill="currentColor" />
                </span>
                <span className="mt-0.5 text-[10px] font-semibold text-urgent">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
