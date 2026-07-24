"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Briefcase, CalendarDays, MessageSquareQuote } from "lucide-react";
import { PageSpinner } from "@/components/ui/spinner";
import { ErrorBanner, EmptyState } from "@/components/shared/states";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { TrustScoreBadge, VerifiedMark } from "@/components/shared/trust-badge";
import { ProviderApi } from "@/lib/endpoints";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/utils";

const TRUST_SIGNAL_LABELS: Record<string, string> = {
  reviewAvg: "Customer reviews",
  timelinessRate: "On-time rate",
  proofOfWorkScore: "Proof of work",
  verificationScore: "Verification",
};

export default function ProviderProfileClient({ id }: { id: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const { data, loading, error, refetch } = useFetch(() => ProviderApi.publicProfile(id), [id]);

  if (loading) return <PageSpinner />;
  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <ErrorBanner message={error} onRetry={refetch} />
      </div>
    );
  }
  if (!data) return null;

  const { provider, trustBreakdown, neighborhoodStats } = data;

  function handleBook() {
    if (!user) {
      router.push(`/login?next=/providers/${id}/book`);
      return;
    }
    router.push(`/providers/${id}/book`);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary to-primary-hover sm:h-32" />
        <CardContent className="relative -mt-12 pt-0">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar src={provider.profilePhoto} name={provider.legalName} size="xl" className="border-4 border-card" />
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold">{provider.legalName}</h1>
                  {provider.identityStatus === "VERIFIED" && <VerifiedMark />}
                </div>
                {provider.serviceArea && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {provider.serviceArea}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 pb-1">
              <TrustScoreBadge score={provider.trustScore} />
              <Button size="lg" onClick={handleBook}>
                Book this provider
              </Button>
            </div>
          </div>

          {provider.bio && <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">{provider.bio}</p>}

          <div className="mt-5 flex flex-wrap gap-1.5">
            {(provider.categories ?? []).map((c) => (
              <Badge key={c.category.id} variant="neutral">
                {c.category.name}
              </Badge>
            ))}
            {(provider.skills ?? []).map((s) => (
              <Badge key={s.skill} variant="outline">
                {s.skill}
              </Badge>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4">
            <StatBlock icon={Briefcase} label="Jobs completed" value={String(provider.completedBookings)} />
            <StatBlock icon={CalendarDays} label="Experience" value={provider.experienceBadge ?? "New"} />
            <StatBlock
              icon={MessageSquareQuote}
              label="Reviews"
              value={String(provider.reviews?.length ?? 0)}
            />
            {neighborhoodStats[0] && (
              <StatBlock
                icon={MapPin}
                label={neighborhoodStats[0].neighborhood ?? "Local area"}
                value={`${neighborhoodStats[0].homesHelped} homes/mo`}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {trustBreakdown && (
        <Card className="mt-6">
          <CardContent className="py-5">
            <h2 className="text-sm font-semibold">Trust score breakdown</h2>
            <div className="mt-4 space-y-3">
              {Object.entries(TRUST_SIGNAL_LABELS).map(([key, label]) => {
                const value = trustBreakdown[key];
                if (value === undefined) return null;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{label}</span>
                      <span>{Math.round(value)}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, value)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Reviews</h2>
        {!provider.reviews?.length ? (
          <EmptyState className="mt-4" title="No reviews yet" description="Be the first to book and leave a review." />
        ) : (
          <div className="mt-4 space-y-4">
            {provider.reviews.map((r) => (
              <Card key={r.id} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{r.customer?.name ?? "Customer"}</p>
                  <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                </div>
                <StarRating rating={r.rating} className="mt-1.5" />
                {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                {r.reply && (
                  <div className="mt-3 rounded-xl bg-secondary px-4 py-3 text-sm">
                    <p className="text-xs font-medium text-muted-foreground">Provider reply</p>
                    <p className="mt-1">{r.reply}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Prefer to browse more first? <Link href="/services" className="text-primary hover:underline">Back to services</Link>
      </p>
    </div>
  );
}

function StatBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
