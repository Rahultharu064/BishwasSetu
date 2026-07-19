import { Lock, ShieldCheck, Undo2 } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "1,000+ Verified Providers" },
  { icon: Lock, label: "Escrow-Protected Payments" },
  { icon: Undo2, label: "7-Day Workmanship Guarantee" },
];

export function TrustStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl bg-accent px-4 py-3 text-xs font-medium text-accent-foreground sm:text-sm">
      {items.map(({ icon: Icon, label }) => (
        <span key={label} className="flex items-center gap-1.5">
          <Icon className="size-4 shrink-0" aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}
