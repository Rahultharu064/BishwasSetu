"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ErrorBanner } from "@/components/shared/states";
import { AuthApi } from "@/lib/endpoints";
import { ApiError } from "@/lib/api";

type ContactMode = "email" | "phone";

export function LoginForm() {
  const router = useRouter();
  const [contactMode, setContactMode] = React.useState<ContactMode>("phone");
  const [contact, setContact] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { userId } = await AuthApi.login({
        password,
        ...(contactMode === "email" ? { email: contact } : { phone: contact }),
      });
      router.push(`/verify-otp?userId=${userId}&flow=login`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not log in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to book, track, and manage your services."
      subtitle="Verified providers, escrow-protected payments, and a trust score you can actually see."
    >
      <h2 className="text-2xl font-bold tracking-tight">Log in</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <ErrorBanner message={error} />}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="contact" className="mb-0">
              {contactMode === "email" ? "Email address" : "Phone number"}
            </Label>
            <button
              type="button"
              onClick={() => {
                setContactMode((m) => (m === "email" ? "phone" : "email"));
                setContact("");
              }}
              className="text-xs font-medium text-primary hover:underline"
            >
              Use {contactMode === "email" ? "phone" : "email"} instead
            </button>
          </div>
          <Input
            id="contact"
            required
            type={contactMode === "email" ? "email" : "tel"}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={contactMode === "email" ? "you@example.com" : "98XXXXXXXX"}
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </div>

        <Button type="submit" className="w-full" size="lg" loading={submitting}>
          Continue
        </Button>
      </form>
    </AuthShell>
  );
}
