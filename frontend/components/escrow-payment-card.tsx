"use client";

import { useState } from "react";
import {
  Lock,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { npr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { EscrowStatusBar } from "@/components/escrow-status-bar";
import type { EscrowStatus } from "@/lib/types";

// ── Commission split preview ───────────────────────────────────

function CommissionBreakdown({
  amountNpr,
  commissionPct,
}: {
  amountNpr: number;
  commissionPct: number;
}) {
  const commissionNpr = Math.round((amountNpr * commissionPct) / 100);
  const payoutNpr = amountNpr - commissionNpr;
  return (
    <div className="rounded-xl bg-secondary p-4 text-sm">
      <p className="mb-2 font-semibold text-muted-foreground">Payment breakdown</p>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span>Job total</span>
          <span className="tabular font-semibold">{npr(amountNpr)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Platform fee ({commissionPct}%)</span>
          <span className="tabular">−{npr(commissionNpr)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-border pt-2 font-bold">
          <span className="text-primary">Your payout</span>
          <span className="tabular text-primary">{npr(payoutNpr)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Gateway Selection ─────────────────────────────────────────

type Gateway = "KHALTI" | "ESEWA";

function GatewayOption({
  value,
  selected,
  onSelect,
}: {
  value: Gateway;
  selected: boolean;
  onSelect: () => void;
}) {
  const meta = {
    KHALTI: { label: "Khalti", color: "border-purple-400 bg-purple-50 text-purple-700" },
    ESEWA: { label: "eSewa", color: "border-green-400 bg-green-50 text-green-700" },
  }[value];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-bold transition-all",
        selected ? meta.color : "border-border bg-card text-muted-foreground hover:bg-secondary"
      )}
    >
      {selected && <CheckCircle2 className="h-4 w-4" />}
      {meta.label}
    </button>
  );
}

// ── Escrow Payment Card ───────────────────────────────────────

interface EscrowPaymentCardProps {
  amountNpr: number;
  escrowStatus: EscrowStatus;
  isEmergency?: boolean;
  viewerRole: "CUSTOMER" | "PROVIDER";
  guaranteeExpiresAt?: string | null;
  onPayNow?: (gateway: Gateway) => Promise<void>;
  onReleaseFunds?: () => Promise<void>;
}

export function EscrowPaymentCard({
  amountNpr,
  escrowStatus,
  isEmergency = false,
  viewerRole,
  guaranteeExpiresAt,
  onPayNow,
  onReleaseFunds,
}: EscrowPaymentCardProps) {
  const [gateway, setGateway] = useState<Gateway>("KHALTI");
  const [busy, setBusy] = useState(false);
  const commissionPct = isEmergency ? 12 : amountNpr >= 5000 ? 12 : amountNpr >= 1000 ? 10 : 8;

  async function handlePay() {
    if (!onPayNow) return;
    setBusy(true);
    try {
      await onPayNow(gateway);
    } finally {
      setBusy(false);
    }
  }

  async function handleRelease() {
    if (!onReleaseFunds) return;
    setBusy(true);
    try {
      await onReleaseFunds();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Escrow Header */}
      <div className="flex items-center gap-3 border-b border-border bg-primary-soft/50 px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Lock className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="font-semibold text-foreground">Escrow-Protected Payment</p>
          <p className="text-xs text-muted-foreground">
            Funds held safely by BishwasSetu — released only when you confirm the job is done.
          </p>
        </div>
        {isEmergency && (
          <span className="rounded-full bg-urgent px-2 py-0.5 text-[10px] font-bold text-urgent-foreground">
            EMERGENCY
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Status Progress */}
        <EscrowStatusBar status={escrowStatus} />

        {/* Amount Display */}
        <div className="mt-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Total amount
          </p>
          <p className="tabular mt-1 text-4xl font-extrabold text-foreground">
            {npr(amountNpr)}
          </p>
        </div>

        {/* Provider: breakdown */}
        {viewerRole === "PROVIDER" && escrowStatus !== "NONE" && (
          <div className="mt-4">
            <CommissionBreakdown amountNpr={amountNpr} commissionPct={commissionPct} />
          </div>
        )}

        {/* Guarantee Banner */}
        {(escrowStatus === "RELEASED" || escrowStatus === "HELD") && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-primary-soft p-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                7-Day Workmanship Guarantee active
              </p>
              {guaranteeExpiresAt && (
                <p className="text-xs text-muted-foreground">
                  Valid until{" "}
                  {new Date(guaranteeExpiresAt).toLocaleDateString("en-NP", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Customer: Pay to Escrow */}
        {viewerRole === "CUSTOMER" && escrowStatus === "NONE" && onPayNow && (
          <div className="mt-5 space-y-4">
            <div>
              <p className="mb-2 text-sm font-semibold">Pay with</p>
              <div className="flex gap-2">
                {(["KHALTI", "ESEWA"] as Gateway[]).map((g) => (
                  <GatewayOption
                    key={g}
                    value={g}
                    selected={gateway === g}
                    onSelect={() => setGateway(g)}
                  />
                ))}
              </div>
            </div>
            <CommissionBreakdown amountNpr={amountNpr} commissionPct={commissionPct} />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              Payment held in escrow — released only after you confirm the work is done.
            </p>
            <Button full size="lg" onClick={handlePay} disabled={busy} id="pay-to-escrow-btn">
              <CreditCard className="h-4 w-4" />
              {busy ? "Redirecting…" : `Pay ${npr(amountNpr)} via ${gateway === "KHALTI" ? "Khalti" : "eSewa"}`}
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Customer: Release Funds */}
        {viewerRole === "CUSTOMER" && escrowStatus === "HELD" && onReleaseFunds && (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-muted-foreground">
              Satisfied with the work? Release the funds to the provider.
            </p>
            <Button full size="lg" onClick={handleRelease} disabled={busy} id="release-funds-btn">
              <CheckCircle2 className="h-4 w-4" />
              {busy ? "Releasing…" : "Confirm Job Complete & Release Funds"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Released state */}
        {escrowStatus === "RELEASED" && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Payment released — thank you!
          </div>
        )}
      </div>
    </div>
  );
}
