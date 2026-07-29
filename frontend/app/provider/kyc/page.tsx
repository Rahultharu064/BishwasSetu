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
  Images,
  X,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SkillEvidenceType } from "@/lib/types";

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

      <h1 id="identity" className="scroll-mt-6 text-2xl font-bold tracking-tight">
        Upload your documents
      </h1>
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

      <div className="mt-10 border-t border-border pt-8">
        <h2 id="skill-evidence" className="scroll-mt-6 text-xl font-bold tracking-tight">
          Skill evidence
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A CTEVT/professional certificate or a few photos of completed work —
          proves your craft and unlocks the Skilled badge.
        </p>
        <div className="mt-4">
          <SkillEvidenceForm />
        </div>
      </div>
    </div>
  );
}

const EVIDENCE_TYPES: { value: SkillEvidenceType; label: string; hint: string; icon: React.ReactNode }[] = [
  {
    value: "certificate",
    label: "Certificate",
    hint: "CTEVT or another professional certificate",
    icon: <FileBadge className="h-4 w-4" />,
  },
  {
    value: "work_photo",
    label: "Work photos",
    hint: "Up to 3 photos of jobs you've completed",
    icon: <Images className="h-4 w-4" />,
  },
];

function SkillEvidenceForm() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<SkillEvidenceType>("certificate");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  const maxFiles = type === "certificate" ? 1 : 3;

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, maxFiles);
    setFiles(next);
  }

  async function submit() {
    if (!files.length) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("type", type);
      files.forEach((f) => form.append("files", f));
      const result = await api.submitSkillEvidence(form);
      toast(result.message, "success");
      setFiles([]);
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Submission failed. Try again.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-4">
      <div className="flex gap-2">
        {EVIDENCE_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => {
              setType(t.value);
              setFiles([]);
            }}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors",
              type === t.value
                ? "border-primary bg-primary-soft text-primary"
                : "border-border text-muted-foreground hover:bg-secondary"
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {EVIDENCE_TYPES.find((t) => t.value === type)?.hint}
      </p>

      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-xs"
            >
              <span className="truncate">{f.name}</span>
              <button
                type="button"
                aria-label="Remove file"
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                className="ml-2 shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {files.length < maxFiles && (
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="h-3.5 w-3.5" /> Add {files.length ? "another" : "file"}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        multiple={maxFiles > 1}
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      <Button
        full
        className="mt-4"
        onClick={submit}
        disabled={!files.length || busy}
      >
        <Upload className="h-4 w-4" />
        {busy ? "Submitting…" : "Submit for review"}
      </Button>
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
