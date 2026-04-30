"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import Image, { type ImageProps } from "next/image";
import { easeBrand } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

/**
 * Image with a clipping-mask reveal on scroll into view.
 * Wraps `next/image` and adds the brand's hairline frame.
 */
export function ImageReveal({
  src,
  alt,
  className,
  hairline = true,
  priority,
  fill,
  width,
  height,
  sizes,
  delay = 0,
}: {
  src: ImageProps["src"];
  alt: string;
  className?: string;
  hairline?: boolean;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative overflow-hidden",
        hairline && "ring-1 ring-ink/15",
        className,
      )}
      initial={{ clipPath: "inset(100% 0 0 0)" }}
      animate={inView ? { clipPath: "inset(0% 0 0 0)" } : undefined}
      transition={{ duration: 1.4, ease: easeBrand, delay }}
    >
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </motion.div>
  );
}
