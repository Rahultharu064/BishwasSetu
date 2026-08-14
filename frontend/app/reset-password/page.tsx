"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/context/toast-context";
import { Button } from "@/components/ui/button";
import { PasswordInput, Label, FieldError } from "@/components/ui/input";

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();

  const userId = params.get("userId") ?? "";
  const channel = params.get("channel") ?? "your device";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!userId) router.replace("/forgot-password");
  }, [userId, router]);

  function setDigit(i: number, val: string) {
    const clean = val.replace(/\D/g, "");
    if (!clean && val !== "") return;
    const nextDigits = [...digits];
    if (clean.length > 1) {
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("New password and confirmation don't match.");
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword({ userId, code, newPassword });
      toast("Password reset. Please sign in.", "success");
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't reset your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Enter your code</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a 6-digit code to your {channel}. It expires shortly, so
          finish resetting your password now.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5" noValidate>
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

        <div>
          <Label htmlFor="new-password">New password</Label>
          <PasswordInput
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </div>
        <div>
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <PasswordInput
            id="confirm-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <FieldError>{error}</FieldError>
        <Button type="submit" full size="lg" disabled={loading}>
          {loading ? "Resetting…" : "Reset password"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
