"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, BellOff } from "lucide-react";
import { useNotifications } from "@/context/notification-context";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function NotificationBell({ className }: { className?: string }) {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) markAllRead();
        }}
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
        className={cn(
          "relative rounded-full p-2 hover:bg-secondary",
          className
        )}
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-urgent px-1 text-[10px] font-bold leading-none text-urgent-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 z-20 mt-2 max-h-96 w-80 overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-lg">
            <p className="px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Notifications
            </p>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <BellOff className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Nothing yet — updates on your bookings and messages will show up here.
                </p>
              </div>
            ) : (
              <ul className="space-y-0.5">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-secondary",
                        !n.read && "bg-primary-soft/50"
                      )}
                    >
                      <p className="font-semibold text-foreground">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/80">
                        {relativeTime(n.createdAt)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
