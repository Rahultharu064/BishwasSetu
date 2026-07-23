import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About — BishwasSetu",
  description:
    "BishwasSetu is building the trust infrastructure for Nepal's home services economy.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">About BishwasSetu</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">BishwasSetu</span>{" "}
        (बिश्वास सेतु — &ldquo;bridge of trust&rdquo;) connects verified local
        service providers with customers across Nepal. We&apos;re building the
        trust layer that home services have always needed: real verification,
        protected payments, and reputations that travel with the tradesperson.
      </p>

      <div className="mt-8 space-y-6">
        <Block
          title="The problem"
          body="Finding a reliable plumber or electrician in Nepal often means asking around and hoping for the best. Providers, meanwhile, have no way to carry a good reputation from one job to the next."
        />
        <Block
          title="Our approach"
          body="Skill-first onboarding lowers the barrier for honest tradespeople, while escrow payments and AI-verified proof-of-work protect customers. Trust scores are transparent and can never be bought."
        />
        <Block
          title="Where we're headed"
          body="From Kathmandu and Pokhara outward — group micro-insurance, B2B contracts for building managers and hotels, and a companion mobile app for providers and customers alike."
        />
      </div>

      <div className="mt-10 rounded-2xl bg-primary-soft p-6 text-center">
        <p className="font-semibold">Join the trust economy</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/services">
            <Button>Find a pro</Button>
          </Link>
          <Link href="/for-providers">
            <Button variant="outline">Become a pro</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1.5 leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
