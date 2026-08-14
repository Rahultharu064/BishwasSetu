import { ShieldCheck, Wallet, BadgeCheck } from "lucide-react";

// Real testimonials don't exist yet — BishwasSetu is a new marketplace, and
// putting invented names/quotes in a customer's mouth would undercut the
// exact trust the platform is selling. These cards describe what's actually
// built instead of simulating social proof.
const REASONS = [
  {
    icon: ShieldCheck,
    title: "Verified before they're listed",
    body: "Every provider goes through a tiered check — phone, profile, and work photos at minimum, with certificates and ID verification for higher-value jobs.",
  },
  {
    icon: Wallet,
    title: "Your payment stays in escrow",
    body: "We hold the payment until you tap ‘Job Complete.’ The provider is only paid once you've confirmed the work is done.",
  },
  {
    icon: BadgeCheck,
    title: "A 7-day guarantee on every job",
    body: "On-platform bookings come with a workmanship guarantee window — if something's wrong, you can file a claim directly in the app.",
  },
];

export function Testimonials() {
  return (
    <section>
      <span className="text-xs font-bold uppercase tracking-wide text-urgent">
        Built on trust
      </span>
      <h2 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
        Why families choose BishwasSetu.
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {REASONS.map((r) => (
          <div
            key={r.title}
            className="flex flex-col rounded-2xl border border-border bg-card p-5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <r.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 font-semibold text-foreground">{r.title}</p>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
              {r.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
