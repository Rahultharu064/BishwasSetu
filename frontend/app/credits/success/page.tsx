"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessInner />
    </Suspense>
  );
}

function PaymentSuccessInner() {
  const params = useSearchParams();
  const message = params.get("message");

  return (
    <div className="mx-auto flex max-w-md flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <Card className="w-full p-8 text-center">
        <CardContent className="flex flex-col items-center gap-3 p-0">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/12 text-success">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h1 className="text-xl font-bold">Payment received</h1>
          <p className="text-sm text-muted-foreground">
            {message ?? "Your payment was successful and is held securely until the job is confirmed complete."}
          </p>
          <Link href="/bookings" className="mt-2 w-full">
            <Button className="w-full">View my bookings</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
