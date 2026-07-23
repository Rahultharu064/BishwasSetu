"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Lock } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/context/toast-context";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

function RegisterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const defaultRole = params.get("role") === "provider" ? "PROVIDER" : "CUSTOMER";

  const [role, setRole] = useState<"CUSTOMER" | "PROVIDER">(defaultRole);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Enter your full name.";
    if (!form.email && !form.phone) e.email = "Provide an email or phone number.";
    if (form.email && !/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      e.email = "Enter a valid email address.";
    if (form.phone && !/^(\+977)?[9][6-9]\d{8}$/.test(form.phone))
      e.phone = "Enter a valid Nepal mobile number.";
    if (form.password.length < 8) e.password = "At least 8 characters.";
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
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join Nepal&apos;s trusted home services platform.
        </p>
      </div>

      {/* Role selector */}
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-border bg-secondary p-1">
        {(["CUSTOMER", "PROVIDER"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
              role === r
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {r === "CUSTOMER" ? "I need a service" : "I'm a provider"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ram Bahadur Thapa"
            autoComplete="name"
          />
          <FieldError>{errors.name}</FieldError>
        </div>
        <div>
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="98XXXXXXXX"
            autoComplete="tel"
          />
          <FieldError>{errors.phone}</FieldError>
        </div>
        <div>
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <FieldError>{errors.email}</FieldError>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
          <FieldError>{errors.password}</FieldError>
        </div>

        <Button type="submit" full size="lg" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" /> We verify every account with a one-time
        code.
      </p>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
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
