"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailedInner />
    </Suspense>
  );
}

function PaymentFailedInner() {
  const params = useSearchParams();
  const message = params.get("message");
  const reason = params.get("reason");

  return (
    <div className="mx-auto flex max-w-md flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <Card className="w-full p-8 text-center">
        <CardContent className="flex flex-col items-center gap-3 p-0">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/12 text-destructive">
            <XCircle className="h-7 w-7" />
          </span>
          <h1 className="text-xl font-bold">Payment didn&apos;t go through</h1>
          <p className="text-sm text-muted-foreground">
            {message ?? (reason === "payment_cancelled" ? "The payment was cancelled." : "Something went wrong processing your payment.")}
          </p>
          <Link href="/bookings" className="mt-2 w-full">
            <Button variant="outline" className="w-full">
              Back to my bookings
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
