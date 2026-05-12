"use client";

import { usePathname } from "next/navigation";
import IntroLoader from "@/components/layout/IntroLoader";

export function IntroLoaderGate() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <IntroLoader />;
}
