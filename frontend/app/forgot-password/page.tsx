"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/context/toast-context";
import { useLang } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

function ForgotPasswordInner() {
  const router = useRouter();
  const { toast } = useToast();
  const { tr } = useLang();

  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!identifier.trim()) {
      setError(tr("auth.forgotPassword.errEmpty"));
      return;
    }
    setLoading(true);
    const isEmail = identifier.includes("@");
    try {
      const res = await api.forgotPassword({
        email: isEmail ? identifier.trim() : undefined,
        phone: isEmail ? undefined : identifier.trim(),
      });
      toast(tr("auth.forgotPassword.toastSent"), "info");
      router.push(
        `/reset-password?userId=${res.userId}&channel=${
          isEmail ? "email" : "phone"
        }`
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tr("auth.forgotPassword.errFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{tr("auth.forgotPassword.heading")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tr("auth.forgotPassword.subtitle")}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="identifier">{tr("auth.forgotPassword.label")}</Label>
          <Input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={tr("auth.forgotPassword.placeholder")}
            autoComplete="username"
            autoFocus
          />
        </div>
        <FieldError>{error}</FieldError>
        <Button type="submit" full size="lg" disabled={loading}>
          {loading ? tr("auth.forgotPassword.sending") : tr("auth.forgotPassword.send")}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        {tr("auth.forgotPassword.rememberedIt")}{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {tr("auth.forgotPassword.backToSignIn")}
        </Link>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordInner />
    </Suspense>
  );
}
