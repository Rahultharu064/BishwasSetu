import { ArrowRight, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ProviderCta() {
  return (
    <div className="flex flex-col items-start gap-5 rounded-3xl bg-foreground px-6 py-8 text-background sm:flex-row sm:items-center sm:justify-between sm:px-10">
      <div className="flex items-start gap-4">
        <span className="hidden size-12 shrink-0 items-center justify-center rounded-full bg-background/10 sm:flex">
          <UserPlus className="size-6" aria-hidden />
        </span>
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">
            Are you a skilled tradesperson?
          </h2>
          <p className="mt-1 max-w-md text-sm text-background/70">
            Join GharSewa in minutes — start with just a phone number and 3
            work photos, then level up your tier as you go.
          </p>
        </div>
      </div>
      <Button
        variant="primary"
        className="w-full shrink-0 bg-background text-foreground hover:bg-background/90 sm:w-auto"
      >
        Become a Provider
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
