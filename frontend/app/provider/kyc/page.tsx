"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { PageSpinner } from "@/components/ui/spinner";
import { ErrorBanner } from "@/components/shared/states";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDrop } from "@/components/shared/file-drop";
import { KycStatusBadge } from "@/components/shared/status-badge";
import { KycApi } from "@/lib/endpoints";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function ProviderKycPage() {
  const router = useRouter();
  const { user, bootstrapping } = useAuth();

  React.useEffect(() => {
    if (!bootstrapping && !user) router.replace("/login?next=/provider/kyc");
    if (user && user.role !== "PROVIDER") router.replace("/services");
  }, [bootstrapping, user, router]);

  const { data: status, loading, error, refetch } = useFetch(
    () => (user ? KycApi.status() : Promise.resolve(null)),
    [user]
  );

  const [governmentId, setGovernmentId] = React.useState<File | null>(null);
  const [selfie, setSelfie] = React.useState<File | null>(null);
  const [certificate, setCertificate] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const hasIdAndSelfie = governmentId && selfie;
    if (!hasIdAndSelfie && !certificate) {
      setSubmitError("Upload a government ID with a selfie, or a professional certificate.");
      return;
    }

    const form = new FormData();
    if (governmentId) form.append("governmentId", governmentId);
    if (selfie) form.append("selfie", selfie);
    if (certificate) form.append("certificate", certificate);

    setSubmitting(true);
    try {
      await KycApi.upload(form);
      setSubmitted(true);
      refetch();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Could not upload your documents. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (bootstrapping || loading || !user) return <PageSpinner />;

  const identityStatus = status?.identityStatus ?? "PENDING_DOCUMENTS";
  const canUpload = ["PENDING_DOCUMENTS", "REJECTED"].includes(identityStatus);

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Identity verification</h1>
          <p className="text-sm text-muted-foreground">Required before you can accept bookings.</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <Card className="mt-6">
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
            <span className="text-sm font-medium">Current status</span>
            <KycStatusBadge status={identityStatus} />
          </div>

          {identityStatus === "UNDER_REVIEW" && (
            <p className="rounded-xl bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
              Your documents are with our team for manual review. This is usually quick — we&apos;ll
              notify you as soon as it&apos;s decided.
            </p>
          )}

          {identityStatus === "VERIFIED" && (
            <p className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
              You&apos;re verified! You can now accept bookings.
            </p>
          )}

          {status?.identityRejectionReason && (
            <p className="rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
              Last submission was rejected: {status.identityRejectionReason}
            </p>
          )}

          {canUpload && !submitted && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && <ErrorBanner message={submitError} />}

              <FileDrop
                label="Government ID"
                hint="Citizenship, passport, or driver's license"
                file={governmentId}
                onChange={setGovernmentId}
              />
              <FileDrop label="Selfie" hint="A clear photo of your face" file={selfie} onChange={setSelfie} />
              <FileDrop
                label="Professional certificate (optional)"
                hint="CTEVT or similar, if you have one"
                file={certificate}
                onChange={setCertificate}
              />

              <Button type="submit" className="w-full" size="lg" loading={submitting}>
                Submit for review
              </Button>
            </form>
          )}

          {submitted && (
            <p className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
              Documents submitted! We&apos;ll review them shortly.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
