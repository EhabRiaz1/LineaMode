"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const WORDMARK_SRC = "/brand/lineamode-wordmark.png";
const WORDMARK_W = 1253;
const WORDMARK_H = 199;

/**
 * Raster wordmark from brand artwork (remove.bg PNG). On light UI surfaces the
 * asset is flattened to ink via `brightness-0` so it reads on stone.
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
        className,
      )}
    />
  );
}
