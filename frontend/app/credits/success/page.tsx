"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function CreditsSuccessInner() {
  const params = useSearchParams();
  const message = params.get("message");

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <CheckCircle2 className="h-7 w-7" />
      </span>
      <p className="mt-4 text-lg font-bold text-foreground">Payment successful</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {message ?? "Your credits have been added to your wallet."}
      </p>
      <Link href="/provider/boost" className="mt-6">
        <Button>Back to boost</Button>
      </Link>
    </div>
  );
}

export default function CreditsSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CreditsSuccessInner />
    </Suspense>
  );
}
