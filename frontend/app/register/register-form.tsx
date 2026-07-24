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
import { cn } from "@/lib/utils";

type ContactMode = "email" | "phone";
type RoleChoice = "CUSTOMER" | "PROVIDER";

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = React.useState<RoleChoice>("CUSTOMER");
  const [contactMode, setContactMode] = React.useState<ContactMode>("phone");
  const [name, setName] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { userId } = await AuthApi.register({
        name,
        password,
        role,
        ...(contactMode === "email" ? { email: contact } : { phone: contact }),
      });
      router.push(`/verify-otp?userId=${userId}&flow=register`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Get started"
      title="Join Nepal's trust layer for home services."
      subtitle="Whether you need a job done or want steady, verified work — BishwasSetu is built on accountability from day one."
    >
      <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Already have one?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1">
        <RoleTab active={role === "CUSTOMER"} onClick={() => setRole("CUSTOMER")}>
          I need a service
        </RoleTab>
        <RoleTab active={role === "PROVIDER"} onClick={() => setRole("PROVIDER")}>
          I provide a service
        </RoleTab>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <ErrorBanner message={error} />}

        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Sita Sharma" />
        </div>

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
          {contactMode === "phone" && (
            <p className="mt-1.5 text-xs text-muted-foreground">Nepal numbers only, e.g. 984XXXXXXX</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            required
            minLength={8}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>

        <Button type="submit" className="w-full" size="lg" loading={submitting}>
          Create account
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to BishwasSetu&apos;s terms and verification process.
        </p>
      </form>
    </AuthShell>
  );
}

function RoleTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active ? "bg-card text-foreground shadow-[var(--shadow-soft)]" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
