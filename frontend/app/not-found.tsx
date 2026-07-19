import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Page not found — BishwasSetu" };

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <Card className="w-full p-8 text-center">
        <CardContent className="flex flex-col items-center gap-3 p-0">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <ShieldAlert className="h-7 w-7" />
          </span>
          <h1 className="text-xl font-bold">Page not found</h1>
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
          </p>
          <Link href="/" className="mt-2 w-full">
            <Button className="w-full">Back to home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
