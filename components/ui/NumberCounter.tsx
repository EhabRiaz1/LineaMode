"use client";

import { animate, useInView, useMotionValue, useTransform } from "motion/react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { easeBrand } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

export function NumberCounter({
  to,
  from = 0,
  duration = 2,
  className,
  suffix = "",
  prefix = "",
}: {
  to: number;
  from?: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const value = useMotionValue(from);
  const rounded = useTransform(value, (v) => `${prefix}${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(value, to, { duration, ease: easeBrand });
    return controls.stop;
  }, [inView, to, duration, value]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      <motion.span>{rounded}</motion.span>
    </span>
  );
}
