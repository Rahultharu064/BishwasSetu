"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <Card className="w-full p-8 text-center">
        <CardContent className="flex flex-col items-center gap-3 p-0">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/12 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </span>
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. You can try again, or head back home.
          </p>
          <div className="mt-2 flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => reset()}>
              Try again
            </Button>
            <Link href="/" className="flex-1">
              <Button className="w-full">Go home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
