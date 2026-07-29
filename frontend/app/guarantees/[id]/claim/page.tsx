"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ShieldCheck,
  Images,
  X,
  AlertTriangle,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { npr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";

interface Guarantee {
  id: string;
  status: "ACTIVE" | "EXPIRED" | "CLAIMED" | "RESOLVED";
  expiresAt: string;
  escrow: { bookingId: string; amountPaisa: number };
}

const MIN_DESCRIPTION = 10;
const MAX_PHOTOS = 5;

export default function FileGuaranteeClaimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated)
      router.replace(`/login?next=/guarantees/${id}/claim`);
  }, [authLoading, isAuthenticated, router, id]);

  const { data, loading, error, reload } = useFetch<Guarantee[]>(
    () => api.myGuarantees() as Promise<Guarantee[]>,
    [isAuthenticated]
  );
  const guarantee = data?.find((g) => g.id === id);

  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  function addPhotos(list: FileList | null) {
    if (!list) return;
    setPhotos((prev) => [...prev, ...Array.from(list)].slice(0, MAX_PHOTOS));
  }

  function removePhoto(i: number) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  }

  const canSubmit = description.trim().length >= MIN_DESCRIPTION;

  async function submit() {
    if (!canSubmit || busy) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("description", description.trim());
      photos.forEach((f) => form.append("photos", f));
      await api.fileGuaranteeClaim(id, form);
      toast("Claim filed. Our team will review it shortly.", "success");
      router.push("/guarantees");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Couldn't file the claim. Try again.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  }

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link
        href="/guarantees"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Guarantees
      </Link>

      <h1 className="text-2xl font-bold tracking-tight">File a workmanship claim</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell us what went wrong. The provider must return to fix it at no
        extra cost, or the claim is backed by platform escrow.
      </p>

      {loading ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : error ? (
        <div className="mt-6">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : !guarantee ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">Guarantee not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            It may have already been resolved or doesn&apos;t belong to you.
          </p>
        </div>
      ) : guarantee.status !== "ACTIVE" ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">
            {guarantee.status === "CLAIMED"
              ? "A claim is already in review"
              : guarantee.status === "RESOLVED"
                ? "This guarantee has already been resolved"
                : "This guarantee has expired"}
          </p>
          <Link href="/guarantees">
            <Button variant="outline" className="mt-4">Back to guarantees</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary-soft p-4">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-foreground">
                Booking #{guarantee.escrow.bookingId.slice(0, 8)}
              </p>
              <p className="text-muted-foreground">
                Covered up to {npr(guarantee.escrow.amountPaisa / 100)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Label htmlFor="description">What went wrong?</Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Describe the issue in detail — e.g. the pipe fitting installed yesterday is leaking again."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {description.trim().length < MIN_DESCRIPTION
                ? `At least ${MIN_DESCRIPTION} characters required.`
                : `${description.length}/2000`}
            </p>
          </div>

          <div className="mt-5">
            <Label>Photo evidence (optional)</Label>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                addPhotos(e.target.files);
                e.target.value = "";
              }}
            />

            <div className="grid grid-cols-3 gap-2">
              {photos.map((f, i) => (
                <PhotoThumb key={i} file={f} onRemove={() => removePhoto(i)} />
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground hover:bg-secondary"
                >
                  <Images className="h-5 w-5" />
                  <span className="text-xs font-medium">Add</span>
                </button>
              )}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Up to {MAX_PHOTOS} photos. Clear shots of the issue help us resolve faster.
            </p>
          </div>

          <Button
            full
            size="lg"
            className="mt-6"
            onClick={submit}
            disabled={!canSubmit || busy}
          >
            <AlertTriangle className="h-4 w-4" />
            {busy ? "Filing claim…" : "File claim"}
          </Button>
        </>
      )}
    </div>
  );
}

function PhotoThumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove photo"
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground/70 text-background"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
