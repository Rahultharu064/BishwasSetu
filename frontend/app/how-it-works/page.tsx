import Link from "next/link";
import {
  Search,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Star,
  Camera,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How it works — BishwasSetu",
  description:
    "Book verified home service providers in Nepal with escrow-protected payments and a 7-day workmanship guarantee.",
};

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Trust, built into every booking
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Here&apos;s how BishwasSetu keeps both customers and providers safe.
        </p>
      </div>

      {/* Steps */}
      <ol className="mt-12 space-y-6">
        <FlowStep
          n={1}
          icon={<Search className="h-5 w-5" />}
          title="Find a verified pro"
          body="Every provider passes tiered KYC before taking jobs. Compare transparent trust scores, tier badges, reviews and real neighborhood activity — ranked on merit, never on who paid more."
        />
        <FlowStep
          n={2}
          icon={<Lock className="h-5 w-5" />}
          title="Pay into escrow"
          body="Your payment is held safely by BishwasSetu — not sent to the provider yet. One all-inclusive price, no surprise customer fees."
        />
        <FlowStep
          n={3}
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="Confirm the job is done"
          body="Track the provider from accepted to en route to arrived. When you're satisfied, tap “Job Complete” to release the payment — and leave a review that powers their trust score."
        />
      </ol>

      {/* Protections */}
      <section className="mt-14 grid gap-4 sm:grid-cols-2">
        <Protection
          icon={<ShieldCheck className="h-5 w-5" />}
          title="7-Day Workmanship Guarantee"
          body="Every on-platform booking is covered. Off-platform cash deals get no warranty."
        />
        <Protection
          icon={<Camera className="h-5 w-5" />}
          title="AI-verified proof of work"
          body="Providers capture job photos on-site — checked for quality, not sourced from the internet."
        />
        <Protection
          icon={<Star className="h-5 w-5" />}
          title="Recency-weighted reviews"
          body="Trust scores lean on recent jobs, so ratings reflect current quality — not a lucky start."
        />
        <Protection
          icon={<MapPin className="h-5 w-5" />}
          title="GPS-verified arrivals"
          body="On-time rate is confirmed by geofence, feeding an honest timeliness signal."
        />
      </section>

      <div className="mt-12 rounded-2xl bg-primary-soft p-8 text-center">
        <h2 className="text-xl font-bold">Book with confidence today</h2>
        <Link href="/services" className="mt-4 inline-block">
          <Button size="lg">Browse services</Button>
        </Link>
      </div>
    </div>
  );
}

function FlowStep({
  n,
  icon,
  title,
  body,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col items-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {icon}
        </span>
        <span className="mt-2 text-xs font-bold text-muted-foreground">
          STEP {n}
        </span>
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </li>
  );
}

function Protection({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
        {icon}
      </span>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
