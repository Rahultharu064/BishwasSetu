"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How are providers verified?",
    a: "Every provider passes a 4-stage check: identity documents, a skill assessment for their category, reference checks with past clients or employers, and ongoing monitoring of reviews and complaints once they're live on the platform.",
  },
  {
    q: "What is a Trust Score?",
    a: "A 0–100 score built from verification tier, review quality, on-time rate, and complaint history. The formula is public and can never be bought — it's the same ranking signal for every provider.",
  },
  {
    q: "Is my payment safe?",
    a: "Yes. Payments are held in escrow by BishwasSetu and only released to the provider once you confirm the job is complete — there's no cash-in-advance risk.",
  },
  {
    q: "What happens if something goes wrong?",
    a: "Every on-platform booking includes a 7-day workmanship guarantee. If the work doesn't hold up, you can file a claim and our team will step in to resolve it.",
  },
  {
    q: "How do I become a verified provider?",
    a: "Sign up with a phone number and a few photos of your work to start. You'll move through skill and identity verification as you build a portable, verified reputation.",
  },
  {
    q: "Is BishwasSetu available outside Kathmandu Valley?",
    a: "We're currently live in Kathmandu, Lalitpur and Bhaktapur, with new cities added as verified providers join — check the search page for coverage in your area.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section>
      <span className="text-xs font-bold uppercase tracking-wide text-urgent">
        Questions
      </span>
      <h2 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
        Everything you wanted to ask.
      </h2>

      <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-semibold text-foreground">{item.q}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              {isOpen && (
                <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
