"use client";

import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/states";

type Outcome = "verifying" | "success" | "failed";

function PaymentReturnInner({ id }: { id: string }) {
  const params = useSearchParams();
  const [outcome, setOutcome] = useState<Outcome>("verifying");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const pidx = params.get("pidx") ?? undefined;
      const data = params.get("data") ?? undefined;

      // eSewa's failure_url redirects with no `data` payload — nothing to verify.
      if (!pidx && !data) {
        if (!cancelled) setOutcome("failed");
        return;
      }

      try {
        const booking = await api.bookingById(id);
        if (!booking.escrow) throw new Error("No payment found for this booking.");
        await api.verifyEscrow({ escrowId: booking.escrow.id, pidx, data });
        if (!cancelled) setOutcome("success");
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
  }, [id]);

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
          <p className="mt-4 text-lg font-bold text-foreground">Payment secured in escrow</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The provider will only be paid once you confirm the job is done.
          </p>
          <Link href={`/bookings/${id}`} className="mt-6">
            <Button>Back to booking</Button>
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
          <Link href={`/bookings/${id}`} className="mt-6">
            <Button variant="outline">Back to booking</Button>
          </Link>
        </>
      )}
    </div>
  );
}

export default function PaymentReturnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={null}>
      <PaymentReturnInner id={id} />
    </Suspense>
  );
}
