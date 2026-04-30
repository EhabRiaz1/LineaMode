"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Pure-CSS marquee. Pauses on hover (per the "luxury detail" brief).
 * Duplicates children so the loop is seamless.
 */
export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = true,
  gap = "4rem",
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  gap?: string;
}) {
  const [paused, setPaused] = useState(false);
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
    >
      <div
        className="flex w-max marquee-track"
        data-paused={paused}
        style={{
          gap,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        <div className="flex shrink-0 items-center" style={{ gap }}>
          {children}
        </div>
        <div className="flex shrink-0 items-center" aria-hidden="true" style={{ gap }}>
          {children}
        </div>
      </div>
    </div>
  );
}
