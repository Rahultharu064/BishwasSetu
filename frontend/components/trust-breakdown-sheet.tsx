"use client";

import { Star, Clock, AlertTriangle, ShieldCheck, Camera } from "lucide-react";
import { Sheet } from "./ui/sheet";
import type { KycTier } from "@/lib/types";

// Trust Score Breakdown Sheet — the exact PRD §4.1 model, made human (ux.md §8.1)
const VERIFICATION_POINTS: Record<KycTier, string> = {
  TIER_3_VERIFIED: "10 / 10",
  TIER_2_SKILLED: "6 / 10",
  TIER_1_BASIC: "2 / 10",
};

export function TrustBreakdownSheet({
  open,
  onClose,
  score,
  tier,
}: {
  open: boolean;
  onClose: () => void;
  score: number;
  tier: KycTier;
}) {
  const rows = [
    {
      icon: <Star className="h-4 w-4" />,
      label: "Customer reviews",
      weight: "40%",
      detail: "Stars, weighted toward recent jobs",
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: "On-time arrival",
      weight: "20%",
      detail: "% on-time, GPS-verified",
    },
    {
      icon: <AlertTriangle className="h-4 w-4" />,
      label: "Complaints",
      weight: "−20%",
      detail: "Per 100 bookings",
    },
    {
      icon: <ShieldCheck className="h-4 w-4" />,
      label: "Verification",
      weight: "10%",
      detail: `Tier verification: ${VERIFICATION_POINTS[tier]}`,
    },
    {
      icon: <Camera className="h-4 w-4" />,
      label: "Proof-of-Work",
      weight: "10%",
      detail: "% of jobs with AI-verified photos",
    },
  ];

  return (
    <Sheet open={open} onClose={onClose} title="How the trust score works">
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-primary-soft p-4">
        <span className="tabular text-3xl font-bold text-primary">
          {Math.round(score)}
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">out of 100</p>
          <p className="text-xs text-muted-foreground">
            Fully transparent — no pay-to-rank
          </p>
        </div>
      </div>

      <ul className="space-y-1">
        {rows.map((r) => (
          <li
            key={r.label}
            className="flex items-start gap-3 rounded-lg px-2 py-2.5"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              {r.icon}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{r.label}</p>
                <span className="tabular text-sm font-semibold text-primary">
                  {r.weight}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{r.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Providers know exactly how to improve — and customers can trust the number.
      </p>
    </Sheet>
  );
}
