"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/** Dispatched from the header home `Link` when already on `/` so the intro can replay. */
export const LINEAMODE_HOME_INTRO_REPLAY = "lineamode:replay-home-intro";

const WORDMARK_SRC = "/brand/lineamode-wordmark.png";
const WORDMARK_W = 1253;
const WORDMARK_H = 199;

const SWEEP_MS = 1680;
const HOLD_MS = 200;
const EXIT_MS = 700;
const TOTAL_MS = SWEEP_MS + HOLD_MS + EXIT_MS; // 2580
const SAFETY_MS = TOTAL_MS + 600; // 3180 — backstop for animationend never firing

function isHomePath(pathname: string | null): boolean {
  return pathname === "/" || pathname === "" || pathname == null;
}

/**
 * Full-screen intro the first time `/` is reached (direct load or client-side
 * navigation from any other route), plus replay-on-demand from the header logo.
 *
 * Design notes:
 *   1. The entire visible life of the loader (sweep + hold + fade) is driven by
 *      a single CSS animation `lm-intro-loader-life` on the outer wrapper. CSS
 *      animations are guaranteed to play on element mount, so the loader will
 *      always fade away visually even if React's render/effect scheduling is
 *      disrupted by Fast Refresh, Strict Mode double-mounts, or Next.js router
 *      cache reuse on back navigation.
 *   2. The keyframes end at `opacity: 0; pointer-events: none`, so even if the
 *      DOM node lingers, it cannot intercept clicks or visually block the page.
 *   3. Actual unmount is driven by the wrapper's `onAnimationEnd` (preferred)
 *      with a JS safety timer as a backstop in case `animationend` is missed
 *      (e.g. tab visibility changes, animation pause-on-blur, etc.).
 */
export function IntroLoader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState<boolean>(() => isHomePath(pathname));
  const [playKey, setPlayKey] = useState(0);
  const lastPathRef = useRef(pathname);

  const startIntro = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setMounted(false);
          return;
        }
      } catch {
        // Ignore matchMedia failures and play the intro.
      }
    }
    setPlayKey((k) => k + 1);
    setMounted(true);
  }, []);

  // Manual replay from the home logo click while already on `/`.
  useEffect(() => {
    const onReplay = () => {
      if (pathname !== "/") return;
      startIntro();
    };
    window.addEventListener(LINEAMODE_HOME_INTRO_REPLAY, onReplay);
    return () => window.removeEventListener(LINEAMODE_HOME_INTRO_REPLAY, onReplay);
  }, [pathname, startIntro]);

  // Path-change handler:
  //  - leaving `/` → unmount the loader immediately
  //  - arriving at `/` from any other route → replay the intro with a fresh key
  useEffect(() => {
    const prev = lastPathRef.current;
    lastPathRef.current = pathname;
    if (pathname !== "/") {
      setMounted(false);
      return;
    }
    if (prev !== pathname && prev !== "/" && prev !== "" && prev != null) {
      startIntro();
    }
  }, [pathname, startIntro]);

  // Safety net: force-unmount after the full animation duration + buffer in
  // case `animationend` never fires (tab hidden, animation paused, etc.). The
  // CSS animation will have already faded the loader to `opacity: 0` and set
  // `pointer-events: none`, so even before this fires the loader cannot block
  // interaction — this just ensures DOM cleanup.
  useEffect(() => {
    if (!mounted) return;
    const id = window.setTimeout(() => setMounted(false), SAFETY_MS);
    return () => window.clearTimeout(id);
  }, [mounted, playKey]);

  // Lock body scroll while the loader is mounted.
  useLayoutEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      key={`life-${playKey}`}
      role="status"
      aria-label="Lineamode loading"
      aria-busy="true"
      className="lm-intro-loader fixed inset-0 z-[120] flex items-center justify-center bg-stone"
      onAnimationEnd={(event) => {
        // Only react to the wrapper's life animation, not the child sweep/edge.
        if (event.animationName === "lm-intro-loader-life") {
          setMounted(false);
        }
      }}
    >
      <div className="relative w-[min(88vw,520px)] aspect-[1253/199]">
        {/* Ghost wordmark (low-contrast trace beneath the sweep). */}
        <Image
          src={WORDMARK_SRC}
          alt=""
          width={WORDMARK_W}
          height={WORDMARK_H}
          priority
          className="absolute inset-0 h-full w-full object-contain object-center brightness-0 opacity-[0.18]"
          aria-hidden
        />

        {/* The sweep: a fresh-mounted div whose CSS animation runs on mount. */}
        <div className="lm-intro-sweep absolute inset-0 overflow-hidden">
          <Image
            src={WORDMARK_SRC}
            alt="Lineamode"
            width={WORDMARK_W}
            height={WORDMARK_H}
            priority
            className="h-full w-full object-contain object-center brightness-0"
          />
        </div>

        <div
          aria-hidden
          className="lm-intro-edge pointer-events-none absolute top-[8%] bottom-[8%] w-[3px] rounded-full bg-terracotta shadow-[0_0_18px_rgba(201,122,90,0.85)]"
        />
      </div>

      <style>{`
        .lm-intro-loader {
          animation: lm-intro-loader-life ${TOTAL_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes lm-intro-loader-life {
          0%, ${((SWEEP_MS + HOLD_MS) / TOTAL_MS) * 100}% {
            opacity: 1;
            pointer-events: auto;
          }
          99.9% {
            opacity: 0;
            pointer-events: none;
          }
          100% {
            opacity: 0;
            pointer-events: none;
          }
        }

        .lm-intro-sweep {
          clip-path: inset(0 100% 0 0);
          animation: lm-intro-sweep ${SWEEP_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes lm-intro-sweep {
          0%   { clip-path: inset(0 100% 0 0); }
          100% { clip-path: inset(0 0% 0 0); }
        }

        .lm-intro-edge {
          left: 0%;
          transform: translateX(-50%);
          animation: lm-intro-edge ${SWEEP_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes lm-intro-edge {
          0%   { left: 0%; }
          100% { left: 100%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lm-intro-loader,
          .lm-intro-sweep,
          .lm-intro-edge { animation-duration: 1ms; }
        }
      `}</style>
    </div>
  );
}

export default IntroLoader;
