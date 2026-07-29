"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  Camera,
  BadgeCheck,
  ShieldCheck,
  Check,
  Lock,
  Clock,
  ChevronRight,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import type { KycTier } from "@/lib/types";

interface Tier {
  id: number;
  code: KycTier;
  name: string;
  nameNp: string;
  icon: React.ReactNode;
  reqs: string[];
  unlocks: string;
  href: string;
}

const TIERS: Tier[] = [
  {
    id: 1,
    code: "TIER_1_BASIC",
    name: "Basic",
    nameNp: "आधारभूत",
    icon: <Phone className="h-5 w-5" />,
    reqs: ["Phone OTP", "Profile photo", "3 work photos"],
    unlocks: "Accept jobs under NPR 1,000",
    href: "/provider/me",
  },
  {
    id: 2,
    code: "TIER_2_SKILLED",
    name: "Skilled",
    nameNp: "दक्ष",
    icon: <BadgeCheck className="h-5 w-5" />,
    reqs: ["CTEVT / professional certificate"],
    unlocks: "All standard jobs + Skilled badge",
    href: "/provider/kyc#skill-evidence",
  },
  {
    id: 3,
    code: "TIER_3_VERIFIED",
    name: "Verified & Insured",
    nameNp: "प्रमाणित तथा बीमित",
    icon: <ShieldCheck className="h-5 w-5" />,
    reqs: ["Citizenship / passport", "Video KYC selfie"],
    unlocks: "High-value jobs · Trust badge · Insurance",
    href: "/provider/kyc#identity",
  },
];

const TIER_INDEX: Record<KycTier, number> = {
  TIER_1_BASIC: 1,
  TIER_2_SKILLED: 2,
  TIER_3_VERIFIED: 3,
};

interface DashboardProvider {
  kycTier: KycTier;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated)
      router.replace("/login?next=/provider/onboarding");
  }, [authLoading, isAuthenticated, router]);

  const { data, loading, error, reload } = useFetch<{ provider: DashboardProvider }>(
    () => apiRequest<{ provider: DashboardProvider }>("/providers/me/dashboard", { auth: true }),
    [isAuthenticated]
  );

  if (authLoading || !isAuthenticated) return null;

  if (loading)
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );

  if (error || !data)
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <ErrorState message={error ?? "Couldn't load your verification status."} onRetry={reload} />
      </div>
    );

  const completed = TIER_INDEX[data.provider.kycTier] ?? 1;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Your verification</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Level up to unlock more work. A CTEVT certificate + 3 work photos is a
        stronger signal than an ID alone.
      </p>

      {/* Progress summary */}
      <div className="mt-5 flex items-center gap-3 rounded-xl bg-primary-soft p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
          {completed}/3
        </div>
        <div>
          <p className="font-semibold">
            {completed >= 3
              ? "Fully verified & insured"
              : `Tier ${completed} unlocked`}
          </p>
          <p className="text-sm text-muted-foreground">
            {completed >= 3
              ? "You have full access to all jobs."
              : "Usually approved within 4 hours."}
          </p>
        </div>
      </div>

      {/* Tier ladder */}
      <ol className="mt-6 space-y-3">
        {TIERS.map((tier) => {
          const done = tier.id <= completed;
          const current = tier.id === completed + 1;
          const locked = tier.id > completed + 1;

          return (
            <li
              key={tier.id}
              className={`rounded-2xl border p-5 ${
                current
                  ? "border-primary bg-card shadow-sm"
                  : "border-border bg-card"
              } ${locked ? "opacity-70" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    done
                      ? "bg-primary text-primary-foreground"
                      : locked
                        ? "bg-secondary text-muted-foreground"
                        : "bg-primary-soft text-primary"
                  }`}
                >
                  {done ? <Check className="h-5 w-5" /> : locked ? <Lock className="h-4 w-4" /> : tier.icon}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">
                      Tier {tier.id} — {tier.name}
                    </p>
                    {done && (
                      <Badge variant="soft" size="sm">
                        Complete
                      </Badge>
                    )}
                    {current && (
                      <Badge variant="skilled" size="sm">
                        You are here
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{tier.nameNp}</p>
                </div>
              </div>

              <ul className="mt-3 space-y-1.5 pl-1 text-sm text-muted-foreground">
                {tier.reqs.map((r) => (
                  <li key={r} className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        done ? "bg-primary" : "bg-muted-foreground"
                      }`}
                    />
                    {r}
                  </li>
                ))}
              </ul>

              <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-secondary p-2.5 text-sm font-medium">
                <ChevronRight className="h-4 w-4 text-primary" /> {tier.unlocks}
              </p>

              {current && tier.id !== 1 && (
                <Link href={tier.href} className="mt-4 block">
                  <Button full>
                    <Camera className="h-4 w-4" /> Upload documents
                  </Button>
                </Link>
              )}
              {!done && !current && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Finish the previous tier first
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        A human reviewer double-checks the AI&apos;s decision.{" "}
        <Link href="/trust-safety" className="text-primary hover:underline">
          How verification works
        </Link>
      </p>
    </div>
  );
}
