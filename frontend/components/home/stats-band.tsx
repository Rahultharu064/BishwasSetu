// These describe how the platform is built, not usage counts — BishwasSetu
// is a new marketplace, so real activity numbers don't exist yet to quote
// honestly. Update this once there's a real metrics endpoint to back it.
const STATS = [
  { value: "100%", label: "Escrow-protected payments", accent: "bg-urgent" },
  { value: "7-day", label: "Workmanship guarantee", accent: "bg-primary" },
  { value: "3-tier", label: "Provider verification", accent: "bg-warning" },
  { value: "EN / ने", label: "Bilingual, end to end", accent: "bg-skilled" },
];

export function StatsBand() {
  return (
    <section className="rounded-2xl border border-border bg-card px-6 py-6">
      <div className="grid gap-6 divide-y divide-border sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        {STATS.map((s) => (
          <div key={s.label} className="flex gap-3 pt-4 first:pt-0 sm:pt-0 sm:pl-6 sm:first:pl-0">
            <span className={`mt-1 h-8 w-1 shrink-0 rounded-full ${s.accent}`} />
            <div>
              <p className="tabular text-2xl font-bold tracking-tight text-foreground">
                {s.value}
              </p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
