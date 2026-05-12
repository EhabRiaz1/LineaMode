"use client";

import { usePathname } from "next/navigation";

/**
 * Gates server-rendered marketing chrome (e.g. <SiteFooter />) so it never
 * appears inside the admin console route group. Pair this with the
 * client-side early-return in <SiteHeader /> for the matching header.
 */
export function MarketingChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
