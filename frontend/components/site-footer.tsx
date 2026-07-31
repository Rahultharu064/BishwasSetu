"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Lock } from "lucide-react";
import { useLang } from "@/context/language-context";

export function SiteFooter() {
  const { tr } = useLang();

  return (
    <footer className="mt-16 border-t border-border bg-card pb-24 pt-12 md:pb-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90 mb-5">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden grayscale transition-all hover:grayscale-0">
                <Image
                  src="/LOGO.png"
                  alt="BishwasSetu Icon"
                  width={100}
                  height={100}
                  className="h-full w-full object-contain mix-blend-multiply drop-shadow-sm"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-3xl font-bold tracking-tight leading-none">
                  <span className="text-[#0E7C5B]">Bishwas</span><span className="text-[#F15A24]">Setu</span>
                </h2>
                <div className="flex items-center justify-center gap-2 mt-1.5">
                  <div className="h-[1.5px] w-4 bg-slate-400 dark:bg-slate-500"></div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                    Bridge of Trust
                  </span>
                  <div className="h-[1.5px] w-4 bg-slate-400 dark:bg-slate-500"></div>
                </div>
              </div>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {tr("footer.tagline")}
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
              <Lock className="h-3.5 w-3.5" />
              {tr("footer.escrowProtected")}
            </p>
          </div>

          <FooterCol
            title={tr("footer.customers")}
            links={[
              { href: "/services", label: tr("footer.browseServices") },
              { href: "/emergency", label: tr("footer.emergencyDispatch") },
              { href: "/how-it-works", label: tr("nav.howItWorks") },
              { href: "/bookings", label: tr("footer.myBookings") },
            ]}
          />
          <FooterCol
            title={tr("footer.providers")}
            links={[
              { href: "/for-providers", label: tr("nav.becomeAPro") },
              { href: "/register?role=provider", label: tr("footer.providerSignup") },
              { href: "/provider/onboarding", label: tr("footer.kycVerification") },
            ]}
          />
          <FooterCol
            title={tr("footer.company")}
            links={[
              { href: "/about", label: tr("footer.about") },
              { href: "/trust-safety", label: tr("footer.trustSafety") },
              { href: "/how-it-works", label: tr("footer.guarantee") },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {tr("footer.rights")}</p>
          <p>{tr("footer.madeInNepal")} · काठमाडौं</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
