"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Check,
  Lock,
  ShieldCheck,
  Clock,
  XCircle,
  Upload,
  FileCheck2,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { npr } from "@/lib/format";
import type {
  BadgeCatalogItem,
  ProviderBadgeRecord,
  BadgeStatus,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { TrustBadge } from "@/components/badges";

const STATUS_META: Record<
  BadgeStatus,
  { label: string; variant: "primary" | "warning" | "neutral" | "urgentSoft"; icon: typeof Check }
> = {
  ACTIVE: { label: "Active", variant: "primary", icon: Check },
  PENDING: { label: "Awaiting verification", variant: "warning", icon: Clock },
  EXPIRED: { label: "Expired", variant: "neutral", icon: Clock },
  REJECTED: { label: "Rejected", variant: "urgentSoft", icon: XCircle },
};

export default function ProviderBadgesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated)
      router.replace("/login?next=/provider/badges");
  }, [authLoading, isAuthenticated, router]);

  const catalogReq = useFetch(() => api.badgeCatalog(), [isAuthenticated]);
  const mineReq = useFetch(() => api.myBadges(), [isAuthenticated]);

  const catalog: BadgeCatalogItem[] = Array.isArray(catalogReq.data)
    ? catalogReq.data
    : [];
  const mine: ProviderBadgeRecord[] = useMemo(
    () => (Array.isArray(mineReq.data) ? mineReq.data : []),
    [mineReq.data]
  );

  // A badge type is locked from re-purchase while ACTIVE or PENDING.
  const heldTypes = useMemo(
    () =>
      new Set(
        mine
          .filter((b) => b.status === "ACTIVE" || b.status === "PENDING")
          .map((b) => b.badgeType)
      ),
    [mine]
  );

  const [selected, setSelected] = useState<BadgeCatalogItem | null>(null);
  const [method, setMethod] = useState<"KHALTI" | "ESEWA">("KHALTI");
  const [doc, setDoc] = useState<{ url: string; id: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  function openBadge(item: BadgeCatalogItem) {
    setSelected(item);
    setDoc(null);
    setMethod("KHALTI");
  }

  async function uploadDoc(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("document", file);
      const res = await api.uploadBadgeDocument(form);
      setDoc({ url: res.documentUrl, id: res.documentId });
      toast("Insurance document uploaded.", "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Upload failed. Try again.",
        "error"
      );
    } finally {
      setUploading(false);
    }
  }

  async function purchase() {
    if (!selected) return;
    if (selected.requiresDocument && !doc) {
      toast("Upload your insurance document first.", "error");
      return;
    }
    setBusy(true);
    try {
      const returnUrl = `${window.location.origin}/provider/badges/payment-return`;
      const result = await api.initiateBadgePurchase({
        badgeType: selected.badgeType,
        paymentMethod: method,
        returnUrl,
      });
      // Stashed for the return page — the gateway redirect drops all React state.
      sessionStorage.setItem(
        "bs_pending_badge_purchase",
        JSON.stringify({
          badgeType: selected.badgeType,
          paymentMethod: method,
          documentUrl: doc?.url,
          documentId: doc?.id,
        })
      );
      if (result.method === "ESEWA" && result.formFields) {
        // eSewa ePay v2 requires a signed POST form submit, not a GET redirect.
        const form = document.createElement("form");
        form.method = "POST";
        form.action = result.paymentUrl;
        for (const [key, value] of Object.entries(result.formFields)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
      } else {
        window.location.href = result.paymentUrl;
      }
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Purchase couldn't be completed.",
        "error"
      );
      setBusy(false);
    }
  }

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link
        href="/provider"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Dashboard
      </Link>

      <div className="flex items-center gap-3 rounded-2xl bg-primary p-5 text-primary-foreground">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-lg font-bold">Trust Badges</h1>
          <p className="text-sm text-primary-foreground/85">
            Verified signals that win customer trust — shown on your profile.
          </p>
        </div>
      </div>

      {/* My badges */}
      {mine.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Your badges
          </h2>
          <div className="space-y-2">
            {mine.map((b) => {
              const sm = STATUS_META[b.status];
              const SIcon = sm.icon;
              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <TrustBadge type={b.badgeType} size="default" />
                  <div className="flex items-center gap-2 text-right">
                    {b.status === "REJECTED" && b.rejectionReason && (
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {b.rejectionReason}
                      </span>
                    )}
                    {b.status === "ACTIVE" && b.expiresAt && (
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        renews {new Date(b.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                    <Badge variant={sm.variant} size="sm">
                      <SIcon className="h-3 w-3" />
                      {sm.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Catalog */}
      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
          Available badges
        </h2>
        {catalogReq.loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[132px] w-full rounded-2xl" />
            ))}
          </div>
        ) : catalogReq.error ? (
          <ErrorState message={catalogReq.error} onRetry={catalogReq.reload} />
        ) : catalog.length === 0 ? (
          <EmptyState
            title="No badges available"
            description="Check back shortly — we're refreshing the catalog."
            action={{ label: "Retry", onClick: catalogReq.reload }}
          />
        ) : (
          <div className="space-y-3">
            {catalog.map((item) => {
              const held = heldTypes.has(item.badgeType);
              return (
                <div
                  key={item.badgeType}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <TrustBadge type={item.badgeType} size="default" />
                        {item.annual && (
                          <span className="text-xs text-muted-foreground">/ year</span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-foreground">{item.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.verificationStep}
                      </p>
                    </div>
                    <span className="tabular shrink-0 text-lg font-bold text-primary">
                      {npr(item.priceNpr)}
                    </span>
                  </div>
                  <Button
                    full
                    className="mt-4"
                    variant={held ? "outline" : "primary"}
                    disabled={held}
                    onClick={() => openBadge(item)}
                  >
                    {held ? "Already held or pending" : "Get this badge"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" /> Badges are verified by our team and never
        change your trust score — they only display what&apos;s been checked.
      </p>

      {/* Purchase sheet */}
      <Sheet
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Get ${selected.label}` : ""}
      >
        {selected && (
          <>
            <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
              <div>
                <p className="font-semibold">{selected.label}</p>
                <p className="text-xs text-muted-foreground">
                  {selected.annual ? "Annual — renews yearly" : "One-time verification"}
                </p>
              </div>
              <span className="tabular text-lg font-bold">
                {npr(selected.priceNpr)}
              </span>
            </div>

            {selected.requiresDocument && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Insurance document</p>
                {doc ? (
                  <div className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary-soft/40 p-3 text-sm text-primary">
                    <FileCheck2 className="h-4 w-4" /> Document ready
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground hover:bg-secondary">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading…" : "Upload policy (PDF / image)"}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadDoc(f);
                      }}
                    />
                  </label>
                )}
              </div>
            )}

            <p className="mt-4 mb-2 text-sm font-medium">Payment method</p>
            <div className="grid grid-cols-2 gap-3">
              {(["KHALTI", "ESEWA"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 font-semibold ${
                    method === m
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {method === m && <Check className="h-4 w-4" />}
                  {m === "KHALTI" ? "Khalti" : "eSewa"}
                </button>
              ))}
            </div>

            <Button
              full
              className="mt-5"
              onClick={purchase}
              disabled={busy || (selected.requiresDocument && !doc)}
            >
              <ShieldCheck className="h-4 w-4" />
              {busy ? "Processing…" : `Pay ${npr(selected.priceNpr)}`}
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              After payment, our team verifies your badge — usually within a day.
            </p>
          </>
        )}
      </Sheet>
    </div>
  );
}
