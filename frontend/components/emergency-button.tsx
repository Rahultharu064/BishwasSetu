"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/context/language-context";

// Full-width vermilion button, Zap icon, subtle pulse (ux.md §3 / §5.1)
export function EmergencyButton({ className }: { className?: string }) {
  const { tr } = useLang();
  return (
    <Link
      href="/emergency"
      className={cn(
        "animate-urgent-pulse flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-urgent px-6 text-base font-bold text-urgent-foreground transition-transform active:scale-[0.99]",
        className
      )}
    >
      <Zap className="h-5 w-5" fill="currentColor" />
      {tr("home.hero.emergencyCta")}
    </Link>
  );
}
