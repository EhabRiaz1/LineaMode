"use client";

import { useEffect, useRef, useState } from "react";
import { capabilities } from "@/content/capabilities";
import { cn } from "@/lib/utils";

/**
 * Capabilities anchor-nav.
 *
 *   — The nav sits in normal flow at the start of the disciplines (the
 *     `<Anchor>` placeholder reserves that space). As the user scrolls
 *     past the placeholder it smoothly transitions to a floating pill
 *     centred at the bottom of the viewport.
 *   — Active section highlighting via `IntersectionObserver`.
 *   — Mobile collapses to a single line showing the current discipline.
 */

const REST_GAP = 10; // distance from bottom of viewport when docked

export function CapabilitiesNav() {
  const [active, setActive] = useState<string>(capabilities[0]?.slug ?? "");
  const [bottomPx, setBottomPx] = useState<number>(REST_GAP);
  const [footerVisible, setFooterVisible] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Fade the nav out as soon as the site footer enters the viewport,
  // so it doesn't sit on top of the footer copy at the page end.
  useEffect(() => {
    const footer = document.querySelector<HTMLElement>("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { rootMargin: "0px 0px 80px 0px", threshold: 0 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // Position behaviour:
  //   — The nav follows the reserved in-flow placeholder while it enters.
  //   — As the placeholder moves toward the top of the viewport, we blend
  //     the nav down into its bottom dock instead of switching instantly.
  //   — Before the placeholder enters, the nav rides off-screen with it.
  useEffect(() => {
    const placeholder = placeholderRef.current;
    if (!placeholder) return;

    let raf = 0;
    const TOP_THRESHOLD = 96; // floating header clearance

    const update = () => {
      const navEl = navRef.current;
      const rect = placeholder.getBoundingClientRect();
      const navH = navEl?.offsetHeight ?? 48;
      const vh = window.innerHeight;
      const placeholderCenter = rect.top + rect.height / 2;
      const naturalBottom = vh - placeholderCenter - navH / 2;

      let next: number;
      if (placeholderCenter <= TOP_THRESHOLD) {
        next = REST_GAP;
      } else if (placeholderCenter > vh) {
        next = naturalBottom;
      } else {
        const DOCK_START = vh * 0.56;
        if (placeholderCenter >= DOCK_START) {
          next = Math.max(REST_GAP, naturalBottom);
        } else {
          const progress =
            (DOCK_START - placeholderCenter) / (DOCK_START - TOP_THRESHOLD);
          const eased = 1 - Math.pow(1 - Math.min(1, Math.max(0, progress)), 3);
          next = naturalBottom + (REST_GAP - naturalBottom) * eased;
        }
      }
      setBottomPx(next);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Active discipline detection.
  useEffect(() => {
    const sections = capabilities
      .map((c) => document.getElementById(c.slug))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visibleEntries[0];
        if (top?.target?.id) setActive(top.target.id);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const activeCap =
    capabilities.find((c) => c.slug === active) ?? capabilities[0];

  return (
    <>
      {/* Reserves the original "below-hero" space the nav rests in
          before docking. Height tuned so the dock transition is smooth. */}
      <div
        ref={placeholderRef}
        aria-hidden
        className="h-16 md:h-20 -mt-2 md:-mt-4"
      />

      <nav
        ref={navRef}
        aria-label="Capability sections"
        className={cn(
          "fixed left-1/2 z-40 -translate-x-1/2",
          "max-w-[calc(100vw-1.5rem)]",
          "rounded-full border border-ink/10 bg-stone/75 backdrop-blur-[8px] backdrop-saturate-150",
          "shadow-[0_8px_28px_-12px_rgba(15,15,12,0.35),inset_0_1px_0_rgba(255,255,255,0.55)]",
          "transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          footerVisible ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
        style={{ bottom: `${bottomPx}px` }}
      >
        {/* Desktop — full pill, centred. Horizontal scroll only kicks
            in on viewports too narrow to hold every discipline pill,
            so the first / last heading never gets cut off. */}
        <ol
          className={cn(
            "hidden md:flex items-center gap-1 px-2 py-1.5",
            "max-w-full overflow-x-auto",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {capabilities.map((c) => {
            const isActive = c.slug === active;
            return (
              <li key={c.slug} className="shrink-0">
                <a
                  href={`#${c.slug}`}
                  className={cn(
                    "block whitespace-nowrap rounded-full px-4 py-2 text-label transition-colors text-center",
                    isActive
                      ? "bg-ink text-stone"
                      : "text-ink/65 hover:text-ink hover:bg-ink/5",
                  )}
                  aria-current={isActive ? "true" : undefined}
                >
                  / {c.number} {c.title}
                </a>
              </li>
            );
          })}
        </ol>

        {/* Mobile — only the current discipline. */}
        <p
          key={activeCap.slug}
          className="md:hidden px-5 py-2.5 text-label text-ink whitespace-nowrap text-center"
        >
          / {activeCap.number}{" "}
          <span className="font-semibold">{activeCap.title}</span>
        </p>
      </nav>
    </>
  );
}
