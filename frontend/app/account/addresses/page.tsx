"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  Plus,
  Home,
  Building2,
  Star,
  Pencil,
  Trash2,
  LocateFixed,
  Check,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import type { SavedAddress } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";
import { Input, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";

const QUICK_LABELS = ["Home", "Office", "Other"];

function addressesFrom(data: unknown): SavedAddress[] {
  if (data && typeof data === "object" && "addresses" in data) {
    const a = (data as { addresses?: SavedAddress[] }).addresses;
    if (Array.isArray(a)) return a;
  }
  return [];
}

function labelIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("home")) return Home;
  if (l.includes("office") || l.includes("work")) return Building2;
  return MapPin;
}

interface FormState {
  label: string;
  addressLine: string;
  city: string;
  landmark: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

const EMPTY_FORM: FormState = {
  label: "Home",
  addressLine: "",
  city: "",
  landmark: "",
  isDefault: false,
};

export default function AddressesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated)
      router.replace("/login?next=/account/addresses");
  }, [authLoading, isAuthenticated, router]);

  const req = useFetch(() => api.addresses(), [isAuthenticated]);
  const addresses = useMemo(() => addressesFrom(req.data), [req.data]);

  const [editing, setEditing] = useState<SavedAddress | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSheetOpen(true);
  }

  function openEdit(a: SavedAddress) {
    setEditing(a);
    setForm({
      label: a.label,
      addressLine: a.addressLine,
      city: a.city ?? "",
      landmark: a.landmark ?? "",
      latitude: a.latitude != null ? Number(a.latitude) : undefined,
      longitude: a.longitude != null ? Number(a.longitude) : undefined,
      isDefault: a.isDefault,
    });
    setSheetOpen(true);
  }

  function captureLocation() {
    if (!("geolocation" in navigator)) {
      toast("Location isn't available on this device.", "error");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setLocating(false);
        toast("Location pinned to this address.", "success");
      },
      () => {
        setLocating(false);
        toast("Couldn't get your location.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function save() {
    if (form.label.trim().length < 1 || form.addressLine.trim().length < 4)
      return;
    setBusy(true);
    const payload = {
      label: form.label.trim(),
      addressLine: form.addressLine.trim(),
      city: form.city.trim() || undefined,
      landmark: form.landmark.trim() || undefined,
      latitude: form.latitude,
      longitude: form.longitude,
      isDefault: form.isDefault,
    };
    try {
      if (editing) await api.updateAddress(editing.id, payload);
      else await api.createAddress(payload);
      toast(editing ? "Address updated." : "Address saved.", "success");
      setSheetOpen(false);
      req.reload();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Couldn't save the address.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  }

  async function makeDefault(a: SavedAddress) {
    try {
      await api.setDefaultAddress(a.id);
      req.reload();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Couldn't update.",
        "error"
      );
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await api.deleteAddress(id);
      toast("Address removed.", "success");
      setPendingDelete(null);
      req.reload();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Couldn't delete.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  }

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link
        href="/account"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Account
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Saved addresses</h1>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Save the places you book for — your default prefills the booking form.
      </p>

      <div className="mt-5">
        {req.loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : req.error ? (
          <ErrorState message={req.error} onRetry={req.reload} />
        ) : addresses.length === 0 ? (
          <EmptyState
            title="No saved addresses"
            description="Add your home or office to check out faster next time."
            icon={<MapPin className="h-8 w-8" />}
            action={{ label: "Add an address", onClick: openAdd }}
          />
        ) : (
          <ul className="space-y-3">
            {addresses.map((a) => {
              const Icon = labelIcon(a.label);
              return (
                <li
                  key={a.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{a.label}</p>
                        {a.isDefault && (
                          <Badge variant="soft" size="sm">
                            <Star className="h-3 w-3 fill-current" /> Default
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-foreground">
                        {a.addressLine}
                      </p>
                      {(a.city || a.landmark) && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {[a.landmark, a.city].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-1">
                    {!a.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => makeDefault(a)}
                      >
                        <Star className="h-4 w-4" /> Set default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(a)}
                      aria-label="Edit address"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    {pendingDelete === a.id ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={busy}
                        onClick={() => remove(a.id)}
                      >
                        <Check className="h-4 w-4" /> Confirm
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingDelete(a.id)}
                        aria-label="Delete address"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Add / edit sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editing ? "Edit address" : "Add address"}
      >
        <div className="space-y-4">
          <div>
            <Label>Label</Label>
            <div className="mb-2 flex gap-2">
              {QUICK_LABELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, label: l }))}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                    form.label === l
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <Input
              value={form.label}
              onChange={(e) =>
                setForm((f) => ({ ...f, label: e.target.value }))
              }
              placeholder="e.g. Home"
              maxLength={40}
            />
          </div>

          <div>
            <Label htmlFor="addressLine">Address</Label>
            <Input
              id="addressLine"
              value={form.addressLine}
              onChange={(e) =>
                setForm((f) => ({ ...f, addressLine: e.target.value }))
              }
              placeholder="House no., tole / street"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
                placeholder="Kathmandu"
              />
            </div>
            <div>
              <Label htmlFor="landmark">Landmark</Label>
              <Input
                id="landmark"
                value={form.landmark}
                onChange={(e) =>
                  setForm((f) => ({ ...f, landmark: e.target.value }))
                }
                placeholder="Near…"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={captureLocation}
            disabled={locating}
            className={`flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
              form.latitude != null
                ? "border-primary/40 bg-primary-soft text-primary"
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {form.latitude != null ? (
              <>
                <Check className="h-4 w-4" /> GPS pinned
              </>
            ) : (
              <>
                <LocateFixed className="h-4 w-4" />
                {locating ? "Getting location…" : "Pin GPS (optional)"}
              </>
            )}
          </button>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm((f) => ({ ...f, isDefault: e.target.checked }))
              }
              className="h-4 w-4 rounded border-input accent-primary"
            />
            Set as default address
          </label>

          <Button
            full
            className="mt-1"
            disabled={
              busy ||
              form.label.trim().length < 1 ||
              form.addressLine.trim().length < 4
            }
            onClick={save}
          >
            {busy ? "Saving…" : editing ? "Save changes" : "Save address"}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
