"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getScrollOffsetForHashId, parseHashId } from "@/lib/navigation";

/**
 * Native scrolling, on every engine.
 *
 * This used to run Lenis on Chromium and fall back to native scroll on
 * WebKit. That is exactly why the site felt inconsistent: Chrome got a ~1.2s
 * eased lerp driven off rAF, Safari got real OS momentum. The eased version
 * reads as lag, because the page keeps moving after the wheel has stopped.
 *
 * Wheel, trackpad and touch are now handled entirely by the browser and the
 * OS. The only thing left here is the one job the browser cannot do by
 * itself: offsetting in-page anchor jumps so the target clears the fixed
 * header. Those use the browser's own `behavior: "smooth"`, so they are
 * identical across engines and respect prefers-reduced-motion.
 */
export function ScrollManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const normalizeHashUrl = (id: string) => {
      const clean = `${window.location.pathname}#${id}`;
      if (window.location.hash !== `#${id}`) {
        history.replaceState(null, "", clean);
      }
    };

    const scrollToId = (id: string | null): boolean => {
      if (!id) return false;
      const el = document.getElementById(id);
      if (!el) return false;

      normalizeHashUrl(id);
      const top =
        el.getBoundingClientRect().top +
        window.scrollY -
        getScrollOffsetForHashId(id);

      window.scrollTo({
        top: Math.max(0, top),
        left: 0,
        behavior: reduce ? "auto" : "smooth",
      });
      return true;
    };

    const onHashChange = () => {
      scrollToId(parseHashId(window.location.hash));
    };

    const onHashLinkClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (url.pathname !== window.location.pathname) return;

      const id = parseHashId(url.hash);
      if (!id) return;

      event.preventDefault();
      scrollToId(id);
    };

    // Landing on a route: honour a hash if present, otherwise start at the top.
    if (!scrollToId(parseHashId(window.location.hash))) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onHashLinkClick, true);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onHashLinkClick, true);
    };
  }, [pathname]);

  return null;
}
