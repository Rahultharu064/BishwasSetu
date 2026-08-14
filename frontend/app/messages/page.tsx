"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, Lock, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/language-context";
import { relativeTime } from "@/lib/format";
import type { Conversation } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";

function conversationsFrom(data: unknown): Conversation[] {
  if (data && typeof data === "object" && "conversations" in data) {
    const c = (data as { conversations?: Conversation[] }).conversations;
    if (Array.isArray(c)) return c;
  }
  return [];
}

export default function MessagesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { tr } = useLang();

  useEffect(() => {
    if (!authLoading && !isAuthenticated)
      router.replace("/login?next=/messages");
  }, [authLoading, isAuthenticated, router]);

  const req = useFetch(() => api.conversations(), [isAuthenticated], {
    pollMs: 15000,
    enabled: isAuthenticated,
  });
  const conversations = useMemo(() => conversationsFrom(req.data), [req.data]);

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">{tr("messages.list.heading")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {tr("messages.list.subtitle")}
      </p>

      <div className="mt-6">
        {req.loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : req.error ? (
          <ErrorState message={req.error} onRetry={req.reload} />
        ) : conversations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <MessageCircle className="h-6 w-6" />
            </div>
            <p className="mt-3 font-semibold">{tr("messages.list.emptyTitle")}</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              {tr("messages.list.emptyDesc")}
            </p>
            <Link href="/services" className="mt-4 inline-block">
              <Button variant="soft" size="sm">
                {tr("messages.list.bookService")}
              </Button>
            </Link>
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> {tr("messages.list.noPreBookingDms")}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {conversations.map((c) => (
              <li key={c.bookingId}>
                <Link
                  href={`/messages/${c.bookingId}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/40"
                >
                  <div className="relative">
                    <Avatar
                      src={c.other.photo ?? undefined}
                      name={c.other.name}
                      size={44}
                    />
                    {c.unread > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-urgent px-1 text-[11px] font-bold text-urgent-foreground">
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-semibold">{c.other.name}</p>
                      {c.lastMessage && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {relativeTime(c.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p
                      className={`truncate text-sm ${
                        c.unread > 0
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {c.lastMessage
                        ? `${c.lastMessage.mine ? tr("messages.list.youPrefix") : ""}${c.lastMessage.body}`
                        : `${c.category ?? tr("messages.list.bookingFallback")} ${tr("messages.list.sayHello")}`}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
