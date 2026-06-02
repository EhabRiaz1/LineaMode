"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import {
  getScrollOffsetForHashId,
  parseHashId,
} from "@/lib/navigation";

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

    const normalizeHashUrl = (id: string) => {
      const clean = `${window.location.pathname}#${id}`;
      if (window.location.hash !== `#${id}`) {
        history.replaceState(null, "", clean);
      }
    };

    const scrollToHashTarget = (
      id: string | null,
      scroll: (el: HTMLElement, offset: number) => void,
    ): boolean => {
      if (!id) return false;
      const el = document.getElementById(id);
      if (!el) return false;
      normalizeHashUrl(id);
      scroll(el, getScrollOffsetForHashId(id));
      return true;
    };

    const nativeScroll = (el: HTMLElement, offset: number) => {
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: Math.max(0, top),
        left: 0,
        behavior: reduce ? "auto" : "smooth",
      });
    };

    const onHashChange = () => {
      scrollToHashTarget(parseHashId(window.location.hash), nativeScroll);
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
      normalizeHashUrl(id);
      scrollToHashTarget(id, nativeScroll);
    };

    if (reduce) {
      if (!scrollToHashTarget(parseHashId(window.location.hash), nativeScroll)) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }

      window.addEventListener("hashchange", onHashChange);
      document.addEventListener("click", onHashLinkClick, true);

      return () => {
        window.removeEventListener("hashchange", onHashChange);
        document.removeEventListener("click", onHashLinkClick, true);
      };
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    const lenisScroll = (el: HTMLElement, offset: number) => {
      lenis.scrollTo(el, { offset: -offset });
    };

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onLenisHashChange = () => {
      scrollToHashTarget(parseHashId(window.location.hash), lenisScroll);
    };

    const onLenisHashLinkClick = (event: MouseEvent) => {
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
      normalizeHashUrl(id);
      scrollToHashTarget(id, lenisScroll);
    };

    // Reset scroll on client navigations, or scroll to a hash target when present.
    requestAnimationFrame(() => {
      if (!scrollToHashTarget(parseHashId(window.location.hash), lenisScroll)) {
        lenis.scrollTo(0, { immediate: true });
      }
    });

    window.addEventListener("hashchange", onLenisHashChange);
    document.addEventListener("click", onLenisHashLinkClick, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", onLenisHashChange);
      document.removeEventListener("click", onLenisHashLinkClick, true);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
