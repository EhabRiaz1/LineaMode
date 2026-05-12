"use client";

import { motion, useInView } from "motion/react";
import { useRef, type ElementType, type ReactNode } from "react";
import { useBfcacheRestore } from "@/lib/hooks/useBfcacheRestore";
import { easeBrand } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

type SplitTextProps = {
  children: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  by?: "word" | "char" | "line";
  once?: boolean;
};

/**
 * Letter-by-letter (or word-by-word) reveal where each unit slides up from
 * 110% behind a clipping mask. Uses IntersectionObserver via Motion's
 * `useInView` so it triggers on scroll-in.
 */
export function SplitText({
  children,
  as = "span",
  className,
  delay = 0,
  stagger = 0.04,
  duration = 0.9,
  by = "word",
  once = true,
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, margin: "-10% 0px" });
  const wasRestored = useBfcacheRestore();
  const Tag = as as ElementType;

  const units = by === "word" ? children.split(/(\s+)/) : children.split("");

  const motionUnits: ReactNode = units.map((u, i) => {
    if (/^\s+$/.test(u)) return <span key={`s-${i}`}>{u}</span>;
    return (
      <span
        key={i}
        className="mask-reveal"
        aria-hidden={false}
        style={{ marginRight: by === "word" ? undefined : 0 }}
      >
        <motion.span
          initial={{ y: "110%" }}
          animate={wasRestored || inView ? { y: "0%" } : { y: "110%" }}
          transition={{
            duration,
            ease: easeBrand,
            delay: delay + i * stagger,
          }}
          style={{ display: "inline-block" }}
        >
          {u}
        </motion.span>
      </span>
    );
  });

  return (
    <Tag ref={ref} className={cn(className)}>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">{motionUnits}</span>
    </Tag>
  );
}
