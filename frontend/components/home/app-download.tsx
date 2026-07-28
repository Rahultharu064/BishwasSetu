import { Apple, PlayCircle, ShieldCheck, Lock } from "lucide-react";

export function AppDownload() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col items-center gap-8 p-6 md:flex-row md:justify-between md:p-10">
        <div className="max-w-md text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wide text-urgent">
            Mobile app
          </span>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
            Carry BishwasSetu in your pocket.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Book pros, track jobs and pay securely from your phone — built
            lightweight for every Nepali Android and iPhone.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
            <button className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90">
              <Apple className="h-5 w-5" /> App Store
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90">
              <PlayCircle className="h-5 w-5" /> Google Play
            </button>
          </div>
        </div>

        {/* Phone mockup */}
        <div className="relative shrink-0">
          <div className="h-56 w-32 rounded-[1.75rem] border-4 border-foreground bg-background p-1.5 shadow-xl sm:h-64 sm:w-36">
            <div className="flex h-full w-full flex-col overflow-hidden rounded-[1.25rem] bg-gradient-to-b from-primary-soft to-card">
              <div className="flex items-center gap-1 bg-primary px-2.5 py-2">
                <ShieldCheck className="h-3 w-3 text-primary-foreground" />
                <span className="text-[8px] font-bold uppercase tracking-wide text-primary-foreground">
                  BishwasSetu
                </span>
              </div>
              <div className="flex-1 space-y-1.5 p-2.5">
                <div className="h-2 w-3/4 rounded-full bg-card/80" />
                <div className="h-2 w-1/2 rounded-full bg-card/60" />
                <div className="mt-2 flex items-center gap-1 rounded-lg bg-card px-2 py-1.5 shadow-sm">
                  <Lock className="h-2.5 w-2.5 text-primary" />
                  <span className="text-[7px] font-semibold text-foreground">
                    Escrow secured
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
