import { Zap } from "lucide-react";

export function EmergencyButton() {
  return (
    <button
      type="button"
      className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl bg-accent-urgent px-5 py-4 text-left text-accent-urgent-foreground shadow-sm transition-transform active:scale-[0.99]"
    >
      <span className="absolute inset-0 -z-10 animate-pulse bg-white/10" aria-hidden />
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15">
        <Zap className="size-6 fill-current" aria-hidden />
      </span>
      <span className="flex-1">
        <span className="block text-[15px] font-bold leading-tight">
          Find Me a Pro Now
        </span>
        <span className="block text-xs text-accent-urgent-foreground/80">
          Nearest verified provider · usually matched in under a minute
        </span>
      </span>
      <span
        className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold"
        aria-hidden
      >
        Emergency
      </span>
    </button>
  );
}
