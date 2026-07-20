import { Mail, Phone } from "lucide-react";

const linkColumns = [
  {
    heading: "Customers",
    links: ["How it works", "Trust & safety", "Service categories", "Help center"],
  },
  {
    heading: "Providers",
    links: ["Become a provider", "Verification tiers", "Earnings & payouts", "Boost & credits"],
  },
  {
    heading: "Company",
    links: ["About us", "Careers", "Blog", "Contact"],
  },
  {
    heading: "Legal",
    links: ["Terms of service", "Privacy policy", "Refund policy"],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                घ
              </span>
              <span className="text-[15px]">GharSewa Nepal</span>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Trust infrastructure for Nepal&apos;s home services economy —
              verified providers, escrow-protected payments, guaranteed work.
            </p>
            <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <a href="mailto:hello@gharsewa.com.np" className="flex items-center gap-2 hover:text-foreground">
                <Mail className="size-4" aria-hidden />
                hello@gharsewa.com.np
              </a>
              <a href="tel:+97715555555" className="flex items-center gap-2 hover:text-foreground">
                <Phone className="size-4" aria-hidden />
                +977 1-555-5555
              </a>
            </div>
          </div>

          {linkColumns.map(({ heading, links }) => (
            <nav key={heading} aria-label={heading}>
              <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
              <ul className="mt-3 flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col-reverse items-center gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} GharSewa Nepal. All rights reserved.</p>
          <p>Made in Nepal · Khalti &amp; eSewa accepted</p>
        </div>
      </div>
    </footer>
  );
}
