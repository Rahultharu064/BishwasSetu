import { FileCheck, Award, Users, Activity, BadgeCheck } from "lucide-react";

const STAGES = [
  {
    icon: FileCheck,
    title: "Identify & screen",
    body: "Government ID and business or citizenship documents, cross-checked for authenticity.",
  },
  {
    icon: Award,
    title: "Skill assessment",
    body: "Portfolio review and category-specific testing, so titles match real capability.",
  },
  {
    icon: Users,
    title: "Reference audit",
    body: "Past clients or employers contacted directly to confirm reliability and conduct.",
  },
  {
    icon: Activity,
    title: "Continuous monitoring",
    body: "Live review scores and complaint flags keep every profile honest, always.",
  },
];

const RING_BADGES = [
  { label: "ID Verified", pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" },
  { label: "Skill Tested", pos: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2" },
  { label: "Ref Checked", pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" },
  { label: "Live Monitored", pos: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" },
];

export function TrustProcess() {
  return (
    <section className="relative -mx-4 overflow-hidden bg-[#0b1834] px-4 py-14 text-white sm:-mx-[calc((100vw-100%)/2)] sm:px-[calc((100vw-100%)/2)] md:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-urgent/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-urgent">
            Quality control
          </span>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
            Trust isn&apos;t a tagline. It&apos;s a 4-stage process.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">
            Fewer than 30% of applicants make it through. There are other apps
            where anyone can list themselves as a &quot;pro&quot; — a claim is never
            the same as trust earned through verification.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {STAGES.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-urgent text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <Icon className="h-4 w-4 text-white/50" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-white">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">
                    {s.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust score ring graphic */}
        <div className="mx-auto flex w-full max-w-xs items-center justify-center py-8 lg:py-0">
          <div className="relative h-64 w-64">
            {/* concentric rings */}
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-6 rounded-full border border-white/10" />
            <div className="absolute inset-12 rounded-full border border-dashed border-white/20" />

            {/* center score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-white/5">
              <span className="tabular text-5xl font-bold leading-none text-white">
                98
              </span>
              <span className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-urgent">
                <BadgeCheck className="h-3 w-3" /> Trust score
              </span>
            </div>

            {/* floating badges */}
            {RING_BADGES.map((b) => (
              <span
                key={b.label}
                className={`absolute ${b.pos} whitespace-nowrap rounded-full bg-urgent px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg shadow-black/30`}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
