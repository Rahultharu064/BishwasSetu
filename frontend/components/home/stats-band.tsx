const STATS = [
  { value: "12,400+", label: "Verified providers", accent: "bg-urgent" },
  { value: "84,000+", label: "Jobs completed", accent: "bg-primary" },
  { value: "4.9 / 5", label: "Average rating", accent: "bg-warning" },
  { value: "3+", label: "Cities, growing", accent: "bg-skilled" },
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
