"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { easeBrand, dur } from "@/lib/motion/easings";

/** Dispatched from the header home `Link` when already on `/` so the intro can replay. */
export const LINEAMODE_HOME_INTRO_REPLAY = "lineamode:replay-home-intro";

const WORDMARK_SRC = "/brand/lineamode-wordmark.png";
const WORDMARK_W = 1253;
const WORDMARK_H = 199;

const SWEEP_DURATION = dur.xl * 1.05;
const EXIT_DURATION = dur.m;
const HOLD_MS = 200;

function clearIntroPageBlock() {
  try {
    document.documentElement.removeAttribute("data-lm-intro-block");
  } catch {
    /* ignore */
  }
}

function setIntroPageBlock() {
  try {
    document.documentElement.setAttribute("data-lm-intro-block", "");
  } catch {
    /* ignore */
  }
}

function reducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** SSR + first client frame must match (no `prefers-reduced-motion` here) so hydration stays valid. */
function initialPhaseForPath(pathname: string | null): "run" | "off" {
  if (pathname == null) return "off";
  const isHome = pathname === "/" || pathname === "";
  return isHome ? "run" : "off";
}

/**
 * Full-screen intro on every visit to `/` (and when home is clicked again on `/`).
 */
export function IntroLoader() {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  const [phase, setPhase] = useState<"run" | "exit" | "off">(() =>
    initialPhaseForPath(pathname),
  );
  const [playKey, setPlayKey] = useState(0);
  const sweepDone = useRef(false);
  const skipFirstPathEffect = useRef(true);

  const startIntro = () => {
    if (reducedMotion()) {
      setPhase("off");
      return;
    }
    setIntroPageBlock();
    sweepDone.current = false;
    setPlayKey((k) => k + 1);
    setPhase("run");
  };

  useLayoutEffect(() => {
    if (pathname !== "/") {
      skipFirstPathEffect.current = false;
      setPhase("off");
      return;
    }

    if (reducedMotion()) {
      skipFirstPathEffect.current = false;
      setPhase("off");
      return;
    }

    if (skipFirstPathEffect.current) {
      skipFirstPathEffect.current = false;
      return;
    }

    startIntro();
  }, [pathname]);

  useEffect(() => {
    const onReplay = () => {
      if (pathRef.current !== "/") return;
      if (reducedMotion()) return;
      startIntro();
    };
    window.addEventListener(LINEAMODE_HOME_INTRO_REPLAY, onReplay);
    return () => window.removeEventListener(LINEAMODE_HOME_INTRO_REPLAY, onReplay);
  }, []);

  useLayoutEffect(() => {
    if (phase === "off") {
      clearIntroPageBlock();
    }
  }, [phase]);

  useLayoutEffect(() => {
    if (phase === "off") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  useLayoutEffect(() => {
    if (phase !== "exit") return;
    const id = window.setTimeout(() => {
      setPhase("off");
    }, EXIT_DURATION * 1000 + 80);
    return () => window.clearTimeout(id);
  }, [phase]);

  if (phase === "off") return null;

  return (
    <motion.div
      role="status"
      aria-label="Lineamode loading"
      aria-busy={phase === "run"}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-stone"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "exit" ? 0 : 1 }}
      transition={{ duration: EXIT_DURATION, ease: easeBrand }}
    >
      <div className="relative w-[min(88vw,520px)] aspect-[1253/199]">
        <Image
          src={WORDMARK_SRC}
          alt=""
          width={WORDMARK_W}
          height={WORDMARK_H}
          priority
          className="absolute inset-0 h-full w-full object-contain object-center brightness-0 opacity-[0.18]"
          aria-hidden
        />

        <motion.div
          key={playKey}
          className="absolute inset-0 overflow-hidden"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: SWEEP_DURATION, ease: easeBrand }}
          onAnimationComplete={() => {
            if (pathRef.current !== "/") return;
            if (sweepDone.current) return;
            sweepDone.current = true;
            window.setTimeout(() => {
              setPhase((p) => (p === "run" ? "exit" : p));
            }, HOLD_MS);
          }}
        >
          <Image
            src={WORDMARK_SRC}
            alt="Lineamode"
            width={WORDMARK_W}
            height={WORDMARK_H}
            priority
            className="h-full w-full object-contain object-center brightness-0"
          />
        </motion.div>

        {phase === "run" && (
          <motion.div
            key={`edge-${playKey}`}
            aria-hidden
            className="pointer-events-none absolute top-[8%] bottom-[8%] w-[3px] rounded-full bg-terracotta shadow-[0_0_18px_rgba(201,122,90,0.85)]"
            initial={{ left: "0%", x: "-50%" }}
            animate={{ left: "100%", x: "-50%" }}
            transition={{ duration: SWEEP_DURATION, ease: easeBrand }}
          />
        )}
      </div>
    </motion.div>
  );
}

export default IntroLoader;
