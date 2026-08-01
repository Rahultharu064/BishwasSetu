"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  MapPin,
  LocateFixed,
  Mail,
  Phone,
  User,
  ArrowRight,
  LogIn,
  Eye,
  EyeOff,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/context/toast-context";
import { FieldError } from "@/components/ui/input";
import { GoogleLoginButton } from "@/components/auth/google-login-button";

function RegisterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const defaultRole = params.get("role") === "provider" ? "PROVIDER" : "CUSTOMER";

  const [role, setRole] = useState<"CUSTOMER" | "PROVIDER">(defaultRole);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    district: "",
    city: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      toast("Location isn't available on this device.", "error");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocating(false);
        toast("Location captured — we'll match the nearest pros.", "success");
      },
      () => {
        setLocating(false);
        toast("Couldn't get your location. Enter your district instead.", "error");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Enter your full name.";
    if (!form.email && !form.phone) e.email = "Provide an email or phone number.";
    if (form.email && !/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      e.email = "Enter a valid email address.";
    if (form.phone && !/^(\+977)?[9][6-9]\d{8}$/.test(form.phone))
      e.phone = "Enter a valid Nepal mobile number.";
    if (form.password.length < 8) e.password = "At least 8 characters.";
    if (form.district.trim().length < 2) e.district = "Enter your district.";
    if (form.city.trim().length < 2) e.city = "Enter your city / town.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.register({
        name: form.name.trim(),
        email: form.email || undefined,
        phone: form.phone || undefined,
        password: form.password,
        role,
        district: form.district.trim() || undefined,
        city: form.city.trim() || undefined,
        latitude: coords?.lat,
        longitude: coords?.lon,
      });
      toast("Account created — verify the code we sent you.", "success");
      const channel = form.email ? "email" : "phone";
      router.push(
        `/verify-otp?userId=${res.userId}&channel=${channel}&next=${
          role === "PROVIDER" ? "/provider/onboarding" : "/"
        }`
      );
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Registration failed.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] px-4 py-10">
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

          <div className="px-8 py-7">
            {/* Brand lockup inside card */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative h-14 w-14 mb-3">
                <div className="absolute inset-0 rounded-full bg-[#0E7C5B]/10 blur-sm" />
                <Image
                  src="/LOGO.png"
                  alt="BishwasSetu"
                  width={56}
                  height={56}
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
                  Bridge of Trust
                </span>
                <div className="h-px w-6 bg-[#e7e7e1]" />
              </div>
            </div>

            {/* Heading */}
            <div className="mb-5 text-center">
              <h2 className="text-xl font-bold text-[#1a1d1c]">Create Account</h2>
              <p className="mt-1 text-sm text-[#6b7280]">Join Nepal&apos;s trusted home services platform</p>
            </div>

            {/* Role selector */}
            <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-xl border border-[#e7e7e1] bg-[#f1f1ec] p-1">
              {(["CUSTOMER", "PROVIDER"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    role === r
                      ? "bg-[#0E7C5B] text-white shadow-sm shadow-[#0E7C5B]/30"
                      : "text-[#6b7280] hover:text-[#1a1d1c]"
                  }`}
                >
                  {r === "CUSTOMER" ? (
                    <UserCheck className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <Briefcase className="h-3.5 w-3.5 shrink-0" />
                  )}
                  {r === "CUSTOMER" ? "Need a service" : "I'm a provider"}
                </button>
              ))}
            </div>

            {/* Google Sign In */}
            <GoogleLoginButton next={role === "PROVIDER" ? "/provider/onboarding" : "/"} />

            <div className="mt-5 mb-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#e7e7e1]" />
              <span className="text-[10px] font-bold text-[#9ca39f] uppercase tracking-wider">
                Or register with
              </span>
              <div className="flex-1 h-px bg-[#e7e7e1]" />
            </div>

            <form onSubmit={submit} className="space-y-3.5" noValidate>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-[#1a1d1c] mb-1.5">
                  Full Name
                </label>
                <div className="flex items-center overflow-hidden rounded-xl border border-[#e7e7e1] bg-[#fafaf7] transition-all duration-200 focus-within:border-[#0E7C5B] focus-within:ring-2 focus-within:ring-[#0E7C5B]/15 focus-within:bg-white">
                  <div className="flex items-center justify-center w-11 shrink-0 border-r border-[#e7e7e1]">
                    <User className="h-4 w-4 text-[#0E7C5B]" />
                  </div>
                  <input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ram Bahadur Thapa"
                    autoComplete="name"
                    className="flex-1 bg-transparent px-3 py-3 text-sm text-[#1a1d1c] placeholder:text-[#9ca39f] outline-none"
                  />
                </div>
                <FieldError>{errors.name}</FieldError>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-[#1a1d1c] mb-1.5">
                  Phone Number
                </label>
                <div className="flex items-center overflow-hidden rounded-xl border border-[#e7e7e1] bg-[#fafaf7] transition-all duration-200 focus-within:border-[#0E7C5B] focus-within:ring-2 focus-within:ring-[#0E7C5B]/15 focus-within:bg-white">
                  <div className="flex items-center justify-center w-11 shrink-0 border-r border-[#e7e7e1]">
                    <Phone className="h-4 w-4 text-[#0E7C5B]" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    autoComplete="tel"
                    className="flex-1 bg-transparent px-3 py-3 text-sm text-[#1a1d1c] placeholder:text-[#9ca39f] outline-none"
                  />
                </div>
                <FieldError>{errors.phone}</FieldError>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#1a1d1c] mb-1.5">
                  Email{" "}
                  <span className="text-[#9ca39f] font-normal text-xs">(optional)</span>
                </label>
                <div className="flex items-center overflow-hidden rounded-xl border border-[#e7e7e1] bg-[#fafaf7] transition-all duration-200 focus-within:border-[#0E7C5B] focus-within:ring-2 focus-within:ring-[#0E7C5B]/15 focus-within:bg-white">
                  <div className="flex items-center justify-center w-11 shrink-0 border-r border-[#e7e7e1]">
                    <Mail className="h-4 w-4 text-[#0E7C5B]" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="flex-1 bg-transparent px-3 py-3 text-sm text-[#1a1d1c] placeholder:text-[#9ca39f] outline-none"
                  />
                </div>
                <FieldError>{errors.email}</FieldError>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[#1a1d1c] mb-1.5">
                  Password
                </label>
                <div className="flex items-center overflow-hidden rounded-xl border border-[#e7e7e1] bg-[#fafaf7] transition-all duration-200 focus-within:border-[#0E7C5B] focus-within:ring-2 focus-within:ring-[#0E7C5B]/15 focus-within:bg-white">
                  <div className="flex items-center justify-center w-11 shrink-0 border-r border-[#e7e7e1]">
                    <Lock className="h-4 w-4 text-[#0E7C5B]" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
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
                <FieldError>{errors.password}</FieldError>
              </div>

              {/* Location */}
              <div className="rounded-xl border border-[#e7e7e1] bg-[#f1f1ec]/60 p-3.5">
                <div className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-[#1a1d1c]">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0E7C5B]/10">
                    <MapPin className="h-3.5 w-3.5 text-[#0E7C5B]" />
                  </div>
                  {role === "CUSTOMER" ? "Where do you need service?" : "Where do you work?"}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="district" className="block text-xs font-medium text-[#6b7280] mb-1">
                      District
                    </label>
                    <input
                      id="district"
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      placeholder="Kathmandu"
                      autoComplete="address-level1"
                      className="w-full rounded-lg border border-[#e7e7e1] bg-white px-3 py-2 text-sm text-[#1a1d1c] placeholder:text-[#9ca39f] outline-none focus:border-[#0E7C5B] focus:ring-2 focus:ring-[#0E7C5B]/15 transition-all"
                    />
                    <FieldError>{errors.district}</FieldError>
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-xs font-medium text-[#6b7280] mb-1">
                      City / Town
                    </label>
                    <input
                      id="city"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Maharajgunj"
                      autoComplete="address-level2"
                      className="w-full rounded-lg border border-[#e7e7e1] bg-white px-3 py-2 text-sm text-[#1a1d1c] placeholder:text-[#9ca39f] outline-none focus:border-[#0E7C5B] focus:ring-2 focus:ring-[#0E7C5B]/15 transition-all"
                    />
                    <FieldError>{errors.city}</FieldError>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={locating}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E7C5B] hover:text-[#0b6a4d] hover:underline underline-offset-2 disabled:opacity-60 transition-colors"
                >
                  <LocateFixed className="h-3.5 w-3.5" />
                  {coords
                    ? "Location captured ✓"
                    : locating
                    ? "Getting location…"
                    : "Use my current location"}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#0E7C5B] hover:bg-[#0b6a4d] active:scale-[0.98] text-white font-semibold py-3.5 text-sm transition-all duration-200 shadow-lg shadow-[#0E7C5B]/25 hover:shadow-xl hover:shadow-[#0E7C5B]/30 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                {loading ? "Creating…" : "Create Account"}
              </button>
            </form>

            {/* Trust badge */}
            <div className="mt-4 flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#0E7C5B]" />
              <span className="text-xs text-[#6b7280]">Verified & escrow-protected</span>
            </div>

            {/* Divider */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#e7e7e1]" />
              <span className="text-xs text-[#9ca39f] whitespace-nowrap">
                Already have an account?
              </span>
              <div className="flex-1 h-px bg-[#e7e7e1]" />
            </div>

            {/* Log In Button */}
            <Link
              href="/login"
              className="mt-4 w-full flex items-center justify-center gap-2.5 rounded-xl border-2 border-[#0E7C5B] text-[#0E7C5B] hover:bg-[#0E7C5B]/5 active:scale-[0.98] font-semibold py-3 text-sm transition-all duration-200"
            >
              <LogIn className="h-4 w-4" />
              Log In
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-5 text-center text-xs text-[#9ca39f]">
          Nepal&apos;s trusted home services platform
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}
