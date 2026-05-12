"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Carbon-Ink curtain that wipes off-screen on every customer-side route
 * change.
 *
 * History note: this component used to drive the curtain through the
 * `motion` library by remounting a `motion.div` via a `key` change. Under
 * Next 16 `cacheComponents` + React 19 concurrent rendering + Turbopack,
 * the curtain would occasionally mount with `initial={{ scaleY: 1 }}` and
 * never transition to `animate={{ scaleY: 0 }}` — leaving a full-screen
 * ink overlay covering the destination page on back navigation.
 *
 * The new implementation drives the curtain with a single CSS keyframe
 * animation. CSS animations are guaranteed to run on every fresh element
 * mount, so toggling `key` to remount the `<div>` always plays the wipe.
 * There is no library state to fall out of sync with React's
 * reconciliation.
 *
 * Children are still rendered outside any `AnimatePresence` so the
 * outgoing page DOM is never held alive (Lenis + ScrollTrigger track
 * those nodes and racing them with React reconciliation throws
 * `removeChild` errors).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [animKey, setAnimKey] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    // Skip the first mount: the page already paints below the curtain
    // (we don't want a full ink wipe on initial load — the IntroLoader
    // handles that on `/`, and other pages just appear).
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setAnimKey((k) => k + 1);
  }, [pathname]);

  return (
    <>
      {children}
      {animKey > 0 ? (
        <div
          key={animKey}
          aria-hidden
          className="lm-page-curtain pointer-events-none fixed inset-0 z-[80] origin-bottom bg-ink"
        />
      ) : null}
      <style>{`
        .lm-page-curtain {
          transform-origin: bottom center;
          will-change: transform;
          animation: lm-page-curtain-wipe 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes lm-page-curtain-wipe {
          0%   { transform: scaleY(1); }
          100% { transform: scaleY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .lm-page-curtain { animation-duration: 1ms; }
        }
      `}</style>
    </>
  );
}
