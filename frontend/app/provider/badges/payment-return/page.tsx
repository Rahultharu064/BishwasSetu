"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/states";

type Outcome = "verifying" | "success" | "failed";

interface PendingBadgePurchase {
  badgeType: "SKILL_VERIFIED" | "BACKGROUND_CHECKED" | "INSURED";
  paymentMethod: "KHALTI" | "ESEWA";
  documentUrl?: string;
  documentId?: string;
}

function BadgePaymentReturnInner() {
  const params = useSearchParams();
  const [outcome, setOutcome] = useState<Outcome>("verifying");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const pidx = params.get("pidx") ?? undefined;
      const data = params.get("data") ?? undefined;
      const paymentRef = pidx ?? data;

      const raw = sessionStorage.getItem("bs_pending_badge_purchase");
      const pending = raw ? (JSON.parse(raw) as PendingBadgePurchase) : null;

      if (!paymentRef || !pending) {
        if (!cancelled) setOutcome("failed");
        return;
      }

      try {
        const res = await api.purchaseBadge({
          badgeType: pending.badgeType,
          paymentMethod: pending.paymentMethod,
          paymentRef,
          documentUrl: pending.documentUrl,
          documentId: pending.documentId,
        });
        sessionStorage.removeItem("bs_pending_badge_purchase");
        if (!cancelled) {
          setMessage(res.message);
          setOutcome("success");
        }
      } catch (err) {
        if (!cancelled) {
          setMessage(err instanceof ApiError ? err.message : "Payment could not be verified.");
          setOutcome("failed");
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      {outcome === "verifying" && (
        <>
          <Spinner className="h-8 w-8" />
          <p className="mt-4 font-semibold text-foreground">Confirming your payment…</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Don&apos;t close this page — this only takes a moment.
          </p>
        </>
      )}

      {outcome === "success" && (
        <>
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <p className="mt-4 text-lg font-bold text-foreground">Payment successful</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {message ?? "Our team will verify your badge shortly."}
          </p>
          <Link href="/provider/badges" className="mt-6">
            <Button>Back to badges</Button>
          </Link>
        </>
      )}

      {outcome === "failed" && (
        <>
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-urgent-soft text-urgent">
            <XCircle className="h-7 w-7" />
          </span>
          <p className="mt-4 text-lg font-bold text-foreground">Payment not completed</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {message ?? "The payment was cancelled or could not be confirmed."}
          </p>
          <Link href="/provider/badges" className="mt-6">
            <Button variant="outline">Back to badges</Button>
          </Link>
        </>
      )}
    </div>
  );
}

export default function BadgePaymentReturnPage() {
  return (
    <Suspense fallback={null}>
      <BadgePaymentReturnInner />
    </Suspense>
  );
}
