"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  MapPin,
  Wallet,
  Globe,
  ShieldCheck,
  LogOut,
  ChevronRight,
  UserCircle2,
  MessageSquareWarning,
  Pencil,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/language-context";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/context/toast-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, PasswordInput, Label, FieldError } from "@/components/ui/input";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { lang, toggle, tr } = useLang();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login?next=/account");
  }, [loading, isAuthenticated, router]);

  if (loading || !user) return null;

  const rows = [
    { href: "/bookings", icon: <CalendarCheck className="h-5 w-5" />, label: tr("account.myBookings") },
    { href: "/complaints", icon: <MessageSquareWarning className="h-5 w-5" />, label: tr("account.myComplaints") },
    { href: "/account/addresses", icon: <MapPin className="h-5 w-5" />, label: tr("account.savedAddresses") },
    { href: "/account/payments", icon: <Wallet className="h-5 w-5" />, label: tr("account.paymentMethods") },
    { href: "/trust-safety", icon: <ShieldCheck className="h-5 w-5" />, label: tr("account.trustSafety") },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* Identity */}
      <ProfileHeader />

      {user.role === "PROVIDER" && (
        <Link href="/provider" className="mt-6 block">
          <div className="flex items-center gap-3 rounded-xl bg-primary p-4 text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
            <span className="flex-1 font-semibold">{tr("account.goToProviderDashboard")}</span>
            <ChevronRight className="h-5 w-5" />
          </div>
        </Link>
      )}

      {(user.role === "ADMIN" || user.role === "MODERATOR") && (
        <Link href="/admin" className="mt-6 block">
          <div className="flex items-center gap-3 rounded-xl bg-foreground p-4 text-background">
            <ShieldCheck className="h-5 w-5" />
            <span className="flex-1 font-semibold">{tr("account.openAdminConsole")}</span>
            <ChevronRight className="h-5 w-5" />
          </div>
        </Link>
      )}

      {/* Menu */}
      <div className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {rows.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="flex items-center gap-3 p-4 transition-colors hover:bg-secondary"
          >
            <span className="text-primary">{r.icon}</span>
            <span className="flex-1 font-medium">{r.label}</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary"
        >
          <span className="text-primary">
            <Globe className="h-5 w-5" />
          </span>
          <span className="flex-1 font-medium">{tr("account.language")}</span>
          <span className="text-sm font-semibold text-muted-foreground">
            {lang === "ne" ? "नेपाली" : "English"}
          </span>
        </button>
      </div>

      {/* Security */}
      <div className="mt-6">
        <PasswordSection />
      </div>

      <Button
        variant="outline"
        full
        className="mt-6"
        onClick={async () => {
          await logout();
          router.push("/");
        }}
      >
        <LogOut className="h-4 w-4" /> {tr("account.logout")}
      </Button>
    </div>
  );
}

// ── Profile header — display name, editable inline ──────────────

function ProfileHeader() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const { tr } = useLang();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) {
      setError(tr("account.errNameLen"));
      return;
    }
    setSaving(true);
    try {
      const updated = await api.updateProfile({ name: name.trim() });
      updateUser({ name: updated.name });
      toast(tr("account.toastProfileUpdated"), "success");
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tr("account.errSaveFailed"));
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={submit} className="flex items-start gap-4" noValidate>
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <UserCircle2 className="h-9 w-9" />
        </span>
        <div className="flex-1">
          <Label htmlFor="account-name">{tr("account.displayName")}</Label>
          <Input
            id="account-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <FieldError>{error}</FieldError>
          <div className="mt-3 flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? tr("account.saving") : tr("account.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => {
                setEditing(false);
                setName(user.name);
                setError(null);
              }}
            >
              {tr("account.cancel")}
            </Button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <UserCircle2 className="h-9 w-9" />
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{user.name}</h1>
          <button
            onClick={() => setEditing(true)}
            aria-label={tr("account.editDisplayName")}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          {user.email || user.phone}
        </p>
        <Badge variant="soft" size="sm" className="mt-1">
          {user.role === "PROVIDER" ? tr("account.provider") : tr("account.customer")}
        </Badge>
      </div>
    </div>
  );
}

// ── Password change — collapsed by default ───────────────────────

function PasswordSection() {
  const { toast } = useToast();
  const { tr } = useLang();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!current) {
      setError(tr("account.errCurrentPasswordRequired"));
      return;
    }
    if (next.length < 8) {
      setError(tr("account.errNewPasswordLen"));
      return;
    }
    if (next !== confirm) {
      setError(tr("account.errPasswordMismatch"));
      return;
    }
    setSaving(true);
    try {
      await api.changePassword({ currentPassword: current, newPassword: next });
      toast(tr("account.toastPasswordUpdated"), "success");
      setCurrent("");
      setNext("");
      setConfirm("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tr("account.errPasswordChangeFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary"
      >
        <span className="text-primary">
          <KeyRound className="h-5 w-5" />
        </span>
        <span className="flex-1 font-medium">{tr("account.changePassword")}</span>
        <ChevronRight
          className={`h-5 w-5 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <form onSubmit={submit} className="space-y-4 border-t border-border p-4" noValidate>
          <div>
            <Label htmlFor="acct-pw-current">{tr("account.currentPassword")}</Label>
            <PasswordInput
              id="acct-pw-current"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div>
            <Label htmlFor="acct-pw-new">{tr("account.newPassword")}</Label>
            <PasswordInput
              id="acct-pw-new"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder={tr("auth.register.passwordPlaceholder")}
              autoComplete="new-password"
            />
          </div>
          <div>
            <Label htmlFor="acct-pw-confirm">{tr("account.confirmNewPassword")}</Label>
            <PasswordInput
              id="acct-pw-confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <FieldError>{error}</FieldError>
          <Button type="submit" disabled={saving}>
            {saving ? tr("account.updating") : tr("account.updatePassword")}
          </Button>
        </form>
      )}
    </div>
  );
}
