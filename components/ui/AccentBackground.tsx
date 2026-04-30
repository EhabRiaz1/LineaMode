"use client";

import { motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";
import { easeBrand } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

// Tag is not currently used here — we render a section. Kept the prop in the
// API for future flexibility but not as a generic JSX element to avoid type
// complexity that re-renders motion factories.

/**
 * AccentBackground — a section wrapper that cross-fades the page background
 * to one of the brand's secondary accents when its content enters view.
 * Achieves the "section-level palette transitions" effect from the plan.
 */
export type Accent =
  | "stone"
  | "ink"
  | "terracotta"
  | "chalk"
  | "linen"
  | "moss"
  | "graphite";

const ACCENT_BG: Record<Accent, string> = {
  stone: "bg-stone text-ink",
  ink: "bg-ink text-stone",
  terracotta: "bg-[var(--color-terracotta)] text-stone",
  chalk: "bg-[var(--color-chalk-sand)] text-ink",
  linen: "bg-[var(--color-ash-linen)] text-ink",
  moss: "bg-[var(--color-moss-veil)] text-ink",
  graphite: "bg-[var(--color-graphite-blue)] text-stone",
};

export function AccentBackground({
  accent = "stone",
  className,
  children,
  id,
}: {
  accent?: Accent;
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  // `once: true` is intentional — we only animate the entry wash on first
  // intersection. Without this, every scroll-pixel while the section is in
  // view re-evaluates and re-renders, which compounds across long pages.
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px -20% 0px" });

  return (
    <section
      ref={ref as never}
      id={id}
      className={cn("relative", ACCENT_BG[accent], className)}
      data-accent={accent}
    >
      {/* subtle entry wash to feel like the color seeps in */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0.18 }}
        animate={{ opacity: inView ? 0 : 0.18 }}
        transition={{ duration: 1, ease: easeBrand }}
        style={{ background: "rgba(0,0,0,0.04)" }}
      />
      <div className="relative">{children}</div>
    </section>
  );
}
