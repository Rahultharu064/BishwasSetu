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
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
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
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
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
                className={`h-0.5 flex-1 rounded ${
                  i < step ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

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
                  return (
                    <button
                      key={cid}
                      type="button"
                      onClick={() => setCategoryId(cid)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                        categoryId === cid
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
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

          {/* Escrow explainer card (ux.md §5.4 step 3) */}
          <div className="flex items-start gap-3 rounded-xl bg-primary-soft p-4">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-foreground">
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
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(`${date}T${time}`).toLocaleString()}
                </p>
              </div>
              <span className="tabular ml-auto text-lg font-bold text-primary">
                {npr(priceNum)}
              </span>
            </div>
            <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {address}
            </p>
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
                  className={`rounded-xl border p-4 text-center font-semibold ${
                    method === m
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border hover:bg-secondary"
                  }`}
                >
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

      {/* Nav bar */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-background/95 p-3 backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-lg gap-3 px-1">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
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
