"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  getScrollOffsetForHashId,
  parseHashId,
} from "@/lib/navigation";

/** Lenis default — close to macOS momentum deceleration. */
const easeScroll = (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t));

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

    const isTouchDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    const lenis = new Lenis({
      autoRaf: true,
      allowNestedScroll: true,
      smoothWheel: true,
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      duration: 1.2,
      easing: easeScroll,
      syncTouch: isTouchDevice,
      syncTouchLerp: 0.1,
      touchInertiaExponent: 1.7,
    });

    const lenisScroll = (el: HTMLElement, offset: number) => {
      lenis.scrollTo(el, { offset: -offset });
    };

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

    requestAnimationFrame(() => {
      if (!scrollToHashTarget(parseHashId(window.location.hash), lenisScroll)) {
        lenis.scrollTo(0, { immediate: true });
      }
    });

    window.addEventListener("hashchange", onLenisHashChange);
    document.addEventListener("click", onLenisHashLinkClick, true);

    return () => {
      window.removeEventListener("hashchange", onLenisHashChange);
      document.removeEventListener("click", onLenisHashLinkClick, true);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
