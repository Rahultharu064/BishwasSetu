"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Upload,
  Check,
  ShieldCheck,
  IdCard,
  Camera,
  FileBadge,
  X,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DocField {
  key: "governmentId" | "selfie" | "certificate";
  label: string;
  hint: string;
  icon: React.ReactNode;
  required: boolean;
}

const FIELDS: DocField[] = [
  {
    key: "governmentId",
    label: "Citizenship / Passport",
    hint: "Full document, all edges visible, no glare.",
    icon: <IdCard className="h-5 w-5" />,
    required: true,
  },
  {
    key: "selfie",
    label: "Selfie",
    hint: "Clear, natural light — must match your ID photo.",
    icon: <Camera className="h-5 w-5" />,
    required: true,
  },
  {
    key: "certificate",
    label: "CTEVT / Professional certificate",
    hint: "Optional — proves your skill for the Skilled badge.",
    icon: <FileBadge className="h-5 w-5" />,
    required: false,
  },
];

export default function KycUploadPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated)
      router.replace("/login?next=/provider/kyc");
  }, [authLoading, isAuthenticated, router]);

  const [files, setFiles] = useState<Partial<Record<DocField["key"], File>>>({});
  const [busy, setBusy] = useState(false);

  const canSubmit = !!files.governmentId && !!files.selfie;

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    try {
      const form = new FormData();
      Object.entries(files).forEach(([k, f]) => f && form.append(k, f));
      await api.uploadKyc(form);
      toast("Documents submitted — usually reviewed within 4 hours.", "success");
      router.push("/provider/kyc/status");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Upload failed. Try again.",
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
        href="/provider/onboarding"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Verification
      </Link>

      <h1 className="text-2xl font-bold tracking-tight">Upload your documents</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Encrypted and used only for verification. A human double-checks the AI review.
      </p>

      <div className="mt-6 space-y-3">
        {FIELDS.map((f) => (
          <FileRow
            key={f.key}
            field={f}
            file={files[f.key]}
            onSelect={(file) => setFiles((prev) => ({ ...prev, [f.key]: file }))}
            onClear={() =>
              setFiles((prev) => {
                const copy = { ...prev };
                delete copy[f.key];
                return copy;
              })
            }
          />
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-xl bg-primary-soft p-4">
        <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-foreground">
          Your video/ID is stored encrypted and never shown on your public profile.
        </p>
      </div>

      <Button full size="lg" className="mt-6" onClick={submit} disabled={!canSubmit || busy}>
        <Upload className="h-4 w-4" />
        {busy ? "Uploading…" : "Submit for review"}
      </Button>
      {!canSubmit && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          ID and selfie are required to submit.
        </p>
      )}
    </div>
  );
}

function FileRow({
  field,
  file,
  onSelect,
  onClear,
}: {
  field: DocField;
  file?: File;
  onSelect: (f: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Creates a browser object-URL resource (with matching cleanup) — a genuine
  // external-system sync, not derivable state.
  useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [file]);

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        file ? "border-primary/50 bg-primary-soft/30" : "border-dashed border-border bg-card"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            file ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          )}
        >
          {file ? <Check className="h-5 w-5" /> : field.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-medium">
            {field.label}
            {field.required && <span className="text-xs text-urgent">*</span>}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {file ? file.name : field.hint}
          </p>
        </div>
        {file ? (
          <button
            onClick={onClear}
            aria-label="Remove file"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
            Choose
          </Button>
        )}
      </div>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt={`${field.label} preview`}
          className="mt-3 max-h-40 w-full rounded-lg object-cover"
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onSelect(f);
        }}
      />
    </div>
  );
}
