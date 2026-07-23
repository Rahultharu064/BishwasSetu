"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, MapPin, ChevronLeft, MessageSquare } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMERGENCY_CATEGORIES = [
  { slug: "plumbing", label: "Plumbing" },
  { slug: "electrical", label: "Electrical" },
  { slug: "ac-cooling", label: "AC / Cooling" },
  { slug: "appliance-repair", label: "Appliance" },
  { slug: "cleaning", label: "Cleaning" },
  { slug: "carpentry", label: "Carpentry" },
];

type Stage = "category" | "confirm" | "matching" | "no-match";

export default function EmergencyPage() {
  const [stage, setStage] = useState<Stage>("category");
  const [category, setCategory] = useState<string | null>(null);
  const [address, setAddress] = useState("Maharajgunj, Kathmandu");

  // Simulate the matching window (ux.md §10 — max 1 decision per screen)
  useEffect(() => {
    if (stage !== "matching") return;
    const id = setTimeout(() => setStage("no-match"), 6000);
    return () => clearTimeout(id);
  }, [stage]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col px-4 py-6">
      {stage !== "category" && (
        <button
          onClick={() =>
            setStage((s) =>
              s === "confirm" ? "category" : s === "no-match" ? "confirm" : s
            )
          }
          className="mb-4 inline-flex items-center gap-1 self-start text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
      )}

      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-urgent text-urgent-foreground">
          <Zap className="h-5 w-5" fill="currentColor" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Emergency Dispatch</h1>
          <p className="text-sm text-muted-foreground">
            Nearest verified pro, matched fast.
          </p>
        </div>
      </div>

      {/* Stage 1 — category */}
      {stage === "category" && (
        <div>
          <h2 className="mb-3 font-semibold">What&apos;s the emergency?</h2>
          <div className="grid grid-cols-2 gap-3">
            {EMERGENCY_CATEGORIES.map((c) => (
              <button
                key={c.slug}
                onClick={() => {
                  setCategory(c.slug);
                  setStage("confirm");
                }}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-6 text-center transition-colors hover:border-urgent/50 hover:bg-urgent-soft"
              >
                <CategoryIcon name={c.slug} className="h-8 w-8 text-urgent" />
                <span className="font-semibold">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stage 2 — address confirm */}
      {stage === "confirm" && (
        <div className="space-y-4">
          <h2 className="font-semibold">Confirm your location</h2>
          <div className="rounded-xl border border-border bg-card p-4">
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="h-4 w-4 text-urgent" /> Service address
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Only Tier 2+ verified providers are eligible for emergency matching.
            A 12% priority fee applies — shown before you confirm payment.
          </p>
          <Button variant="urgent" full size="lg" onClick={() => setStage("matching")}>
            <Zap className="h-5 w-5" fill="currentColor" /> Find me a pro now
          </Button>
        </div>
      )}

      {/* Stage 3 — matching radar */}
      {stage === "matching" && (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-urgent/20" />
            <div className="absolute inset-4 rounded-full border-2 border-urgent/20" />
            <div className="absolute inset-8 rounded-full border-2 border-urgent/20" />
            <div
              className="animate-radar absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, rgba(232,84,47,0.25) 60deg, transparent 90deg)",
              }}
            />
            <Zap className="h-10 w-10 text-urgent" fill="currentColor" />
          </div>
          <p className="mt-6 font-semibold">Finding your nearest verified pro…</p>
          <p className="mt-1 text-sm text-muted-foreground">3 pros notified nearby</p>
        </div>
      )}

      {/* Stage 4 — honest no-match fallback (ux.md §10) */}
      {stage === "no-match" && (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-urgent-soft text-urgent">
            <MessageSquare className="h-6 w-6" />
          </div>
          <p className="mt-3 font-semibold">No pros available right now</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            We&apos;ve queued your request and will SMS you the moment a verified
            provider accepts. No charge until one is on the way.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Link href={category ? `/services/${category}` : "/services"}>
              <Button variant="outline" full>
                Browse scheduled bookings instead
              </Button>
            </Link>
            <Button variant="ghost" onClick={() => setStage("category")}>
              Try again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
