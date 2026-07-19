import Link from "next/link";
import { MapPin, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { VerifiedMark, TrustScoreBadge } from "@/components/shared/trust-badge";
import type { ProviderSummary } from "@/lib/types";

export function ProviderCard({ provider }: { provider: ProviderSummary }) {
  return (
    <Link href={`/providers/${provider.id}`}>
      <Card className="flex h-full flex-col gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lifted)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar src={provider.profilePhoto} name={provider.legalName} size="lg" />
            <div>
              <p className="font-semibold leading-tight">{provider.legalName}</p>
              {provider.identityStatus === "VERIFIED" && <VerifiedMark className="mt-1" />}
            </div>
          </div>
        </div>

        {provider.bio && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{provider.bio}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {(provider.categories ?? []).slice(0, 3).map((c) => (
            <span
              key={c.category.id}
              className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
            >
              {c.category.name}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <div className="space-y-1 text-xs text-muted-foreground">
            {provider.serviceArea && (
              <p className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {provider.serviceArea}
              </p>
            )}
            <p className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" /> {provider.completedBookings} jobs completed
            </p>
          </div>
          <TrustScoreBadge score={provider.trustScore} />
        </div>
      </Card>
    </Link>
  );
}
