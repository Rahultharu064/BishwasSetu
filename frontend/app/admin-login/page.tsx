"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

// Deliberately separate from /login: staff accounts are never publicly
// registered and don't go through OTP 2FA (see backend adminAuthRoute.ts) —
// this page reflects that with a direct email+password submit and no
// "create an account" link. Lives outside app/admin/ on purpose so it isn't
// wrapped by admin/layout.tsx's own auth gate.
function AdminLoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, isAuthenticated, setSession } = useAuth();
  const next = params.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] px-4 py-12">
      {/* Subtle decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#0E7C5B]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#F15A24]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl border border-[#e7e7e1] bg-white shadow-2xl shadow-black/8 overflow-hidden">
          {/* Card top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-[#0E7C5B] via-[#16a57a] to-[#F15A24]" />

          <div className="px-8 py-8">
            {/* Brand lockup inside card */}
            <div className="flex flex-col items-center mb-7">
              <div className="relative h-16 w-16 mb-3">
                <div className="absolute inset-0 rounded-full bg-[#0E7C5B]/10 blur-sm" />
                <Image
                  src="/LOGO.png"
                  alt="BishwasSetu Logo"
                  width={64}
                  height={64}
                  className="relative h-full w-full object-contain"
                  priority
                />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight leading-none">
                <span className="text-[#0E7C5B]">Bishwas</span>
                <span className="text-[#F15A24]">Setu</span>
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="h-px w-6 bg-[#e7e7e1]" />
                <span className="text-[9px] font-bold text-[#9ca39f] uppercase tracking-[0.25em]">
                  Admin Console
                </span>
                <div className="h-px w-6 bg-[#e7e7e1]" />
              </div>
            </div>

            {/* Heading */}
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-[#1a1d1c]">Staff Access</h2>
              <p className="mt-1 text-sm text-[#6b7280]">
                Sign in with your admin credentials
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4" noValidate>
              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-[#1a1d1c] mb-1.5"
                >
                  Email Address
                </label>
                <div className="flex items-center overflow-hidden rounded-xl border border-[#e7e7e1] bg-[#fafaf7] transition-all duration-200 focus-within:border-[#0E7C5B] focus-within:ring-2 focus-within:ring-[#0E7C5B]/15 focus-within:bg-white">
                  <div className="flex items-center justify-center w-11 shrink-0 border-r border-[#e7e7e1]">
                    <Mail className="h-4 w-4 text-[#0E7C5B]" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@bishwasetu.com"
                    autoComplete="username"
                    className="flex-1 bg-transparent px-3 py-3 text-sm text-[#1a1d1c] placeholder:text-[#9ca39f] outline-none"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#1a1d1c] mb-1.5"
                >
                  Password
                </label>
                <div className="flex items-center overflow-hidden rounded-xl border border-[#e7e7e1] bg-[#fafaf7] transition-all duration-200 focus-within:border-[#0E7C5B] focus-within:ring-2 focus-within:ring-[#0E7C5B]/15 focus-within:bg-white">
                  <div className="flex items-center justify-center w-11 shrink-0 border-r border-[#e7e7e1]">
                    <Lock className="h-4 w-4 text-[#0E7C5B]" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="flex-1 bg-transparent px-3 py-3 text-sm text-[#1a1d1c] placeholder:text-[#9ca39f] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 text-[#9ca39f] hover:text-[#0E7C5B] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="rounded-lg bg-[#fdece7] border border-[#F15A24]/20 px-3 py-2.5">
                  <p className="text-sm text-[#e8542f] font-medium">{error}</p>
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#0E7C5B] hover:bg-[#0b6a4d] active:scale-[0.98] text-white font-semibold py-3.5 text-sm transition-all duration-200 shadow-lg shadow-[#0E7C5B]/25 hover:shadow-xl hover:shadow-[#0E7C5B]/30 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                {loading ? "Signing in…" : "Log in to Console"}
              </button>
            </form>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-5 text-center text-xs text-[#9ca39f]">
          Restricted access — authorized personnel only
        </p>
      </div>
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
