"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarClock,
  Check,
  ChevronLeft,
  Clock,
  Loader2,
  Lock,
  MapPin,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { apiRequest, api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { useLang } from "@/context/language-context";
import { npr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StringKey } from "@/lib/i18n";
import type { Provider, SavedAddress } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { KycTierBadge } from "@/components/kyc-tier-badge";
import { TrustScoreRing } from "@/components/trust-score-ring";
import { categoryIcon } from "@/components/category-icon";

interface ProfileResponse {
  provider: Provider;
}

// Mirrors CreateBookingSchema on the backend — validating the same bounds
// here means the customer is told at the field, not by a 400 after four steps.
const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 1000;
const PRICE_MIN = 100;
const PRICE_MAX = 500_000;
/** PRD §3.1 — Tier 1 Basic providers may only take jobs under NPR 1,000. */
const TIER_1_MAX = 1000;
/** Earliest bookable slot from now; nobody can be at your door in 10 minutes. */
const LEAD_TIME_MS = 60 * 60 * 1000;

const SLOT_GROUPS: { key: string; labelKey: StringKey; times: string[] }[] = [
  {
    key: "morning",
    labelKey: "booking.step1.morning",
    times: ["07:00", "08:00", "09:00", "10:00", "11:00"],
  },
  {
    key: "afternoon",
    labelKey: "booking.step1.afternoon",
    times: ["12:00", "13:00", "14:00", "15:00", "16:00"],
  },
  {
    key: "evening",
    labelKey: "booking.step1.evening",
    times: ["17:00", "18:00", "19:00", "20:00"],
  },
];

/**
 * Local calendar date as `YYYY-MM-DD`.
 *
 * Deliberately not `toISOString().split("T")[0]` — that is UTC, and Nepal runs
 * at +05:45, so between midnight and 05:45 local it returns *yesterday* and the
 * date field would happily accept a day already gone.
 */
function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function slotLabel(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function formatAddress(a: SavedAddress): string {
  return [a.addressLine, a.landmark, a.city].filter(Boolean).join(", ");
}

// Escrow flow explainer (ux.local.md §9.1) — the trust moment where the
// customer sees where their money goes before they commit to paying.
function EscrowNode({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-primary ring-1 ring-primary/25">
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-[11px] font-medium leading-tight text-foreground">
        {label}
      </span>
    </div>
  );
}

function EscrowConnector() {
  return (
    <div className="flex h-10 flex-1 items-center px-1" aria-hidden>
      <div className="h-0.5 w-full rounded bg-primary/30" />
    </div>
  );
}

/** Numbered progress rail. Completed steps are tappable — a customer who wants
 *  to change the date shouldn't have to back out of the flow to do it. */
function Stepper({
  steps,
  current,
  onJump,
  navLabel,
  doneWord,
}: {
  steps: string[];
  current: number;
  onJump: (index: number) => void;
  navLabel: string;
  doneWord: string;
}) {
  return (
    <nav aria-label={navLabel}>
      <ol className="flex items-start">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          const isLast = i === steps.length - 1;
          return (
            <li
              key={label}
              className={cn("flex flex-col gap-1.5", isLast ? "flex-none" : "flex-1")}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => done && onJump(i)}
                  disabled={!done}
                  aria-current={active ? "step" : undefined}
                  aria-label={`${label}${done ? ` — ${doneWord}` : ""}`}
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    done && "bg-primary text-primary-foreground hover:bg-primary/85",
                    active && "bg-primary text-primary-foreground ring-4 ring-primary-soft",
                    !done && !active && "bg-secondary text-muted-foreground"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </button>
                {!isLast && (
                  <span
                    aria-hidden
                    className={cn(
                      "h-0.5 flex-1 rounded transition-colors",
                      done ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-[11px] font-semibold",
                  active || done ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** One line of the pre-payment recap, with a shortcut back to the step that
 *  produced it — reviewing is only useful if correcting is one tap away. */
function SummaryRow({
  icon: Icon,
  label,
  value,
  onEdit,
  editLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onEdit: () => void;
  editLabel: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border py-3 last:border-b-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium break-words">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-primary-soft"
      >
        <Pencil className="h-3 w-3" />
        {editLabel}
        <span className="sr-only"> — {label}</span>
      </button>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-4 h-20 w-full rounded-2xl" />
      <Skeleton className="mt-5 h-8 w-full" />
      <Skeleton className="mt-6 h-7 w-2/3" />
      <Skeleton className="mt-4 h-11 w-full" />
      <Skeleton className="mt-3 h-24 w-full" />
    </div>
  );
}

export default function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t, tr } = useLang();

  const STEPS = [
    tr("booking.step.service"),
    tr("booking.step.schedule"),
    tr("booking.step.review"),
    tr("booking.step.pay"),
  ];

  const { data, loading } = useFetch<ProfileResponse>(
    () => apiRequest<ProfileResponse>(`/providers/${id}`),
    [id]
  );

  // Saved addresses to prefill / quick-pick the service address.
  const addressReq = useFetch(() => api.addresses(), [isAuthenticated], undefined);
  const savedAddresses = useMemo(() => {
    const d = addressReq.data;
    if (d && typeof d === "object" && "addresses" in d) {
      const a = (d as { addresses?: SavedAddress[] }).addresses;
      if (Array.isArray(a)) return a;
    }
    return [];
  }, [addressReq.data]);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [customAddress, setCustomAddress] = useState(false);
  const [price, setPrice] = useState<string>("");
  const [method, setMethod] = useState<"KHALTI" | "ESEWA">("KHALTI");
  const [methodTouched, setMethodTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [addressTouched, setAddressTouched] = useState(false);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Prefill from the customer's saved payment preference (only Khalti/eSewa
  // are selectable here — cash isn't wired into the escrow checkout flow).
  useEffect(() => {
    if (methodTouched) return;
    const pref = user?.preferredPaymentMethod;
    if (pref === "KHALTI" || pref === "ESEWA")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMethod(pref);
  }, [user?.preferredPaymentMethod, methodTouched]);

  // Prefill with the default saved address until the user edits the field
  // (savedAddresses arrives asynchronously after mount — genuine effect use).
  useEffect(() => {
    if (addressTouched || address) return;
    const def = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (def) setAddress(formatAddress(def));
  }, [savedAddresses, addressTouched, address]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?next=/providers/${id}/book`);
    }
  }, [authLoading, isAuthenticated, id, router]);

  // Move focus to the new step's heading so a screen reader announces where it
  // landed, and scroll back to the top on the way (long steps on small phones).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const provider = data?.provider;
  const providerName = provider
    ? provider.legalName || provider.user?.name || "Provider"
    : "";
  const categories = useMemo(() => provider?.categories ?? [], [provider]);
  const priceNum = Number(price) || 0;
  const isTier1 = provider?.kycTier === "TIER_1_BASIC";
  const overTierLimit = isTier1 && priceNum >= TIER_1_MAX;

  // Default to the first category once the provider profile loads.
  useEffect(() => {
    if (!categoryId && categories.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategoryId(categories[0].category?.id ?? "");
    }
  }, [categories, categoryId]);

  /** Clear a field's error the moment the customer acts on it — errors that
   *  linger after they've been fixed read as "still broken". */
  const clearError = useCallback((...keys: string[]) => {
    setErrors((prev) => {
      if (!keys.some((k) => prev[k])) return prev;
      const next = { ...prev };
      for (const k of keys) delete next[k];
      return next;
    });
  }, []);

  const todayISO = toISODate(new Date());
  const dateOptions = useMemo(() => {
    const out: { value: string; label: string; sub: string }[] = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const value = toISODate(d);
      const label =
        i === 0
          ? tr("booking.step1.today")
          : i === 1
            ? tr("booking.step1.tomorrow")
            : d.toLocaleDateString("en-GB", { weekday: "short" });
      out.push({
        value,
        label,
        sub: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      });
    }
    return out;
  }, [tr]);

  /** A slot is bookable if it clears the lead time. Recomputed per render so a
   *  form left open past a slot's time doesn't keep offering it. */
  const slotIsBookable = useCallback(
    (day: string, slot: string) =>
      day
        ? new Date(`${day}T${slot}`).getTime() > Date.now() + LEAD_TIME_MS
        : false,
    []
  );

  const hasBookableSlots = useMemo(
    () =>
      date
        ? SLOT_GROUPS.some((g) => g.times.some((s) => slotIsBookable(date, s)))
        : true,
    [date, slotIsBookable]
  );

  /** Moving the date can strand the chosen time — 7 AM is fine for tomorrow but
   *  gone for today. Drop it rather than keep a selection the grid no longer
   *  shows, which would fail validation with nothing visibly wrong. */
  const chooseDate = useCallback(
    (value: string) => {
      setDate(value);
      if (time && !slotIsBookable(value, time)) setTime("");
      clearError("date");
    },
    [time, slotIsBookable, clearError]
  );

  const scheduledLabel = useMemo(() => {
    if (!date || !time) return "";
    return new Date(`${date}T${time}`).toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [date, time]);

  const selectedCategoryName = useMemo(() => {
    const match = categories.find((c) => c.category?.id === categoryId);
    return match?.category
      ? t(match.category.name, match.category.nameNp)
      : tr("booking.step0.generalService");
  }, [categories, categoryId, t, tr]);

  function validateStep(): boolean {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!categoryId) e.categoryId = tr("booking.step0.errChooseService");
      const trimmed = description.trim();
      if (trimmed.length < DESCRIPTION_MIN)
        e.description = tr("booking.step0.errDescribe");
      else if (trimmed.length > DESCRIPTION_MAX)
        e.description = tr("booking.step0.errDescribeMax");
    }
    if (step === 1) {
      if (!date || !time) e.date = tr("booking.step1.errDateTime");
      else if (!slotIsBookable(date, time))
        e.date = tr("booking.step1.errFutureTime");
      if (address.trim().length < 4) e.address = tr("booking.step1.errAddress");
    }
    if (step === 2) {
      if (priceNum < PRICE_MIN) e.price = tr("booking.step2.errPrice");
      else if (priceNum > PRICE_MAX) e.price = tr("booking.step2.errPriceMax");
      // Rendered by the always-visible tier banner below, not as a field error —
      // the same sentence twice under one input reads as two problems.
      else if (overTierLimit)
        e.tier = tr("booking.step2.tierLimit", { name: providerName });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep()) {
      setDirection("forward");
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  }

  function back() {
    setDirection("backward");
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  function jumpTo(target: number) {
    setDirection(target > step ? "forward" : "backward");
    setErrors({});
    setStep(target);
  }

  async function pay() {
    if (!provider) return;
    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      const booking = await api.createBooking({
        providerId: provider.id,
        categoryId,
        description: description.trim(),
        scheduledAt,
        priceNpr: priceNum,
        paymentMethod: method,
        address: address.trim(),
        neighborhood: address.split(",")[0]?.trim() || undefined,
      });
      toast(tr("booking.createdSuccess"), "success");
      router.push(`/bookings?created=${(booking as { id?: string })?.id ?? ""}`);
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : tr("booking.createdFailed"),
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loading) return <BookingSkeleton />;

  if (!provider)
    return (
      <div className="mx-auto max-w-lg px-4 py-10 text-center">
        <p className="text-muted-foreground">{tr("booking.notAvailable")}</p>
        <Link href="/services" className="mt-3 inline-block text-primary underline">
          {tr("booking.browseServices")}
        </Link>
      </div>
    );

  const quickAmounts = isTier1 ? [300, 500, 750, 900] : [500, 1000, 2500, 5000];
  const errorList = Object.values(errors);
  const walletName = method === "KHALTI" ? "Khalti" : "eSewa";

  // pb-44 clears both fixed bars stacked on mobile: the action bar sits at
  // bottom-16, above the 64px app nav.
  return (
    <div className="mx-auto max-w-lg px-4 pb-44 pt-6">
      <Link
        href={`/providers/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> {providerName}
      </Link>

      {/* Who you're booking, and why they can be trusted — kept in view for the
          whole flow (ux.local.md P1: trust visible at every decision point). */}
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <Avatar src={provider.profilePhoto} name={providerName} size={48} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {tr("booking.bookingWith")}
          </p>
          <p className="truncate font-bold leading-tight">{providerName}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <KycTierBadge tier={provider.kycTier} />
            {provider.completedBookings > 0 && (
              <Badge variant="outline" size="sm">
                {tr("booking.jobsDone", { count: provider.completedBookings })}
              </Badge>
            )}
          </div>
        </div>
        <TrustScoreRing score={provider.trustScore} size={46} stroke={4} />
      </div>

      <Stepper
        steps={STEPS}
        current={step}
        onJump={jumpTo}
        navLabel={tr("booking.progressLabel")}
        doneWord={tr("booking.stepDone")}
      />

      <p className="mb-5 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {tr("booking.stepCounter", { current: step + 1, total: STEPS.length })}
      </p>

      {errorList.length > 0 && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl border border-urgent/30 bg-urgent-soft p-3 text-sm text-urgent"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{tr("booking.errorSummary")}</span>
        </div>
      )}

      <div
        key={step}
        className={cn(
          "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300",
          direction === "forward"
            ? "motion-safe:slide-in-from-right-4"
            : "motion-safe:slide-in-from-left-4"
        )}
      >
        {/* Step 0 — Service & details */}
        {step === 0 && (
          <div className="space-y-5">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-xl font-bold outline-none"
            >
              {tr("booking.step0.heading")}
            </h1>

            <div>
              <Label id="service-label">{tr("booking.step0.serviceLabel")}</Label>
              {categories.length ? (
                <>
                  <div
                    role="radiogroup"
                    aria-labelledby="service-label"
                    className="grid grid-cols-2 gap-2"
                  >
                    {categories.map((c, i) => {
                      const cid = c.category?.id ?? String(i);
                      const isSelected = categoryId === cid;
                      const name = c.category
                        ? t(c.category.name, c.category.nameNp)
                        : "";
                      const Icon = categoryIcon(c.category?.slug ?? name);
                      return (
                        <button
                          key={cid}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => {
                            setCategoryId(cid);
                            clearError("categoryId");
                          }}
                          className={cn(
                            "flex min-h-14 items-center gap-2.5 rounded-xl border p-3 text-left text-sm font-medium transition-colors",
                            isSelected
                              ? "border-primary bg-primary-soft text-primary"
                              : "border-border bg-card hover:border-primary/40"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="min-w-0 flex-1">{name}</span>
                          {isSelected && <Check className="h-4 w-4 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {tr("booking.step0.serviceHint")}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {tr("booking.step0.generalService")}
                </p>
              )}
              <FieldError>{errors.categoryId}</FieldError>
            </div>

            <div>
              <Label htmlFor="desc">{tr("booking.step0.describeLabel")}</Label>
              <Textarea
                id="desc"
                value={description}
                maxLength={DESCRIPTION_MAX}
                aria-invalid={!!errors.description}
                aria-describedby="desc-hint"
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearError("description");
                }}
                placeholder={tr("booking.step0.describePlaceholder")}
                className="min-h-32"
              />
              <div className="mt-1.5 flex items-start justify-between gap-3">
                <p id="desc-hint" className="text-xs text-muted-foreground">
                  {tr("booking.step0.describeHint")}
                </p>
                <span
                  className={cn(
                    "tabular shrink-0 text-xs",
                    description.length > DESCRIPTION_MAX - 50
                      ? "text-urgent"
                      : "text-muted-foreground"
                  )}
                >
                  {tr("booking.step0.charCount", { count: description.length })}
                </span>
              </div>
              <FieldError>{errors.description}</FieldError>
            </div>
          </div>
        )}

        {/* Step 1 — Schedule & address */}
        {step === 1 && (
          <div className="space-y-5">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="flex items-center gap-2 text-xl font-bold outline-none"
            >
              <CalendarClock className="h-5 w-5 text-primary" />{" "}
              {tr("booking.step1.heading")}
            </h1>

            <div>
              <Label id="date-label">{tr("booking.step1.dateLabel")}</Label>
              <div
                role="radiogroup"
                aria-labelledby="date-label"
                className="grid grid-cols-4 gap-2"
              >
                {dateOptions.map((d) => {
                  const isSelected = date === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => chooseDate(d.value)}
                      className={cn(
                        "flex min-h-16 flex-col items-center justify-center rounded-xl border px-1 py-2 transition-colors",
                        isSelected
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border bg-card hover:border-primary/40"
                      )}
                    >
                      <span className="text-sm font-semibold">{d.label}</span>
                      <span className="tabular mt-0.5 text-[11px] text-muted-foreground">
                        {d.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-2">
                <Label htmlFor="date" className="text-xs text-muted-foreground">
                  {tr("booking.step1.otherDate")}
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  min={todayISO}
                  aria-invalid={!!errors.date}
                  onChange={(e) => chooseDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label id="time-label">{tr("booking.step1.timeLabel")}</Label>
              {!date ? (
                <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  {tr("booking.step1.pickDateFirst")}
                </p>
              ) : !hasBookableSlots ? (
                <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  {tr("booking.step1.noSlotsToday")}
                </p>
              ) : (
                <div
                  role="radiogroup"
                  aria-labelledby="time-label"
                  className="space-y-3"
                >
                  {SLOT_GROUPS.map((group) => {
                    const bookable = group.times.filter((s) =>
                      slotIsBookable(date, s)
                    );
                    if (!bookable.length) return null;
                    return (
                      <div key={group.key}>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {tr(group.labelKey)}
                        </p>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {bookable.map((slot) => {
                            const isSelected = time === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => {
                                  setTime(slot);
                                  clearError("date");
                                }}
                                className={cn(
                                  "tabular flex h-11 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                                  isSelected
                                    ? "border-primary bg-primary-soft text-primary"
                                    : "border-border bg-card hover:border-primary/40"
                                )}
                              >
                                {slotLabel(slot)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {tr("booking.step1.arrivalNote")}
              </p>
              <FieldError>{errors.date}</FieldError>
            </div>

            <div>
              <Label id="address-label">{tr("booking.step1.addressLabel")}</Label>

              {savedAddresses.length > 0 && (
                <div
                  role="radiogroup"
                  aria-labelledby="address-label"
                  className="mb-2 space-y-2"
                >
                  {savedAddresses.map((a) => {
                    const formatted = formatAddress(a);
                    const isSelected = !customAddress && address === formatted;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => {
                          setAddress(formatted);
                          setAddressTouched(true);
                          setCustomAddress(false);
                          clearError("address");
                        }}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                          isSelected
                            ? "border-primary bg-primary-soft"
                            : "border-border bg-card hover:border-primary/40"
                        )}
                      >
                        <MapPin
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 text-sm font-semibold">
                            {a.label}
                            {a.isDefault && (
                              <Badge variant="soft" size="sm">
                                {tr("booking.step1.default")}
                              </Badge>
                            )}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatted}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        )}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    role="radio"
                    aria-checked={customAddress}
                    onClick={() => {
                      setCustomAddress(true);
                      setAddress("");
                      setAddressTouched(true);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border border-dashed p-3 text-left text-sm font-medium transition-colors",
                      customAddress
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <RotateCcw className="h-4 w-4 shrink-0" />
                    {tr("booking.step1.otherAddress")}
                  </button>
                </div>
              )}

              {(customAddress || savedAddresses.length === 0) && (
                <Input
                  id="address"
                  value={address}
                  aria-label={tr("booking.step1.addressLabel")}
                  aria-invalid={!!errors.address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setAddressTouched(true);
                    clearError("address");
                  }}
                  placeholder={tr("booking.step1.addressPlaceholder")}
                />
              )}

              <FieldError>{errors.address}</FieldError>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {tr("booking.step1.addressHint")}
              </p>
              <Link
                href="/account/addresses"
                className="mt-1.5 inline-block text-xs font-medium text-primary hover:underline"
              >
                {tr("booking.step1.manageAddresses")}
              </Link>
            </div>
          </div>
        )}

        {/* Step 2 — Price & escrow explainer */}
        {step === 2 && (
          <div className="space-y-5">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-xl font-bold outline-none"
            >
              {tr("booking.step2.heading")}
            </h1>

            <div>
              <Label htmlFor="price">{tr("booking.step2.priceLabel")}</Label>
              <div className="relative">
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground"
                >
                  NPR
                </span>
                <Input
                  id="price"
                  type="number"
                  inputMode="numeric"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  value={price}
                  aria-invalid={!!errors.price}
                  aria-describedby="price-hint"
                  onChange={(e) => {
                    setPrice(e.target.value);
                    clearError("price");
                  }}
                  placeholder={tr("booking.step2.pricePlaceholder")}
                  // Spinner arrows on a currency field are a nudge to click
                  // rupees up and down one at a time — never the right gesture.
                  className="tabular pl-14 text-lg font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
              <FieldError>{errors.price}</FieldError>

              <p className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {tr("booking.step2.commonAmounts")}
              </p>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setPrice(String(amount));
                      clearError("price");
                    }}
                    className={cn(
                      "tabular rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                      priceNum === amount
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    {npr(amount)}
                  </button>
                ))}
              </div>

              <p id="price-hint" className="mt-2 text-xs text-muted-foreground">
                {tr("booking.step2.priceHint")}
              </p>
            </div>

            {/* Tier ceiling is enforced server-side (PRD §3.1) — surface it while
                the amount is still editable instead of failing at checkout. */}
            {overTierLimit && (
              <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-soft p-3 text-sm text-warning">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{tr("booking.step2.tierLimit", { name: providerName })}</span>
              </div>
            )}

            {/* One all-inclusive number. The commission split is the provider's
                business (ux.local.md §9.2) — showing it here invites the
                customer to negotiate the job off-platform. */}
            {priceNum >= PRICE_MIN && priceNum <= PRICE_MAX && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {tr("booking.step2.youPay")}
                  </span>
                  <span className="tabular text-xl font-bold">{npr(priceNum)}</span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {tr("booking.step2.allInclusive")}
                </p>
              </div>
            )}

            {/* Escrow flow explainer (ux.local.md §5.4 step 3 / §9.1) */}
            <div className="rounded-2xl border border-primary/15 bg-primary-soft/40 p-5">
              <div className="flex items-start">
                <EscrowNode icon={Wallet} label={tr("booking.step2.youPay")} />
                <EscrowConnector />
                <EscrowNode icon={Lock} label={tr("booking.step2.escrowHeld")} />
                <EscrowConnector />
                <EscrowNode
                  icon={ShieldCheck}
                  label={tr("booking.step2.escrowReleased")}
                />
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                {tr("booking.step2.escrowExplainer")}
              </p>
              <ul className="mt-4 space-y-2 border-t border-primary/15 pt-4">
                {[tr("booking.step2.refund"), tr("booking.step2.guarantee")].map(
                  (line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2 text-xs text-foreground"
                    >
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {line}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Step 3 — Review & pay */}
        {step === 3 && (
          <div className="space-y-5">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="flex items-center gap-2 text-xl font-bold outline-none"
            >
              <Wallet className="h-5 w-5 text-primary" /> {tr("booking.step3.heading")}
            </h1>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  {tr("booking.step3.summaryTitle")}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary">
                  <Lock className="h-3 w-3" /> {tr("booking.step3.escrowChip")}
                </span>
              </div>

              <div className="mt-2">
                <SummaryRow
                  icon={Check}
                  label={tr("booking.step3.rowService")}
                  value={selectedCategoryName}
                  onEdit={() => jumpTo(0)}
                  editLabel={tr("booking.edit")}
                />
                <SummaryRow
                  icon={CalendarClock}
                  label={tr("booking.step3.rowWhen")}
                  value={scheduledLabel}
                  onEdit={() => jumpTo(1)}
                  editLabel={tr("booking.edit")}
                />
                <SummaryRow
                  icon={MapPin}
                  label={tr("booking.step3.rowWhere")}
                  value={address}
                  onEdit={() => jumpTo(1)}
                  editLabel={tr("booking.edit")}
                />
                <SummaryRow
                  icon={Pencil}
                  label={tr("booking.step3.rowJob")}
                  value={description.trim()}
                  onEdit={() => jumpTo(0)}
                  editLabel={tr("booking.edit")}
                />
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-semibold">
                  {tr("booking.step3.total")}
                </span>
                <span className="tabular text-xl font-bold text-primary">
                  {npr(priceNum)}
                </span>
              </div>
            </div>

            <div>
              <Label id="method-label">
                {tr("booking.step3.paymentMethodLabel")}
              </Label>
              <div
                role="radiogroup"
                aria-labelledby="method-label"
                className="grid grid-cols-2 gap-3"
              >
                {(["KHALTI", "ESEWA"] as const).map((m) => {
                  const isSelected = method === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        setMethod(m);
                        setMethodTouched(true);
                      }}
                      className={cn(
                        "flex min-h-16 items-center justify-center gap-2 rounded-xl border p-4 text-center font-semibold transition-colors",
                        isSelected
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border bg-card hover:border-primary/40"
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white",
                          m === "KHALTI" ? "bg-[#5C2D91]" : "bg-[#60BB46]"
                        )}
                      >
                        {m === "KHALTI" ? "K" : "e"}
                      </span>
                      {m === "KHALTI" ? "Khalti" : "eSewa"}
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {tr("booking.step3.redirectNote", { wallet: walletName })}
              </p>
            </div>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />{" "}
              {tr("booking.step3.heldNote")}
            </p>
          </div>
        )}
      </div>

      {/* Nav bar — carries the running total from the moment there is one, so
          the amount is never a surprise revealed only at the Pay button. */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-background/95 p-3 backdrop-blur md:bottom-0">
        <div className="mx-auto max-w-lg px-1">
          {/* Only on the price step — the review step already totals it in the
              card, and the Pay button restates the amount. */}
          {step === 2 && priceNum >= PRICE_MIN && (
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {tr("booking.step3.total")}
              </span>
              <span className="tabular font-bold">{npr(priceNum)}</span>
            </div>
          )}
          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={back} disabled={submitting}>
                {tr("common.back")}
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button full onClick={next}>
                {tr("common.continue")}
              </Button>
            ) : (
              <Button full onClick={pay} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {tr("common.processing")}
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    {tr("booking.step3.pay", { amount: npr(priceNum) })}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
