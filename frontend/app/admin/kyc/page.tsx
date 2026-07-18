"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, FileText, ExternalLink } from "lucide-react";
import { PageSpinner } from "@/components/ui/spinner";
import { EmptyState, ErrorBanner } from "@/components/shared/states";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { AdminApi, KycApi } from "@/lib/endpoints";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import type { AdminKycQueueItem } from "@/lib/types";

export default function AdminKycQueuePage() {
  const router = useRouter();
  const { user, bootstrapping } = useAuth();

  React.useEffect(() => {
    if (!bootstrapping && !user) router.replace("/login?next=/admin/kyc");
    if (user && user.role !== "ADMIN" && user.role !== "MODERATOR") router.replace("/services");
  }, [bootstrapping, user, router]);

  const { data, loading, error, refetch } = useFetch(
    () => (user ? AdminApi.kycQueue({ limit: 30 }) : Promise.resolve(null)),
    [user]
  );

  if (bootstrapping || loading || !user) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Admin overview
      </Link>

      <h1 className="mt-3 text-3xl font-bold tracking-tight">KYC review queue</h1>
      <p className="mt-1.5 text-muted-foreground">
        Manual review is enabled for the pilot — no automated approvals.
      </p>

      <div className="mt-6">
        {error ? (
          <ErrorBanner message={error} onRetry={refetch} />
        ) : !data?.queue?.length ? (
          <EmptyState title="Queue is empty" description="No providers are waiting on identity review right now." />
        ) : (
          <div className="space-y-4">
            {data.queue.map((item) => (
              <QueueRow key={item.id} item={item} onDecided={refetch} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QueueRow({ item, onDecided }: { item: AdminKycQueueItem; onDecided: () => void }) {
  const [showReject, setShowReject] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [busy, setBusy] = React.useState<"approve" | "reject" | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [docs, setDocs] = React.useState<{ type: string; signedUrl: string }[] | null>(null);
  const [docsLoading, setDocsLoading] = React.useState(false);

  async function loadDocs() {
    if (docs) return setDocs(null);
    setDocsLoading(true);
    try {
      const result = await KycApi.adminDocuments(item.id);
      setDocs(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load documents.");
    } finally {
      setDocsLoading(false);
    }
  }

  async function handleApprove() {
    setError(null);
    setBusy("approve");
    try {
      await AdminApi.approveKyc(item.id);
      onDecided();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not approve.");
    } finally {
      setBusy(null);
    }
  }

  async function handleReject() {
    if (!reason.trim()) return;
    setError(null);
    setBusy("reject");
    try {
      await AdminApi.rejectKyc(item.id, reason.trim());
      onDecided();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reject.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {error && <ErrorBanner message={error} />}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={item.legalName} size="lg" />
            <div>
              <p className="font-semibold">{item.legalName}</p>
              <p className="text-xs text-muted-foreground">
                {item.user?.email ?? item.user?.phone} &middot; {item.serviceArea ?? "No area set"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">Submitted {formatDateTime(item.updatedAt)}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadDocs} loading={docsLoading}>
            <FileText className="h-3.5 w-3.5" /> {docs ? "Hide" : "View"} documents
          </Button>
        </div>

        {docs && (
          <div className="flex flex-wrap gap-2 rounded-xl bg-secondary/60 p-3">
            {docs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No documents uploaded.</p>
            ) : (
              docs.map((d) => (
                <a
                  key={d.type}
                  href={d.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                >
                  {d.type.replace("_", " ")} <ExternalLink className="h-3 w-3" />
                </a>
              ))
            )}
          </div>
        )}

        {!showReject ? (
          <div className="flex gap-2">
            <Button size="sm" loading={busy === "approve"} onClick={handleApprove}>
              Approve
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowReject(true)}>
              Reject
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejection (shown to the provider)"
            />
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" loading={busy === "reject"} disabled={!reason.trim()} onClick={handleReject}>
                Confirm reject
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowReject(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
