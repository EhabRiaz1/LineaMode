"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const WORDMARK_SRC = "/brand/lineamode-wordmark.png";
const WORDMARK_W = 1253;
const WORDMARK_H = 199;

/**
 * Raster wordmark from brand artwork (remove.bg PNG). The source PNG is
 * bi-tonal (the LINEA half is near-white, the MODE half is near-black),
 * so neither raw rendering is legible on every surface. We composite per
 * surface — the brand colours themselves are unchanged:
 *
 *   light context (stone / paper):
 *     `brightness-0`             flatten every pixel to pure black so the
 *                                 faint LINEA half also reads on stone.
 *
 *   dark context (ink footer):
 *     `brightness-0 invert`      flatten to pure black, then invert to
 *                                 pure white so the entire wordmark —
 *                                 including the dark MODE half that was
 *                                 disappearing into bg-ink — reads on ink.
 */
export function BrandLogo({
  className,
  context = "light",
  priority = false,
}: {
  className?: string;
  /** `light` = stone / paper nav; `dark` = ink footer */
  context?: "light" | "dark";
  priority?: boolean;
}) {
  return (
    <Image
      src={WORDMARK_SRC}
      alt="Lineamode"
      width={WORDMARK_W}
      height={WORDMARK_H}
      priority={priority}
      className={cn(
        "w-auto object-contain object-left",
        context === "light" && "brightness-0",
        context === "dark" && "brightness-0 invert",
        className,
      )}
    />
  );
}
