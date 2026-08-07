"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Lock,
  ShieldCheck,
  Check,
  CalendarClock,
  MapPin,
  Wallet,
} from "lucide-react";
import { apiRequest, api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { useLang } from "@/context/language-context";
import { npr } from "@/lib/format";
import { commissionRate } from "@/lib/commission";
import type { Provider } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";

interface ProfileResponse {
  provider: Provider;
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

export default function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { tr } = useLang();

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
  const addressReq = useFetch(
    () => api.addresses(),
    [isAuthenticated],
    undefined
  );
  const savedAddresses = useMemo(() => {
    const d = addressReq.data;
    if (d && typeof d === "object" && "addresses" in d) {
      const a = (d as { addresses?: import("@/lib/types").SavedAddress[] })
        .addresses;
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
  const [price, setPrice] = useState<string>("");
  const [method, setMethod] = useState<"KHALTI" | "ESEWA">("KHALTI");
  const [methodTouched, setMethodTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [addressTouched, setAddressTouched] = useState(false);

  // Prefill from the customer's saved payment preference (only Khalti/eSewa
  // are selectable here — cash isn't wired into the escrow checkout flow).
  useEffect(() => {
    if (methodTouched) return;
    const pref = user?.preferredPaymentMethod;
    if (pref === "KHALTI" || pref === "ESEWA")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMethod(pref);
  }, [user?.preferredPaymentMethod, methodTouched]);

  const formatAddress = (a: import("@/lib/types").SavedAddress) =>
    [a.addressLine, a.landmark, a.city].filter(Boolean).join(", ");

  // Prefill with the default saved address until the user edits the field
  // (savedAddresses arrives asynchronously after mount — genuine effect use).
  useEffect(() => {
    if (addressTouched || address) return;
    const def =
      savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (def) setAddress(formatAddress(def));
  }, [savedAddresses, addressTouched, address]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?next=/providers/${id}/book`);
    }
  }, [authLoading, isAuthenticated, id, router]);

  const provider = data?.provider;
  const categories = useMemo(() => provider?.categories ?? [], [provider]);
  const priceNum = Number(price) || 0;
  const rate = commissionRate(priceNum);

  // Default to the first category once the provider profile loads.
  useEffect(() => {
    if (!categoryId && categories.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategoryId(categories[0].category?.id ?? "");
    }
  }, [categories, categoryId]);

  function validateStep(): boolean {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!categoryId) e.categoryId = tr("booking.step0.errChooseService");
      if (description.trim().length < 10)
        e.description = tr("booking.step0.errDescribe");
    }
    if (step === 1) {
      if (!date || !time) e.date = tr("booking.step1.errDateTime");
      else if (new Date(`${date}T${time}`) <= new Date())
        e.date = tr("booking.step1.errFutureTime");
      if (address.trim().length < 4) e.address = tr("booking.step1.errAddress");
    }
    if (step === 2) {
      if (priceNum < 100) e.price = tr("booking.step2.errPrice");
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
    setStep((s) => s - 1);
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

  const providerCommission = useMemo(
    () => Math.round(priceNum * rate),
    [priceNum, rate]
  );

  if (authLoading || loading)
    return (
      <div className="mx-auto max-w-lg px-4 py-10 text-center text-muted-foreground">
        {tr("common.loading")}
      </div>
    );

  if (!provider)
    return (
      <div className="mx-auto max-w-lg px-4 py-10 text-center">
        <p className="text-muted-foreground">{tr("booking.notAvailable")}</p>
        <Link href="/services" className="mt-3 inline-block text-primary underline">
          {tr("booking.browseServices")}
        </Link>
      </div>
    );

  const name = provider.legalName || provider.user?.name || "Provider";

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      <Link
        href={`/providers/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> {name}
      </Link>

      {/* Progress dots */}
      <div className="mb-2 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "bg-primary text-primary-foreground ring-4 ring-primary-soft"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 rounded transition-colors ${
                  i < step ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <p className="mb-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {tr("booking.stepCounter", { current: step + 1, total: STEPS.length })}
        <span className="mx-1.5 text-border">·</span>
        {STEPS[step]}
      </p>

      <div
        key={step}
        className={`motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 ${
          direction === "forward"
            ? "motion-safe:slide-in-from-right-4"
            : "motion-safe:slide-in-from-left-4"
        }`}
      >
      {/* Step 0 — Service & details */}
      {step === 0 && (
        <div className="space-y-4">
          <h1 className="text-xl font-bold">{tr("booking.step0.heading")}</h1>
          <div>
            <Label>{tr("booking.step0.serviceLabel")}</Label>
            {categories.length ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((c, i) => {
                  const cid = c.category?.id ?? String(i);
                  const isSelected = categoryId === cid;
                  return (
                    <button
                      key={cid}
                      type="button"
                      onClick={() => setCategoryId(cid)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        isSelected
                          ? "border-primary bg-primary-soft text-primary shadow-sm"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                      {c.category?.name}
                    </button>
                  );
                })}
              </div>
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
              onChange={(e) => setDescription(e.target.value)}
              placeholder={tr("booking.step0.describePlaceholder")}
            />
            <FieldError>{errors.description}</FieldError>
          </div>
        </div>
      )}

      {/* Step 1 — Schedule & address */}
      {step === 1 && (
        <div className="space-y-4">
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <CalendarClock className="h-5 w-5 text-primary" /> {tr("booking.step1.heading")}
          </h1>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">{tr("booking.step1.dateLabel")}</Label>
              <Input
                id="date"
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time">{tr("booking.step1.timeLabel")}</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <FieldError>{errors.date}</FieldError>
          <div>
            <Label htmlFor="address">{tr("booking.step1.addressLabel")}</Label>
            {savedAddresses.length > 0 && (
              <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
                {savedAddresses.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setAddress(formatAddress(a));
                      setAddressTouched(true);
                    }}
                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:bg-secondary"
                  >
                    <MapPin className="h-3.5 w-3.5" /> {a.label}
                  </button>
                ))}
              </div>
            )}
            <Input
              id="address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setAddressTouched(true);
              }}
              placeholder={tr("booking.step1.addressPlaceholder")}
            />
            <FieldError>{errors.address}</FieldError>
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
        <div className="space-y-4">
          <h1 className="text-xl font-bold">{tr("booking.step2.heading")}</h1>
          <div>
            <Label htmlFor="price">{tr("booking.step2.priceLabel")}</Label>
            <Input
              id="price"
              type="number"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={tr("booking.step2.pricePlaceholder")}
            />
            <FieldError>{errors.price}</FieldError>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {tr("booking.step2.noFeeNote")}
            </p>
          </div>

          {priceNum >= 100 && (
            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{tr("booking.step2.youPay")}</span>
                <span className="tabular font-semibold">{npr(priceNum)}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-muted-foreground">
                <span>{tr("booking.step2.providerReceives", { pct: Math.round(rate * 100) })}</span>
                <span className="tabular">{npr(priceNum - providerCommission)}</span>
              </div>
            </div>
          )}

          {/* Escrow flow explainer (ux.md §5.4 step 3 / §9.1) */}
          <div className="rounded-2xl border border-primary/15 bg-primary-soft/40 p-5">
            <div className="flex items-start">
              <EscrowNode icon={Wallet} label={tr("booking.step2.youPay")} />
              <EscrowConnector />
              <EscrowNode icon={Lock} label={tr("booking.step2.escrowHeld")} />
              <EscrowConnector />
              <EscrowNode icon={ShieldCheck} label={tr("booking.step2.escrowReleased")} />
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {tr("booking.step2.escrowExplainer")}
            </p>
          </div>
        </div>
      )}

      {/* Step 3 — Pay */}
      {step === 3 && (
        <div className="space-y-4">
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <Wallet className="h-5 w-5 text-primary" /> {tr("booking.step3.heading")}
          </h1>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Avatar src={provider.profilePhoto} name={name} size={44} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(`${date}T${time}`).toLocaleString()}
                </p>
              </div>
              <span className="tabular shrink-0 text-lg font-bold text-primary">
                {npr(priceNum)}
              </span>
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {address}
              </p>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary">
                <Lock className="h-3 w-3" /> {tr("booking.step3.escrowChip")}
              </span>
            </div>
          </div>

          <div>
            <Label>{tr("booking.step3.paymentMethodLabel")}</Label>
            <div className="grid grid-cols-2 gap-3">
              {(["KHALTI", "ESEWA"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMethod(m);
                    setMethodTouched(true);
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-center font-semibold transition-colors ${
                    method === m
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                      m === "KHALTI" ? "bg-[#5C2D91]" : "bg-[#60BB46]"
                    }`}
                  >
                    {m === "KHALTI" ? "K" : "e"}
                  </span>
                  {m === "KHALTI" ? "Khalti" : "eSewa"}
                </button>
              ))}
            </div>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" /> {tr("booking.step3.heldNote")}
          </p>
        </div>
      )}
      </div>

      {/* Nav bar */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-background/95 p-3 backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-lg gap-3 px-1">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={back}
              disabled={submitting}
            >
              {tr("common.back")}
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button full onClick={next}>
              {tr("common.continue")}
            </Button>
          ) : (
            <Button full onClick={pay} disabled={submitting}>
              {submitting ? tr("common.processing") : tr("booking.step3.pay", { amount: npr(priceNum) })}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
