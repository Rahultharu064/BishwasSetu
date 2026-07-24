"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquareWarning, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { relativeTime } from "@/lib/format";
import type { Complaint } from "@/lib/types";
import {
  ComplaintStatusBadge,
  COMPLAINT_TYPE_LABEL,
} from "@/components/complaint-bits";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";

function listFrom(data: unknown): Complaint[] {
  if (Array.isArray(data)) return data as Complaint[];
  if (data && typeof data === "object") {
    const c = (data as { complaints?: Complaint[] }).complaints;
    if (Array.isArray(c)) return c;
  }
  return [];
}

export default function ComplaintsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated)
      router.replace("/login?next=/complaints");
  }, [authLoading, isAuthenticated, router]);

  const { data, loading, error, reload } = useFetch(
    () => api.myComplaints(),
    [isAuthenticated]
  );
  const complaints = listFrom(data);

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">My complaints</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Track issues you&apos;ve reported and their resolution.
      </p>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints"
            description="You haven't reported any issues. If a job goes wrong, you can report it from the booking — escrow pauses while we review."
            icon={<MessageSquareWarning className="h-8 w-8" />}
            action={{ label: "View bookings", onClick: () => router.push("/bookings") }}
          />
        ) : (
          <ul className="space-y-3">
            {complaints.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/complaints/${c.id}`}
                  className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {COMPLAINT_TYPE_LABEL[c.type] ?? c.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {c.provider?.legalName
                          ? `Against ${c.provider.legalName}`
                          : "Booking issue"}
                      </p>
                    </div>
                    <ComplaintStatusBadge status={c.status} />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Filed {relativeTime(c.createdAt)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-primary" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
