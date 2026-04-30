"use client";

import { motion, useInView, type Variants } from "motion/react";
import { useRef, type ReactNode } from "react";
import { fadeUp } from "@/lib/motion/variants";

export function ScrollReveal({
  children,
  className,
  variants = fadeUp,
  delay = 0,
  margin = "-10% 0px",
  once = true,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
  margin?: string;
  once?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: margin as never });
  const Component = motion[Tag as never] as typeof motion.div;

  return (
    <Component
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}
