"use client";

import { useState } from "react";
import { MessageSquareWarning, AlertTriangle } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useToast } from "@/context/toast-context";
import { relativeTime } from "@/lib/format";
import type { Complaint } from "@/lib/types";
import {
  ComplaintStatusBadge,
  COMPLAINT_TYPE_LABEL,
} from "@/components/complaint-bits";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";
import { Textarea, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "DISMISSED", label: "Dismissed" },
];

const ACTIONS = [
  { value: "WARNING", label: "Warn provider" },
  { value: "REFUND", label: "Refund customer" },
  { value: "SUSPENSION", label: "Suspend provider" },
  { value: "BAN", label: "Ban provider" },
  { value: "DISMISSED", label: "Dismiss complaint" },
];

function listFrom(data: unknown): Complaint[] {
  if (Array.isArray(data)) return data as Complaint[];
  if (data && typeof data === "object") {
    const c = (data as { complaints?: Complaint[] }).complaints;
    if (Array.isArray(c)) return c;
  }
  return [];
}

export default function AdminComplaintsPage() {
  const { toast } = useToast();
  const [status, setStatus] = useState("");
  const req = useFetch(
    () => api.adminComplaints({ status: status || undefined, limit: 30 }),
    [status]
  );
  const complaints = listFrom(req.data);

  const [selected, setSelected] = useState<Complaint | null>(null);
  const [resolution, setResolution] = useState("");
  const [action, setAction] = useState("WARNING");
  const [busy, setBusy] = useState(false);

  async function resolve() {
    if (!selected || resolution.trim().length < 10) return;
    setBusy(true);
    try {
      await api.adminResolveComplaint(selected.id, {
        resolution: resolution.trim(),
        action,
      });
      toast("Complaint resolved.", "success");
      setSelected(null);
      setResolution("");
      req.reload();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't resolve.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Complaints</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Critical complaints surface first. Resolving one lifts the escrow hold.
      </p>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            onClick={() => setStatus(f.value)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium ${
              status === f.value
                ? "border-primary bg-primary-soft text-primary"
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {req.loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : req.error ? (
          <ErrorState message={req.error} onRetry={req.reload} />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints"
            description="Nothing to review in this filter."
            icon={<MessageSquareWarning className="h-8 w-8" />}
          />
        ) : (
          <ul className="space-y-3">
            {complaints.map((c) => {
              const critical = c.aiCategory === "critical";
              const open = c.status === "OPEN" || c.status === "UNDER_REVIEW";
              return (
                <li
                  key={c.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={c.customer?.name ?? "Customer"}
                      size={40}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">
                          {COMPLAINT_TYPE_LABEL[c.type] ?? c.type}
                        </p>
                        {critical && (
                          <Badge variant="urgentSoft" size="sm">
                            <AlertTriangle className="h-3 w-3" /> Critical
                          </Badge>
                        )}
                        <ComplaintStatusBadge status={c.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {c.customer?.name} vs{" "}
                        {c.provider?.legalName ?? "provider"} ·{" "}
                        {relativeTime(c.createdAt)}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-foreground">
                        {c.description}
                      </p>
                    </div>
                  </div>
                  {open && (
                    <div className="mt-3 flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelected(c);
                          setAction("WARNING");
                        }}
                      >
                        Resolve
                      </Button>
                    </div>
                  )}
                  {c.resolution && (
                    <p className="mt-3 rounded-lg bg-primary-soft p-3 text-sm">
                      <span className="font-medium">Resolution:</span>{" "}
                      {c.resolution}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Resolve sheet */}
      <Sheet
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Resolve complaint"
      >
        {selected && (
          <>
            <div className="rounded-lg bg-secondary p-3 text-sm">
              <p className="font-medium">
                {COMPLAINT_TYPE_LABEL[selected.type] ?? selected.type}
              </p>
              <p className="mt-1 text-muted-foreground">{selected.description}</p>
            </div>

            <div className="mt-4">
              <Label>Action</Label>
              <div className="grid grid-cols-2 gap-2">
                {ACTIONS.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setAction(a.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                      action === a.value
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="res">Resolution note</Label>
              <Textarea
                id="res"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Explain the outcome (logged in the audit trail)."
              />
            </div>

            <Button
              full
              className="mt-5"
              disabled={busy || resolution.trim().length < 10}
              onClick={resolve}
            >
              {busy ? "Saving…" : "Confirm resolution"}
            </Button>
          </>
        )}
      </Sheet>
    </div>
  );
}
