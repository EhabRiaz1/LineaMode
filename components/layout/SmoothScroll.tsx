"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Lenis-driven smooth scroll across all pages.
 * Falls back to native scroll when prefers-reduced-motion is set, and is
 * disabled inside the admin console (which is an app surface, not a
 * scrolling document, so lerped scroll feels wrong against sticky panels).
 */
export function SmoothScroll() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // Ensure we always land at the top on route changes when Lenis is off.
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Reset scroll position on client navigations so we don't retain the
    // previous page's scroll offset (Chrome sometimes restores it on BFCache).
    requestAnimationFrame(() => {
      lenis.scrollTo(0, { immediate: true });
    });

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
