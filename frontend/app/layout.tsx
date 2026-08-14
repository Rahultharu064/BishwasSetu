import type { Metadata, Viewport } from "next";
import { Mukta } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { LanguageProvider } from "@/context/language-context";
import { ToastProvider } from "@/context/toast-context";
import { NotificationProvider } from "@/context/notification-context";
import { SiteChrome } from "@/components/site-chrome";

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
              <NotificationProvider>
                <SiteChrome>{children}</SiteChrome>
              </NotificationProvider>
            </AuthProvider>
          </LanguageProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
