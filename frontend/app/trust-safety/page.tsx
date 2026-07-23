import {
  ShieldCheck,
  Lock,
  Camera,
  Users,
  Scale,
  Eye,
} from "lucide-react";

export const metadata = {
  title: "Trust & Safety — BishwasSetu",
  description:
    "How BishwasSetu verifies providers, protects payments and keeps Nepal's home services marketplace honest.",
};

const PILLARS = [
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Tiered KYC verification",
    body: "Providers prove skill first — work photos and CTEVT certificates — then identity for accountability. Every high-value provider is identity-verified and insurance-eligible.",
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Escrow-protected payments",
    body: "Your money is held by BishwasSetu and released only when you confirm the job is done. No cash-in-advance risk, ever.",
  },
  {
    icon: <Camera className="h-6 w-6" />,
    title: "AI-verified proof of work",
    body: "Job completion photos are captured on-site and quality-checked by AI — replacing manipulable social vouches with objective evidence.",
  },
  {
    icon: <Scale className="h-6 w-6" />,
    title: "Transparent trust scores",
    body: "Reviews, on-time rate, complaints, verification and proof-of-work — the exact formula is public. Ranking can never be bought.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Human-reviewed onboarding",
    body: "For our first providers, every approval is confirmed by a human admin. AI flags problems; people make the final call.",
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: "No dark patterns",
    body: "No auto-renewals, no pre-booking DMs, no fake urgency timers, no competitor ads. What you see is what you get.",
  },
];

export default function TrustSafetyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
          <ShieldCheck className="h-3.5 w-3.5" /> Trust infrastructure
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Safety isn&apos;t a feature — it&apos;s the foundation
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Six ways BishwasSetu keeps both customers and providers protected.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
              {p.icon}
            </span>
            <h2 className="mt-4 text-lg font-semibold">{p.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
