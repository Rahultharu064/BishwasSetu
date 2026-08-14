"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Lock } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { useNotifications } from "@/context/notification-context";
import { formatDateTime } from "@/lib/format";
import type { ChatThread } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { socket } = useNotifications();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated)
      router.replace(`/login?next=/messages/${bookingId}`);
  }, [authLoading, isAuthenticated, router, bookingId]);

  const req = useFetch<ChatThread>(
    () => api.messageThread(bookingId),
    [bookingId, isAuthenticated],
    // The socket below reloads the thread the instant a message arrives —
    // this poll is just a safety net for a dropped/reconnecting socket.
    { pollMs: 20000, enabled: isAuthenticated }
  );

  // Realtime: refresh the thread the moment the other party sends something,
  // instead of waiting up to 20s for the fallback poll.
  useEffect(() => {
    if (!socket) return;
    function onNewMessage(payload: { bookingId: string }) {
      if (payload.bookingId === bookingId) req.reload();
    }
    socket.on("message:new", onNewMessage);
    return () => {
      socket.off("message:new", onNewMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, bookingId]);

  const thread = req.data;
  const messages = useMemo(() => thread?.messages ?? [], [thread]);

  // Keep the newest message in view as they arrive.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await api.postMessage(bookingId, text);
      setDraft("");
      req.reload();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Couldn't send. Try again.",
        "error"
      );
    } finally {
      setSending(false);
    }
  }

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-lg flex-col px-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border py-3">
        <Link
          href="/messages"
          className="text-muted-foreground hover:text-foreground"
          aria-label="Back to messages"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        {thread ? (
          <>
            <Avatar
              src={thread.other.photo ?? undefined}
              name={thread.other.name}
              size={36}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight">
                {thread.other.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Booking #{bookingId.slice(0, 8)}
              </p>
            </div>
            {thread.other.providerId && (
              <Link
                href={`/providers/${thread.other.providerId}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                Profile
              </Link>
            )}
          </>
        ) : (
          <Skeleton className="h-9 w-40" />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto py-4">
        {req.loading && !thread ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`h-10 rounded-2xl ${i % 2 ? "ml-auto w-2/3" : "w-1/2"}`}
              />
            ))}
          </div>
        ) : req.error ? (
          <ErrorState message={req.error} onRetry={req.reload} />
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <p>No messages yet.</p>
            <p>Send the first message to coordinate the job.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${
                  m.mine
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-secondary text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    m.mine
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                  title={formatDateTime(m.createdAt)}
                >
                  {new Date(m.createdAt).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {m.mine && m.readAt ? " · Read" : ""}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      {thread && !thread.canSend ? (
        <div className="mb-3 flex items-center justify-center gap-1.5 rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" /> This conversation is closed.
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="mb-3 flex items-end gap-2 border-t border-border pt-3"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Type a message…"
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !draft.trim()}
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      )}
    </div>
  );
}
