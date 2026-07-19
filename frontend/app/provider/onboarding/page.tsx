"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageSpinner } from "@/components/ui/spinner";
import { ErrorBanner } from "@/components/shared/states";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { ChipInput } from "@/components/shared/chip-input";
import { ServiceApi, ProviderApi } from "@/lib/endpoints";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const { user, bootstrapping } = useAuth();

  React.useEffect(() => {
    if (!bootstrapping && !user) router.replace("/login?next=/provider/onboarding");
    if (user && user.role !== "PROVIDER") router.replace("/services");
  }, [bootstrapping, user, router]);

  const { data: categories, loading: catsLoading } = useFetch(() => ServiceApi.categories(), []);

  const [legalName, setLegalName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [serviceArea, setServiceArea] = React.useState("");
  const [experienceYears, setExperienceYears] = React.useState("0");
  const [skills, setSkills] = React.useState<string[]>([]);
  const [categoryIds, setCategoryIds] = React.useState<string[]>([]);
  const [days, setDays] = React.useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("18:00");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function toggleCategory(id: string) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 5 ? [...prev, id] : prev));
  }

  function toggleDay(day: number) {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (categoryIds.length === 0) return setError("Choose at least one service category.");
    if (skills.length === 0) return setError("Add at least one skill.");
    if (!serviceArea.trim()) return setError("Enter your service area.");
    if (days.length === 0) return setError("Select at least one available day.");

    setSubmitting(true);
    try {
      await ProviderApi.completeProfile({
        legalName: legalName.trim(),
        bio: bio.trim() || undefined,
        serviceArea: serviceArea.trim(),
        experienceYears: Number(experienceYears),
        skills,
        categoryIds,
        availability: days.map((dayOfWeek) => ({ dayOfWeek, startTime, endTime })),
      });
      router.push("/provider/kyc");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (bootstrapping || !user) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Complete your provider profile</h1>
      <p className="mt-1.5 text-muted-foreground">
        This is what customers will see. You&apos;ll verify your identity in the next step.
      </p>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <ErrorBanner message={error} />}

            <div>
              <Label htmlFor="legalName">Full legal name</Label>
              <Input id="legalName" required value={legalName} onChange={(e) => setLegalName(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="bio">Short bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell customers about your experience and specialties."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="serviceArea">Service area</Label>
                <Input
                  id="serviceArea"
                  required
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Kathmandu — Baneshwor"
                />
              </div>
              <div>
                <Label htmlFor="experienceYears">Years of experience</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min={0}
                  max={50}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Skills</Label>
              <ChipInput values={skills} onChange={setSkills} placeholder="Type a skill and press Enter" />
            </div>

            <div>
              <Label>Service categories (up to 5)</Label>
              {catsLoading ? (
                <p className="text-sm text-muted-foreground">Loading categories…</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(categories ?? []).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCategory(c.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                        categoryIds.includes(c.id)
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      {c.icon} {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Available days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={cn(
                      "h-10 w-12 rounded-xl border text-sm font-medium transition-colors",
                      days.includes(i)
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-border text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start">Available from</Label>
                <Input id="start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="end">Available until</Label>
                <Input id="end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={submitting}>
              Save &amp; continue to verification
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
