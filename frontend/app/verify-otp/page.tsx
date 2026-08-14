"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquareLock } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { useLang } from "@/context/language-context";
import { Button } from "@/components/ui/button";

const RESEND_COOLDOWN_SECONDS = 30;

function cooldownKey(userId: string) {
  return `bs_otp_cooldown_${userId}`;
}

/** Deadline persisted in sessionStorage — a page refresh shouldn't reset
 *  the throttle, otherwise it's not a throttle. */
function armCooldown(userId: string, seconds: number) {
  if (typeof window === "undefined" || !userId) return;
  sessionStorage.setItem(cooldownKey(userId), String(Date.now() + seconds * 1000));
}

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { setSession } = useAuth();
  const { toast } = useToast();
  const { tr } = useLang();

  const userId = params.get("userId") ?? "";
  const channel = params.get("channel") ?? "your device";
  const next = params.get("next") || "/";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  useEffect(() => {
    if (!userId) router.replace("/login");
  }, [userId, router]);

  // Restore (or start) the cooldown deadline once we know who this is —
  // reflects a still-active throttle across refresh instead of granting a
  // fresh 30s every time the page reloads.
  useEffect(() => {
    if (!userId) return;
    const stored = Number(sessionStorage.getItem(cooldownKey(userId)) ?? 0);
    const remaining = Math.ceil((stored - Date.now()) / 1000);
    if (remaining > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCooldown(remaining);
    } else {
      armCooldown(userId, RESEND_COOLDOWN_SECONDS);
    }
  }, [userId]);

  function setDigit(i: number, val: string) {
    const clean = val.replace(/\D/g, "");
    if (!clean && val !== "") return;
    const nextDigits = [...digits];
    if (clean.length > 1) {
      // paste
      clean.split("").slice(0, 6).forEach((d, k) => (nextDigits[k] = d));
      setDigits(nextDigits);
      inputs.current[Math.min(clean.length, 5)]?.focus();
      return;
    }
    nextDigits[i] = clean;
    setDigits(nextDigits);
    if (clean && i < 5) inputs.current[i + 1]?.focus();
  }

  function onKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[i] && i > 0)
      inputs.current[i - 1]?.focus();
  }

  async function submit(ev?: React.FormEvent) {
    ev?.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setError(tr("auth.verifyOtp.errCode"));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.verifyOtp({ userId, code });
      setSession(res.accessToken, res.user);
      toast(tr("auth.verifyOtp.toastVerified"), "success");
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tr("auth.verifyOtp.errFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (resending || cooldown > 0) return;
    setResending(true);
    setError(null);
    try {
      await api.resendOtp({ userId });
      setDigits(Array(6).fill(""));
      inputs.current[0]?.focus();
      armCooldown(userId, RESEND_COOLDOWN_SECONDS);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast(tr("auth.verifyOtp.toastResent"), "info");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : tr("auth.verifyOtp.errResendFailed"), "error");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <MessageSquareLock className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{tr("auth.verifyOtp.heading")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tr("auth.verifyOtp.subtitle", { channel })}
        </p>
      </div>

      <form onSubmit={submit}>
        <div className="flex justify-center gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              inputMode="numeric"
              maxLength={6}
              aria-label={`Digit ${i + 1}`}
              className="tabular h-14 w-12 rounded-lg border border-input bg-card text-center text-xl font-bold focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          ))}
        </div>
        {error && (
          <p className="mt-3 text-center text-sm text-urgent" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" full size="lg" className="mt-6" disabled={loading}>
          {loading ? tr("auth.verifyOtp.verifying") : tr("auth.verifyOtp.verify")}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        {tr("auth.verifyOtp.didntGetIt")}{" "}
        {cooldown > 0 ? (
          <span className="tabular">{tr("auth.verifyOtp.resendIn", { seconds: cooldown })}</span>
        ) : (
          <button
            onClick={resend}
            disabled={resending}
            className="font-semibold text-primary hover:underline disabled:pointer-events-none disabled:opacity-60"
          >
            {resending ? tr("auth.verifyOtp.sending") : tr("auth.verifyOtp.resendCode")}
          </button>
        )}
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}
