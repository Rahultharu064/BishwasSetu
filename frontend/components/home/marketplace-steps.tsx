import { Search, UserCheck, Lock, Star } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    label: "Search & compare",
    body: "Filter by service, trust score, price and availability — see verified pros near you in seconds.",
  },
  {
    icon: UserCheck,
    label: "Pick a professional",
    body: "Review real profiles, verification badges and past work, then message or book instantly.",
  },
  {
    icon: Lock,
    label: "Book with escrow",
    body: "Your payment sits safely in escrow — released only once you confirm the job is done.",
  },
  {
    icon: Star,
    label: "Rate & build trust",
    body: "Confirm completion and leave a review — it keeps the marketplace honest for everyone.",
  },
];

export function MarketplaceSteps() {
  return (
    <section>
      <span className="text-xs font-bold uppercase tracking-wide text-urgent">
        Our marketplace
      </span>
      <h2 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
        From search to satisfied — in under 10 minutes.
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-background">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{s.label}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
