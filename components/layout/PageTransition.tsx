"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { easeBrand } from "@/lib/motion/easings";

/**
 * A Carbon-Ink curtain wipes off-screen on route change.
 *
 * Important: we deliberately do NOT wrap `children` in AnimatePresence.
 * The page DOM contains nodes tracked by GSAP ScrollTrigger and Lenis;
 * if AnimatePresence holds the outgoing tree to play an exit animation,
 * those libraries' cleanup races with React's reconciliation and we get
 * "Failed to execute 'removeChild' on 'Node'".
 *
 * Instead, the curtain is a single fixed overlay outside the children
 * tree. On pathname change we re-trigger its animation by toggling a
 * key — pure overlay work, no children unmounting.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [pathname]);

  return (
    <>
      {children}
      <motion.div
        key={animKey}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[80] origin-bottom bg-ink"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.7, ease: easeBrand }}
        style={{ transformOrigin: "bottom center" }}
      />
    </>
  );
}
