"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, UserPlus, Eye, EyeOff, Phone } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/context/toast-context";
import { useLang } from "@/context/language-context";
import { GoogleLoginButton } from "@/components/auth/google-login-button";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const { tr } = useLang();
  const next = params.get("next") || "/";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    if (!identifier || !password) {
      setError(tr("auth.login.errFields"));
      return;
    }
    setLoading(true);
    const isEmail = identifier.includes("@");
    try {
      const res = await api.login({
        email: isEmail ? identifier : undefined,
        phone: isEmail ? undefined : identifier,
        password,
      });
      toast(tr("auth.login.toastOtpSent"), "info");
      router.push(
        `/verify-otp?userId=${res.userId}&channel=${
          isEmail ? "email" : "phone"
        }&next=${encodeURIComponent(next)}`
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tr("auth.login.errFailed"));
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
                  alt="BishwasSetu"
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
                  {tr("auth.bridgeOfTrust")}
                </span>
                <div className="h-px w-6 bg-[#e7e7e1]" />
              </div>
            </div>

            {/* Heading */}
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-[#1a1d1c]">{tr("auth.login.welcomeBack")}</h2>
              <p className="mt-1 text-sm text-[#6b7280]">{tr("auth.login.subtitle")}</p>
            </div>

            {/* Google Sign In */}
            <GoogleLoginButton next={next} />

            <div className="mt-5 mb-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#e7e7e1]" />
              <span className="text-[10px] font-bold text-[#9ca39f] uppercase tracking-wider">
                {tr("auth.orContinueWith")}
              </span>
              <div className="flex-1 h-px bg-[#e7e7e1]" />
            </div>

            <form onSubmit={submit} className="space-y-4" noValidate>

              {/* Email / Phone field */}
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-semibold text-[#1a1d1c] mb-1.5"
                >
                  {tr("auth.login.emailAddressLabel")}
                </label>
                <div
                  className="flex items-center overflow-hidden rounded-xl border border-[#e7e7e1] bg-[#fafaf7] transition-all duration-200 focus-within:border-[#0E7C5B] focus-within:ring-2 focus-within:ring-[#0E7C5B]/15 focus-within:bg-white"
                >
                  <div className="flex items-center justify-center w-11 shrink-0 border-r border-[#e7e7e1]">
                    <Mail className="h-4 w-4 text-[#0E7C5B]" />
                  </div>
                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={tr("auth.login.emailPlaceholder")}
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
                  {tr("auth.login.passwordLabel")}
                </label>
                <div
                  className="flex items-center overflow-hidden rounded-xl border border-[#e7e7e1] bg-[#fafaf7] transition-all duration-200 focus-within:border-[#0E7C5B] focus-within:ring-2 focus-within:ring-[#0E7C5B]/15 focus-within:bg-white"
                >
                  <div className="flex items-center justify-center w-11 shrink-0 border-r border-[#e7e7e1]">
                    <Lock className="h-4 w-4 text-[#0E7C5B]" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tr("auth.login.passwordPlaceholder")}
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
                {loading ? tr("auth.login.sendingCode") : tr("auth.login.signIn")}
              </button>
            </form>

            {/* Forgot password */}
            <div className="mt-4 text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-[#0E7C5B] hover:text-[#0b6a4d] font-medium hover:underline underline-offset-2 transition-colors"
              >
                {tr("auth.login.forgotPassword")}
              </Link>
            </div>

            {/* Divider */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#e7e7e1]" />
              <span className="text-xs text-[#9ca39f] whitespace-nowrap">
                {tr("auth.login.noAccount")}
              </span>
              <div className="flex-1 h-px bg-[#e7e7e1]" />
            </div>

            {/* Create Account Button */}
            <Link
              href="/register"
              className="mt-4 w-full flex items-center justify-center gap-2.5 rounded-xl border-2 border-[#0E7C5B] text-[#0E7C5B] hover:bg-[#0E7C5B]/5 active:scale-[0.98] font-semibold py-3 text-sm transition-all duration-200"
            >
              <UserPlus className="h-4 w-4" />
              {tr("auth.login.createAccount")}
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-5 text-center text-xs text-[#9ca39f]">
          {tr("auth.footerTagline")}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
