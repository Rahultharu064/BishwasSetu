"use client";

import { useState } from "react";
import {
  User as UserIcon,
  ShieldCheck,
  Mail,
  Phone,
  BadgeCheck,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { api, ApiError } from "@/lib/api";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput, Label, FieldError } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/ui/section-card";

const TABS = [
  { value: "profile", label: "Profile", icon: UserIcon },
  { value: "security", label: "Security", icon: ShieldCheck },
] as const;

type Tab = (typeof TABS)[number]["value"];

export default function ProviderSettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your account details and security settings.
      </p>

      <div className="mt-4 flex gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                tab === t.value
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border text-muted-foreground hover:bg-secondary"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 max-w-xl">
        {tab === "profile" && <ProfileTab />}
        {tab === "security" && <SecurityTab />}
      </div>
    </div>
  );
}

// ── Profile ─────────────────────────────────────────────────────

function ProfileTab() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dirty = name.trim() !== (user?.name ?? "").trim();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    setSaving(true);
    try {
      const updated = await api.updateProfile({ name: name.trim() });
      updateUser({ name: updated.name });
      toast("Profile updated.", "success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard title="Profile" subtitle="How you appear to customers on BishwasSetu.">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-soft text-lg font-bold text-primary">
          {initials(user?.name ?? "Provider")}
        </span>
        <div>
          <p className="font-semibold">{user?.name}</p>
          <Badge variant="skilled" size="sm" className="mt-1 capitalize">
            <BadgeCheck className="h-3 w-3" /> {user?.role?.toLowerCase()}
          </Badge>
        </div>
      </div>

      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
        <div>
          <Label htmlFor="profile-name">Display name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Email</Label>
            <div className="flex h-12 items-center gap-2 rounded-lg border border-dashed border-input bg-secondary/40 px-4 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{user?.email ?? "—"}</span>
            </div>
          </div>
          <div>
            <Label>Phone</Label>
            <div className="flex h-12 items-center gap-2 rounded-lg border border-dashed border-input bg-secondary/40 px-4 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{user?.phone ?? "—"}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Email and phone double as your sign-in credentials. Please contact support to change them.
        </p>

        <FieldError>{error}</FieldError>
        <Button type="submit" disabled={saving || !dirty}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </SectionCard>
  );
}

// ── Security ────────────────────────────────────────────────────

function SecurityTab() {
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!current) {
      setError("Enter your current password.");
      return;
    }
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New password and confirmation don't match.");
      return;
    }
    setSaving(true);
    try {
      await api.changePassword({ currentPassword: current, newPassword: next });
      toast("Password updated.", "success");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't change password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard
      title="Change password"
      subtitle="You'll stay signed in on this device."
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="pw-current">Current password</Label>
          <PasswordInput
            id="pw-current"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div>
          <Label htmlFor="pw-new">New password</Label>
          <PasswordInput
            id="pw-new"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </div>
        <div>
          <Label htmlFor="pw-confirm">Confirm new password</Label>
          <PasswordInput
            id="pw-confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <FieldError>{error}</FieldError>
        <Button type="submit" disabled={saving}>
          <KeyRound className="h-4 w-4" />
          {saving ? "Updating…" : "Update password"}
        </Button>
      </form>
    </SectionCard>
  );
}
