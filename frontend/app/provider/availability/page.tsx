"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Power } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useToast } from "@/context/toast-context";
import type { AvailabilitySlot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { cn } from "@/lib/utils";

const DAYS = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

interface DayRow {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

function initialDays(slots: AvailabilitySlot[] | undefined): Record<number, DayRow> {
  const rows: Record<number, DayRow> = {};
  for (const d of DAYS) {
    const slot = slots?.find((s) => s.dayOfWeek === d.value);
    rows[d.value] = slot
      ? { enabled: true, startTime: slot.startTime, endTime: slot.endTime }
      : { enabled: false, startTime: "09:00", endTime: "17:00" };
  }
  return rows;
}

export default function ProviderAvailabilityPage() {
  const { toast } = useToast();
  const req = useFetch(() => api.providerProfile(), []);

  const [isAvailable, setIsAvailable] = useState(true);
  const [days, setDays] = useState<Record<number, DayRow>>(() => initialDays(undefined));
  const [savingToggle, setSavingToggle] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!req.data) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAvailable(req.data.isAvailable);
    setDays(initialDays(req.data.availability));
    setDirty(false);
  }, [req.data]);

  function updateDay(value: number, patch: Partial<DayRow>) {
    setDays((prev) => ({ ...prev, [value]: { ...prev[value], ...patch } }));
    setDirty(true);
  }

  async function toggleAvailable() {
    const next = !isAvailable;
    setIsAvailable(next);
    setSavingToggle(true);
    try {
      await api.updateProviderProfile({ isAvailable: next });
      toast(
        next ? "You're visible for new bookings again." : "You're paused — customers won't see you in search.",
        "success"
      );
    } catch (err) {
      setIsAvailable(!next); // revert on failure
      toast(err instanceof ApiError ? err.message : "Couldn't update.", "error");
    } finally {
      setSavingToggle(false);
    }
  }

  const invalidDays = Object.entries(days).filter(
    ([, row]) => row.enabled && row.startTime >= row.endTime
  );

  async function saveSchedule() {
    if (invalidDays.length > 0) {
      toast("End time must be after start time for every enabled day.", "error");
      return;
    }
    const availability: AvailabilitySlot[] = DAYS.filter((d) => days[d.value].enabled).map(
      (d) => ({
        dayOfWeek: d.value,
        startTime: days[d.value].startTime,
        endTime: days[d.value].endTime,
      })
    );
    if (availability.length === 0) {
      toast("Turn on at least one day, or use the pause toggle above instead.", "error");
      return;
    }
    setSavingSchedule(true);
    try {
      await api.updateProviderProfile({ availability });
      toast("Weekly schedule saved.", "success");
      setDirty(false);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Couldn't save your schedule.", "error");
    } finally {
      setSavingSchedule(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Control when customers can find and book you.
      </p>

      {req.loading ? (
        <div className="mt-5 space-y-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      ) : req.error ? (
        <div className="mt-5">
          <ErrorState message={req.error} onRetry={req.reload} />
        </div>
      ) : (
        <div className="mt-5 max-w-xl space-y-5">
          <SectionCard
            title="Accepting new bookings"
            subtitle="Pause instantly without touching your weekly schedule — e.g. while on leave."
          >
            <button
              onClick={toggleAvailable}
              disabled={savingToggle}
              className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-secondary disabled:opacity-60"
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  isAvailable ? "bg-primary-soft text-primary" : "bg-secondary text-muted-foreground"
                )}
              >
                <Power className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">
                  {isAvailable ? "Visible to customers" : "Paused"}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {isAvailable
                    ? "You appear in search and matching."
                    : "Hidden from search until you turn this back on."}
                </span>
              </span>
              <span
                role="switch"
                aria-checked={isAvailable}
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                  isAvailable ? "bg-primary" : "bg-border"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform",
                    isAvailable ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </span>
            </button>
          </SectionCard>

          <SectionCard
            title="Weekly schedule"
            subtitle="Turn on the days you work and set your hours for each."
            action={
              <Button size="sm" disabled={!dirty || savingSchedule} onClick={saveSchedule}>
                {savingSchedule ? "Saving…" : "Save schedule"}
              </Button>
            }
          >
            <div className="space-y-2">
              {DAYS.map((d) => {
                const row = days[d.value];
                return (
                  <div
                    key={d.value}
                    className={cn(
                      "flex flex-wrap items-center gap-3 rounded-lg border p-3 transition-colors",
                      row.enabled ? "border-primary/30 bg-primary-soft/40" : "border-border"
                    )}
                  >
                    <label className="flex w-28 shrink-0 items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input"
                        checked={row.enabled}
                        onChange={(e) => updateDay(d.value, { enabled: e.target.checked })}
                      />
                      {d.label}
                    </label>
                    {row.enabled ? (
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          type="time"
                          value={row.startTime}
                          onChange={(e) => updateDay(d.value, { startTime: e.target.value })}
                          className="h-9 rounded-lg border border-input bg-card px-2.5 text-sm"
                        />
                        <span className="text-muted-foreground">to</span>
                        <input
                          type="time"
                          value={row.endTime}
                          onChange={(e) => updateDay(d.value, { endTime: e.target.value })}
                          className="h-9 rounded-lg border border-input bg-card px-2.5 text-sm"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not working</span>
                    )}
                  </div>
                );
              })}
            </div>
            {invalidDays.length > 0 && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-urgent">
                <CalendarClock className="h-4 w-4" />
                End time must be after start time.
              </p>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
