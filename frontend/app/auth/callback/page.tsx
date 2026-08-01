"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/context/toast-context";
import type { User } from "@/lib/types";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const { toast } = useToast();

  const stateParam = searchParams.get("state") || "/";
  const errorParam = searchParams.get("error");

  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    if (errorParam) {
      toast("Authentication failed. Please try again.", "error");
      router.replace("/login");
      return;
    }

    async function handleAuth() {
      try {
        // Backend has set an HttpOnly refreshToken cookie during the Google callback redirect.
        // Call /auth/refresh — it reads the cookie and returns a new accessToken + user profile.
        const res = await apiRequest<{ accessToken: string; user: User }>(
          "/auth/refresh",
          { method: "POST" }
        );

        if (res?.accessToken && res?.user) {
          setSession(res.accessToken, res.user);
          toast("Signed in with Google! Welcome.", "success");

          if (stateParam && stateParam !== "/") {
            router.replace(stateParam);
          } else if (res.user.role === "PROVIDER") {
            router.replace("/provider/dashboard");
          } else if (
            res.user.role === "ADMIN" ||
            res.user.role === "MODERATOR"
          ) {
            router.replace("/admin");
          } else {
            router.replace("/account");
          }
        } else {
          throw new Error("Invalid response from server");
        }
      } catch {
        toast("Authentication failed. Please try again.", "error");
        router.replace("/login");
      }
    }

    handleAuth();
  }, [router, searchParams, setSession, toast, errorParam, stateParam]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafaf7] px-4">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#0E7C5B]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#F15A24]/5 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-5 text-center">
        {/* Spinner */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-[#0E7C5B]/10" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#0E7C5B] animate-spin" />
          {/* Google G inside */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="h-6 w-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l2.85-2.22.83-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold text-[#1a1d1c]">Signing you in…</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Setting up your session. You&apos;ll be redirected shortly.
          </p>
        </div>

        {/* Branding */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-px w-8 bg-[#e7e7e1]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#9ca39f]">
            BishwasSetu
          </span>
          <div className="h-px w-8 bg-[#e7e7e1]" />
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackInner />
    </Suspense>
  );
}
