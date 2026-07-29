"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Smartphone, Wallet, Banknote, Check } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";

type Method = "KHALTI" | "ESEWA" | "CASH";

const OPTIONS: { value: Method; label: string; description: string; icon: typeof Smartphone }[] = [
  {
    value: "KHALTI",
    label: "Khalti",
    description: "Pay into escrow with your Khalti wallet.",
    icon: Smartphone,
  },
  {
    value: "ESEWA",
    label: "eSewa",
    description: "Pay into escrow with eSewa.",
    icon: Wallet,
  },
  {
    value: "CASH",
    label: "Cash",
    description: "Pay the provider directly after the job.",
    icon: Banknote,
  },
];

export default function PaymentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading, updateUser } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated)
      router.replace("/login?next=/account/payments");
  }, [authLoading, isAuthenticated, router]);

  const req = useFetch(() => api.getPaymentPreference(), [isAuthenticated]);
  // Optimistic local override so a save reflects instantly without waiting
  // on a reload; falls back to the fetched value once it arrives.
  const [override, setOverride] = useState<Method | null>(null);
  const selected = override ?? req.data?.preferredPaymentMethod ?? null;
  const [busy, setBusy] = useState(false);

  async function save(method: Method) {
    setOverride(method);
    setBusy(true);
    try {
      await api.updatePaymentPreference(method);
      updateUser({ preferredPaymentMethod: method });
      toast("Payment preference saved.", "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Couldn't save your preference.",
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
        href="/account"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Account
      </Link>

      <h1 className="text-2xl font-bold tracking-tight">Payment methods</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose the gateway that prefills your booking checkout. You can still
        change it per booking.
      </p>

      <div className="mt-5">
        {req.loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : req.error ? (
          <ErrorState message={req.error} onRetry={req.reload} />
        ) : (
          <ul className="space-y-3">
            {OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selected === opt.value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => save(opt.value)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors disabled:opacity-60 ${
                      isSelected
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-card hover:bg-secondary"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{opt.label}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {opt.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Button
        variant="outline"
        full
        className="mt-6"
        onClick={() => router.push("/account")}
      >
        Done
      </Button>
    </div>
  );
}
