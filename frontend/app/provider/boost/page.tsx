"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Coins, Check, TrendingUp, Lock, Star } from "lucide-react";
import { api, ApiError, API_BASE } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { npr } from "@/lib/format";
import type { CreditPack as Pack, CreditPacksResponse } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";

function packsFrom(data: CreditPacksResponse | null): Pack[] {
  return Array.isArray(data?.packs) ? data.packs : [];
}

function balanceFrom(data: unknown): number {
  if (data && typeof data === "object") {
    const w = data as { balance?: number };
    if (typeof w.balance === "number") return w.balance;
  }
  return 0;
}

export default function BoostPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated)
      router.replace("/login?next=/provider/boost");
  }, [authLoading, isAuthenticated, router]);

  const packsReq = useFetch(() => api.creditPacks(), [isAuthenticated]);
  const walletReq = useFetch(() => api.creditWallet(), [isAuthenticated]);

  const packs = packsFrom(packsReq.data);
  const balance = balanceFrom(walletReq.data);
  // Undefined until the request lands — only `false` means "switched off".
  const creditsEnabled = packsReq.data?.enabled;

  const [selected, setSelected] = useState<Pack | null>(null);
  const [method, setMethod] = useState<"KHALTI" | "ESEWA">("KHALTI");
  const [busy, setBusy] = useState(false);

  async function purchase() {
    if (!selected) return;
    setBusy(true);
    try {
      const returnUrl =
        method === "KHALTI"
          ? `${API_BASE}/payments/khalti/return`
          : `${API_BASE}/payments/esewa/success`;
      const result = await api.initiateCreditPurchase({
        packId: selected.id,
        paymentMethod: method,
        returnUrl,
      });
      if (result.method === "ESEWA" && result.esewaParams && result.esewaUrl) {
        // eSewa ePay v2 requires a signed POST form submit, not a GET redirect.
        const form = document.createElement("form");
        form.method = "POST";
        form.action = result.esewaUrl;
        for (const [key, value] of Object.entries(result.esewaParams)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
      } else if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        throw new Error("Payment gateway didn't return a redirect URL.");
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

      {/* Balance */}
      <div className="flex items-center gap-3 rounded-2xl bg-primary p-5 text-primary-foreground">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
          <Coins className="h-6 w-6" />
        </span>
        <div>
          <p className="text-sm text-primary-foreground/80">Credit balance</p>
          {walletReq.loading ? (
            <Skeleton className="mt-1 h-7 w-24 bg-white/15" />
          ) : (
            <p className="tabular text-2xl font-bold">{balance} credits</p>
          )}
        </div>
      </div>

      <h1 className="mt-8 text-xl font-bold tracking-tight">Boost your ranking</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Credits fund priority placement — never a paid override of trust scores.
      </p>

      <div className="mt-5">
        {packsReq.loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[92px] w-full rounded-2xl" />
            ))}
          </div>
        ) : packsReq.error ? (
          <ErrorState message={packsReq.error} onRetry={packsReq.reload} />
        ) : creditsEnabled === false ? (
          // Paid boosts are off for the single-city pilot (docs/MVP_SCOPE.md).
          // Say so plainly instead of dangling a Retry that can never succeed —
          // and point at what actually moves a provider up the results today.
          <div className="rounded-2xl border border-border bg-card p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Lock className="h-5 w-5" />
            </span>
            <p className="mt-3 text-base font-semibold">
              Paid boosts aren&apos;t live yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              We turn on credit packs once enough pros are competing for the same
              jobs in your area. Until then nobody can buy their way past you.
            </p>
            <p className="mt-4 text-sm font-medium">
              What lifts your ranking right now
            </p>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              {[
                "Completed jobs paid through escrow on BishwasSetu",
                "Your trust score — reviews, on-time arrivals, low complaints",
                "Finishing KYC verification to reach a higher tier",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Star className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/provider"
              className={buttonVariants({ variant: "outline", full: true, className: "mt-5" })}
            >
              Back to dashboard
            </Link>
          </div>
        ) : packs.length === 0 ? (
          <EmptyState
            title="No credit packs available"
            description="We're refreshing the catalog — check back shortly."
            action={{ label: "Retry", onClick: packsReq.reload }}
          />
        ) : (
          <div className="space-y-3">
            {packs.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-colors ${
                  p.bestValue
                    ? "border-primary bg-primary-soft/40"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{p.name}</p>
                    {p.bestValue && (
                      <Badge variant="primary" size="sm">
                        Best value
                      </Badge>
                    )}
                  </div>
                  <p className="tabular mt-0.5 text-sm text-muted-foreground">
                    {p.credits} credits
                  </p>
                  {p.perk && (
                    <p className="mt-1.5 text-xs text-muted-foreground">{p.perk}</p>
                  )}
                </div>
                <span className="tabular text-lg font-bold text-primary">
                  {npr(p.priceNpr)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {creditsEnabled !== false && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" /> No auto-renew — every purchase is a
          single transaction.
        </p>
      )}

      {/* Purchase confirmation */}
      <Sheet
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Buy ${selected.name} pack` : ""}
      >
        {selected && (
          <>
            <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
              <div>
                <p className="font-semibold">{selected.credits} credits</p>
                <p className="text-xs text-muted-foreground">{selected.name} pack</p>
              </div>
              <span className="tabular text-lg font-bold">
                {npr(selected.priceNpr)}
              </span>
            </div>

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

            <Button full className="mt-5" onClick={purchase} disabled={busy}>
              <TrendingUp className="h-4 w-4" />
              {busy ? "Processing…" : `Pay ${npr(selected.priceNpr)}`}
            </Button>
          </>
        )}
      </Sheet>
    </div>
  );
}
