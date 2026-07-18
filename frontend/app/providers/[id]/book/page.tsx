"use client";

import * as React from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Zap } from "lucide-react";
import { PageSpinner } from "@/components/ui/spinner";
import { ErrorBanner } from "@/components/shared/states";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, Select } from "@/components/ui/input";
import { VerifiedMark } from "@/components/shared/trust-badge";
import { ProviderApi, BookingApi } from "@/lib/endpoints";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function BookProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, bootstrapping } = useAuth();

  const { data, loading, error } = useFetch(() => ProviderApi.publicProfile(id), [id]);

  const [categoryId, setCategoryId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [priceNpr, setPriceNpr] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<"KHALTI" | "ESEWA" | "CASH">("KHALTI");
  const [neighborhood, setNeighborhood] = React.useState("");
  const [isEmergency, setIsEmergency] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!bootstrapping && !user) {
      router.replace(`/login?next=/providers/${id}/book`);
    }
    if (user && user.role !== "CUSTOMER") {
      router.replace(`/providers/${id}`);
    }
  }, [bootstrapping, user, id, router]);

  React.useEffect(() => {
    const first = data?.provider.categories?.[0]?.category.id;
    if (first && !categoryId) setCategoryId(first);
  }, [data, categoryId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const priceNum = Number(priceNpr);
    if (!categoryId) return setFormError("Choose what kind of service you need.");
    if (description.trim().length < 10) return setFormError("Describe the job in a bit more detail (10+ characters).");
    if (!scheduledAt) return setFormError("Pick a date and time.");
    if (new Date(scheduledAt) <= new Date()) return setFormError("Scheduled time must be in the future.");
    if (!priceNum || priceNum < 100) return setFormError("Enter a proposed price of at least NPR 100.");

    setSubmitting(true);
    try {
      const booking = await BookingApi.create({
        providerId: id,
        categoryId,
        description: description.trim(),
        scheduledAt: new Date(scheduledAt).toISOString(),
        priceNpr: priceNum,
        paymentMethod,
        isEmergency,
        neighborhood: neighborhood.trim() || undefined,
      });
      router.push(`/bookings/${booking.id}?created=1`);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not create the booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || bootstrapping) return <PageSpinner />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <ErrorBanner message={error ?? "Provider not found."} />
      </div>
    );
  }

  const { provider } = data;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href={`/providers/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back to profile
      </Link>

      <h1 className="mt-3 text-2xl font-bold tracking-tight">Request a booking</h1>

      <Card className="mt-5 flex items-center gap-3 p-4">
        <Avatar src={provider.profilePhoto} name={provider.legalName} />
        <div>
          <p className="flex items-center gap-2 font-medium">
            {provider.legalName}
            {provider.identityStatus === "VERIFIED" && <VerifiedMark />}
          </p>
          <p className="text-xs text-muted-foreground">{provider.serviceArea}</p>
        </div>
      </Card>

      <Card className="mt-4">
        <CardContent className="space-y-5 pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && <ErrorBanner message={formError} />}

            <div>
              <Label htmlFor="category">What do you need?</Label>
              <Select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                {(provider.categories ?? []).map((c) => (
                  <option key={c.category.id} value={c.category.id}>
                    {c.category.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Describe the job</Label>
              <Textarea
                id="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Kitchen sink is leaking under the cabinet, needs inspection and repair."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="scheduledAt">Preferred date &amp; time</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="price">Proposed price (NPR)</Label>
                <Input
                  id="price"
                  type="number"
                  min={100}
                  required
                  value={priceNpr}
                  onChange={(e) => setPriceNpr(e.target.value)}
                  placeholder="e.g. 1500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="neighborhood">Neighborhood (optional)</Label>
              <Input
                id="neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="e.g. Maharajgunj"
              />
            </div>

            <div>
              <Label className="mb-2">How would you like to pay?</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["KHALTI", "ESEWA", "CASH"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                      paymentMethod === method
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-border text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    {method === "KHALTI" ? "Khalti" : method === "ESEWA" ? "eSewa" : "Cash"}
                  </button>
                ))}
              </div>
              {paymentMethod === "CASH" ? (
                <p className="mt-2 text-xs text-warning-foreground">
                  Cash bookings aren&apos;t escrow-protected — you won&apos;t have a workmanship
                  guarantee if something goes wrong. We recommend paying in-app.
                </p>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  You&apos;ll pay after the provider accepts. Funds stay in escrow until you confirm
                  the job is done.
                </p>
              )}
            </div>

            <label className="flex items-center gap-2.5 rounded-xl border border-border px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              <Zap className="h-4 w-4 text-accent" />
              This is urgent — flag as an emergency request
            </label>

            <Button type="submit" className="w-full" size="lg" loading={submitting}>
              Send booking request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
