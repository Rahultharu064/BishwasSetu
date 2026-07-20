import { Briefcase, MapPinned, ShieldCheck, Star } from "lucide-react";

const stats = [
  { icon: ShieldCheck, value: "1,000+", label: "Verified providers" },
  { icon: Briefcase, value: "10,000+", label: "Jobs completed" },
  { icon: Star, value: "4.8", label: "Average rating" },
  { icon: MapPinned, value: "15+", label: "Cities covered" },
];

export function StatsSection() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map(({ icon: Icon, value, label }) => (
        <div
          key={label}
          className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5"
        >
          <Icon className="size-5 text-primary" aria-hidden />
          <p className="text-2xl font-semibold text-foreground sm:text-[28px]">
            {value}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}
