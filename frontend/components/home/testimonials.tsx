import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

const TESTIMONIALS = [
  {
    quote:
      "BishwasSetu found me a certified electrician in under 10 minutes. No more asking around and hoping for the best.",
    name: "Anjali Sharma",
    role: "Homeowner, Kathmandu",
  },
  {
    quote:
      "I trusted the escrow to hold my payment until the plumber actually finished the job. That alone changed how I book services.",
    name: "Rohan Maharjan",
    role: "Homeowner, Lalitpur",
  },
  {
    quote:
      "Our family's go-to for cleaning and repairs now. The trust score means we never have to guess who's reliable.",
    name: "Sita Adhikari",
    role: "Homeowner, Bhaktapur",
  },
];

export function Testimonials() {
  return (
    <section>
      <span className="text-xs font-bold uppercase tracking-wide text-urgent">
        Loved by households
      </span>
      <h2 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
        Stories from real Nepali families.
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            className="flex flex-col rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex gap-0.5 text-warning">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-warning" />
              ))}
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Avatar name={t.name} size={36} />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t.name}
                </p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
