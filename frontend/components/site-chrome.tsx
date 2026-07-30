"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { BottomNav } from "./bottom-nav";
import { AssistantWidget } from "./assistant/assistant-widget";

// The admin console (and its dedicated login page) render their own shell —
// sidebar, top bar, logout — so the public marketing header/footer/bottom-nav
// and customer-facing assistant widget would be redundant chrome stacked on
// top of it. Gated here (one place) instead of at every /admin/* page.
function isAdminRoute(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/admin-login");
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isAdminRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <SiteFooter />
      </div>
      <BottomNav />
      <AssistantWidget />
    </>
  );
}
