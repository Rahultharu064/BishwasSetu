"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function CreditsFailedInner() {
  const params = useSearchParams();
  const message = params.get("message") ?? params.get("reason");

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-urgent-soft text-urgent">
        <XCircle className="h-7 w-7" />
      </span>
      <p className="mt-4 text-lg font-bold text-foreground">Payment not completed</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {message ?? "The payment was cancelled or could not be confirmed."}
      </p>
      <Link href="/provider/boost" className="mt-6">
        <Button variant="outline">Back to boost</Button>
      </Link>
    </div>
  );
}

export default function CreditsFailedPage() {
  return (
    <Suspense fallback={null}>
      <CreditsFailedInner />
    </Suspense>
  );
}
