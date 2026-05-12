"use client";

import { usePathname } from "next/navigation";
import { PageTransition } from "./PageTransition";

/**
 * Mounts the customer-facing curtain transition everywhere except the
 * admin console. The admin owns its own chrome (Sidebar + Topbar +
 * loading spinner) and the ink-coloured drape feels out of place there.
 */
export function PageTransitionGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return <>{children}</>;
  return <PageTransition>{children}</PageTransition>;
}
