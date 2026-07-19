"use client";

import { Calendar, Home, MessageCircle, User, Zap } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const tabs = [
  { key: "home", label: "Home", icon: Home, fab: false },
  { key: "bookings", label: "Bookings", icon: Calendar, fab: false },
  { key: "emergency", label: "Emergency", icon: Zap, fab: true },
  { key: "messages", label: "Messages", icon: MessageCircle, fab: false },
  { key: "profile", label: "Profile", icon: User, fab: false },
] as const;

export function BottomNav() {
  const [active, setActive] = useState<string>("home");

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 sm:hidden"
    >
      <div className="mx-auto flex h-16 max-w-md items-end justify-between px-2 pb-1.5">
        {tabs.map(({ key, label, icon: Icon, fab }) => {
          const isActive = active === key;

          if (fab) {
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className="-mt-6 flex size-14 shrink-0 items-center justify-center rounded-full bg-accent-urgent text-accent-urgent-foreground shadow-lg transition-transform active:scale-95"
              >
                <Icon className="size-6 fill-current" aria-hidden />
              </button>
            );
          }

          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-w-11 flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
