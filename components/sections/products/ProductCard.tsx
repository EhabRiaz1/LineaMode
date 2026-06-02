"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  title: string;
  image: string;
  hoverImage?: string;
  variant?: "rail" | "grid";
  className?: string;
};

export function ProductCard({
  title,
  image,
  hoverImage,
  variant = "rail",
  className,
}: ProductCardProps) {
  const hoverSrc = hoverImage || image;
  const [active, setActive] = useState(false);
  const lastPointer = useRef<string>("mouse");

  const sizing =
    variant === "grid"
      ? "w-full"
      : "w-[min(72vw,340px)] shrink-0 snap-start sm:w-[360px] md:w-[380px]";

  const heading = (
    <h3
      className={cn(
        "font-[family-name:var(--font-display)] font-normal leading-[1.15] tracking-tight text-ink",
        variant === "grid"
          ? "text-[clamp(1.5rem,2.6vw,1.8rem)]"
          : "text-[clamp(1.35rem,2.4vw,1.65rem)]",
      )}
    >
      {title}
    </h3>
  );

  const barBase = cn(
    "absolute inset-x-0 bg-white/25 backdrop-blur-xl transition-transform duration-[620ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
    variant === "grid" ? "px-5 py-5 md:px-7 md:py-7" : "px-5 py-5 md:px-6 md:py-6",
  );

  return (
    <article
      className={cn("group", sizing, className)}
      onPointerDown={(e) => {
        lastPointer.current = e.pointerType;
      }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setActive(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setActive(false);
      }}
      onClick={() => {
        // Touch / pen have no hover, so a tap toggles the state instead.
        if (lastPointer.current !== "mouse") setActive((v) => !v);
      }}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <div
        className={cn(
          "relative aspect-[4/5] overflow-hidden bg-ink/5 ring-1 ring-ink/[0.06]",
          "rounded-none",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            active ? "opacity-0" : "opacity-100"
          }`}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hoverSrc}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            active ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Bottom copy — docked at the bottom; slides down out of the card. */}
        <div className={`${barBase} bottom-0 ${active ? "translate-y-full" : "translate-y-0"}`}>
          {heading}
        </div>

        {/* Top copy — waits above the card; slides down into the top slot. */}
        <div className={`${barBase} top-0 ${active ? "translate-y-0" : "-translate-y-full"}`}>
          {heading}
        </div>
      </div>
    </article>
  );
}
