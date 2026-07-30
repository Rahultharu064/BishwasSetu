"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X, Send, Bot, User, WifiOff } from "lucide-react";
import { streamAssistantChat } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

type ContextType = "booking" | "provider" | "complaint" | "credits" | "general";

const GUEST_SUGGESTIONS = [
  "What is BishwasSetu?",
  "How does it work?",
  "Is my payment safe?",
];
const CUSTOMER_SUGGESTIONS = [
  "How does escrow protect me?",
  "What is a trust score?",
  "How do I file a complaint?",
];
const PROVIDER_SUGGESTIONS = [
  "What's my trust score?",
  "How do credits work?",
  "How do I get verified?",
];

function newSessionId() {
  return `web_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const UUID_RE = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

/**
 * Scope the assistant's live context to whatever page (and, for credits,
 * whichever user) the visitor is actually on — the backend only ever
 * returns data the signed-in user is authorized to see (see
 * assistantContext.ts), this just decides what's worth asking for.
 */
function contextForRoute(
  pathname: string,
  providerId?: string | null
): { contextType: ContextType; contextId?: string } {
  const booking = pathname.match(new RegExp(`^/bookings/(${UUID_RE})$`, "i"));
  if (booking) return { contextType: "booking", contextId: booking[1] };

  const complaint = pathname.match(new RegExp(`^/complaints/(${UUID_RE})$`, "i"));
  if (complaint) return { contextType: "complaint", contextId: complaint[1] };

  const provider = pathname.match(new RegExp(`^/providers/(${UUID_RE})`, "i"));
  if (provider) return { contextType: "provider", contextId: provider[1] };

  if (pathname.startsWith("/provider") && providerId)
    return { contextType: "credits", contextId: providerId };

  return { contextType: "general" };
}

export function AssistantWidget() {
  const pathname = usePathname();
  const { user } = useAuth();
  const suggestions = !user
    ? GUEST_SUGGESTIONS
    : user.role === "PROVIDER"
      ? PROVIDER_SUGGESTIONS
      : CUSTOMER_SUGGESTIONS;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionId = useRef<string>(newSessionId());
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, streaming]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    setError(null);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: trimmed }, { role: "assistant", content: "" }]);
    setStreaming(true);

    abortRef.current = new AbortController();
    await streamAssistantChat(
      {
        message: trimmed,
        sessionId: sessionId.current,
        ...contextForRoute(pathname, user?.providerId),
      },
      {
        onToken: (t) =>
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = {
              role: "assistant",
              content: copy[copy.length - 1].content + t,
            };
            return copy;
          }),
        onDone: () => setStreaming(false),
        onError: (msg) => {
          setStreaming(false);
          setError(msg);
          setMessages((m) => {
            // Drop the empty assistant bubble if nothing streamed.
            const copy = [...m];
            if (copy[copy.length - 1]?.content === "") copy.pop();
            return copy;
          });
        },
      },
      abortRef.current.signal
    );
  }

  return (
    <>
      {/* FAB — persistent on all screens (ux.md §11) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open assistant"
          className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 md:bottom-6"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-end sm:justify-end sm:p-6">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm sm:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-label="AI Assistant"
            className="relative flex h-[80vh] w-full flex-col rounded-t-2xl bg-card shadow-lg sm:h-[600px] sm:max-w-sm sm:rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-border p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Bot className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-semibold leading-tight">Setu Assistant</p>
                <p className="text-xs text-muted-foreground">
                  Ask about bookings, trust &amp; safety
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="py-6 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <Sparkles className="h-6 w-6" />
                  </span>
                  <p className="mt-3 text-sm font-medium">How can I help?</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    I can explain how BishwasSetu works — in English or नेपाली.
                  </p>
                  {!user && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Sign in for help with your own bookings.
                    </p>
                  )}
                  <div className="mt-4 flex flex-col gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-secondary"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2",
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                      m.role === "user"
                        ? "bg-secondary text-foreground"
                        : "bg-primary-soft text-primary"
                    )}
                  >
                    {m.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </span>
                  <div
                    className={cn(
                      "max-w-[75%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    )}
                  >
                    {m.content ||
                      (streaming && i === messages.length - 1 ? (
                        <span className="inline-flex gap-1">
                          <Dot delay={0} />
                          <Dot delay={150} />
                          <Dot delay={300} />
                        </span>
                      ) : (
                        ""
                      ))}
                  </div>
                </div>
              ))}

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-warning-soft p-3 text-sm text-warning">
                  <WifiOff className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question…"
                aria-label="Message"
                className="h-11 flex-1 rounded-full border border-input bg-background px-4 text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
                aria-label="Send"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
