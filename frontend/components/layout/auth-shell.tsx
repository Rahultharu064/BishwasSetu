import { ShieldCheck, Star, Lock } from "lucide-react";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid flex-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary px-12 py-14 text-primary-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative flex items-center gap-2 text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/15">
            <ShieldCheck className="h-5 w-5" />
          </span>
          BishwasSetu
        </div>

        <div className="relative max-w-md">
          <p className="text-sm font-medium uppercase tracking-wide text-primary-foreground/70">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-balance">{title}</h1>
          <p className="mt-4 text-primary-foreground/80">{subtitle}</p>

          <div className="mt-10 space-y-4">
            <Feature icon={ShieldCheck} text="Every provider passes identity verification before they can accept a job." />
            <Feature icon={Lock} text="Payments are held in escrow and only released when you confirm the job is done." />
            <Feature icon={Star} text="Trust scores are built from real, on-platform completed jobs — never bought." />
          </div>
        </div>

        <p className="relative text-sm text-primary-foreground/60">
          Kathmandu Valley pilot
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-sm leading-relaxed text-primary-foreground/85">{text}</p>
    </div>
  );
}
