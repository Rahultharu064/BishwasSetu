import { Lock, Search, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search & compare",
    description:
      "Browse verified providers near you with transparent trust scores, badges, and real reviews.",
  },
  {
    icon: Lock,
    title: "Book & pay securely",
    description:
      "Your payment is held in escrow and released only when you confirm the job is done.",
  },
  {
    icon: ShieldCheck,
    title: "Job done, guaranteed",
    description:
      "Every on-platform booking comes with a 7-day workmanship guarantee — no exceptions.",
  },
];

export function HowItWorks() {
  return (
    <ol className="grid gap-4 sm:grid-cols-3 sm:gap-6">
      {steps.map(({ icon: Icon, title, description }, index) => (
        <li
          key={title}
          className="relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="text-sm font-semibold text-muted-foreground">
              Step {index + 1}
            </span>
          </div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </li>
      ))}
    </ol>
  );
}
