"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput, Label, FieldError } from "@/components/ui/input";

// Deliberately separate from /login: staff accounts are never publicly
// registered and don't go through OTP 2FA (see backend adminAuthRoute.ts) —
// this page reflects that with a direct email+password submit and no
// "create an account" link. Lives outside app/admin/ on purpose so it isn't
// wrapped by admin/layout.tsx's own auth gate (that would redirect here in
// a loop before this page ever got a chance to render).
function AdminLoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, isAuthenticated, setSession } = useAuth();
  const next = params.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Already signed in as staff — skip straight through.
  useEffect(() => {
    if (isAuthenticated && (user?.role === "ADMIN" || user?.role === "MODERATOR")) {
      router.replace(next);
    }
  }, [isAuthenticated, user, next, router]);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.adminLogin({ email, password });
      setSession(res.accessToken, res.user);
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Staff sign-in — credentials only, no OTP.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@bishwasetu.com"
            autoComplete="username"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
          />
        </div>
        <FieldError>{error}</FieldError>
        <Button type="submit" full size="lg" disabled={loading}>
          {loading ? "Signing in…" : "Log in"}
        </Button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginInner />
    </Suspense>
  );
}
