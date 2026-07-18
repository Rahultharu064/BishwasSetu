"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/shared/states";
import { AuthApi } from "@/lib/endpoints";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  );
}

function VerifyOtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setSession } = useAuth();

  const userId = params.get("userId") ?? "";
  const flow = params.get("flow") ?? "login";

  const [digits, setDigits] = React.useState<string[]>(Array(6).fill(""));
  const [submitting, setSubmitting] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resendMsg, setResendMsg] = React.useState<string | null>(null);
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (!userId) router.replace("/login");
  }, [userId, router]);

  function handleDigitChange(index: number, value: string) {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }
    const next = [...digits];
    next[index] = clean[clean.length - 1];
    setDigits(next);
    if (index < 5) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    setDigits(Array.from({ length: 6 }, (_, i) => pasted[i] ?? ""));
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const { accessToken, user } = await AuthApi.verifyOtp({ userId, code });
      setSession(accessToken, user);

      if (user.role === "ADMIN" || user.role === "MODERATOR") {
        router.push("/admin");
      } else if (user.role === "PROVIDER") {
        router.push(user.kycStatus === "INCOMPLETE" ? "/provider/onboarding" : "/provider/dashboard");
      } else {
        router.push("/services");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid or expired code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResendMsg(null);
    setError(null);
    setResending(true);
    try {
      const { message } = await AuthApi.resendOtp(userId);
      setResendMsg(message ?? "A new code has been sent.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not resend the code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell
      eyebrow="One last step"
      title="Verify it's really you."
      subtitle="A one-time code keeps your account — and every booking made under it — accountable."
    >
      <h2 className="text-2xl font-bold tracking-tight">Enter verification code</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        We sent a 6-digit code to your {flow === "register" ? "new account's" : ""} email or phone.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {error && <ErrorBanner message={error} />}
        {resendMsg && !error && (
          <p className="rounded-2xl bg-success/10 px-4 py-3 text-sm text-success">{resendMsg}</p>
        )}

        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              className={cn(
                "h-14 w-12 rounded-xl border border-input bg-card text-center text-xl font-semibold",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
              )}
            />
          ))}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={submitting}>
          Verify &amp; continue
        </Button>

        <div className="flex items-center justify-between text-sm">
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            &larr; Back
          </Link>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-medium text-primary hover:underline disabled:opacity-50"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
