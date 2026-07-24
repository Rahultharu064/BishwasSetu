import type { Metadata, Viewport } from "next";
import { Mukta } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { LanguageProvider } from "@/context/language-context";
import { ToastProvider } from "@/context/toast-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BottomNav } from "@/components/bottom-nav";
import { AssistantWidget } from "@/components/assistant/assistant-widget";

// Single font family — reduces payload on 3G (ux.md §2.2)
const mukta = Mukta({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "devanagari"],
  variable: "--font-mukta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BishwasSetu — Verified Home Services in Nepal",
  description:
    "Book verified plumbers, electricians, cleaners and more across Nepal. Escrow-protected payments, transparent trust scores, 7-day workmanship guarantee.",
  keywords: [
    "home services Nepal",
    "plumber Kathmandu",
    "electrician",
    "verified providers",
    "BishwasSetu",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0E7C5B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${mukta.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <ToastProvider>
          <LanguageProvider>
            <AuthProvider>
              <div className="flex min-h-dvh flex-col">
                <SiteHeader />
                <main className="flex-1 pb-20 md:pb-0">{children}</main>
                <SiteFooter />
              </div>
              <BottomNav />
              <AssistantWidget />
            </AuthProvider>
          </LanguageProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
