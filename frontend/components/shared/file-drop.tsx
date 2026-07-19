"use client";

import * as React from "react";
import { Upload, FileCheck2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileDrop({
  label,
  hint,
  file,
  onChange,
  required,
}: {
  label: string;
  hint?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
}) {
  const inputId = React.useId();

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <label
        htmlFor={inputId}
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-4 text-sm transition-colors hover:bg-secondary/60",
          file ? "border-success/40 bg-success/5" : "border-border"
        )}
      >
        {file ? <FileCheck2 className="h-5 w-5 shrink-0 text-success" /> : <Upload className="h-5 w-5 shrink-0 text-muted-foreground" />}
        <div className="min-w-0">
          <p className={cn("truncate font-medium", file && "text-success")}>{file ? file.name : "Choose a file or take a photo"}</p>
          {hint && !file && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
