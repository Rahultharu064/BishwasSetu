import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="h-4 w-4" />
              </span>
              BishwasSetu
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Verified home service providers, escrow-protected payments, and real
              accountability — Nepal&apos;s trust layer for home services.
            </p>
          </div>

          <FooterCol
            title="Explore"
            links={[
              { href: "/services", label: "Browse services" },
              { href: "/register", label: "Become a provider" },
            ]}
          />
          <FooterCol
            title="Trust & safety"
            links={[
              { href: "/services", label: "How verification works" },
              { href: "/services", label: "Escrow payments" },
            ]}
          />
          <FooterCol
            title="Account"
            links={[
              { href: "/login", label: "Log in" },
              { href: "/register", label: "Create an account" },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} BishwasSetu. All rights reserved.</p>
          <p>Kathmandu Valley pilot &middot; NPR-only &middot; Khalti &amp; eSewa</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
