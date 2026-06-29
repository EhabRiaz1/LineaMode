"use client";

import Link from "next/link";
import { useRef } from "react";
import type { HomeCategoryTile } from "@/lib/cms/products-schema";
import { CmsImage } from "@/components/ui/CmsImage";
import { cn } from "@/lib/utils";

type CategoryTileProps = {
  tile: HomeCategoryTile;
  active: boolean;
  onActivate: () => void;
  className?: string;
};

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const DURATION = "duration-500";

export function CategoryTile({
  tile,
  active,
  onActivate,
  className,
}: CategoryTileProps) {
  const lastPointer = useRef<string>("mouse");

  return (
    <article
      className={cn("group min-w-0", className)}
      onPointerDown={(e) => {
        lastPointer.current = e.pointerType;
      }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") onActivate();
      }}
      onClick={() => {
        if (lastPointer.current !== "mouse") onActivate();
      }}
      onFocus={onActivate}
    >
      <div
        className={cn(
          "relative h-[400px] overflow-hidden rounded-none bg-ink/5 ring-1 ring-ink/[0.06] sm:h-[430px] md:h-[460px]",
        )}
      >
        <CmsImage
          value={tile.image}
          alt={tile.title}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-[opacity,transform]",
            DURATION,
            EASE,
            active ? "scale-[1.02] opacity-0" : "scale-100 opacity-100",
          )}
        />

        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-center bg-[var(--color-stone-veil)] px-5 py-6 sm:px-6",
            `transition-[opacity,transform] ${DURATION} ${EASE}`,
            active
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-1 opacity-0",
          )}
        >
          <h3 className="font-sans text-[clamp(1.35rem,2.2vw,1.75rem)] font-medium leading-[1.12] tracking-[-0.02em] text-ink">
            {tile.headline}
          </h3>
          <p className="mt-3 max-w-[32ch] font-display text-[0.95rem] leading-[1.55] text-ink/72">
            {tile.description}
          </p>
          <Link
            href={tile.ctaHref}
            tabIndex={active ? 0 : -1}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-4 py-2 text-[0.78rem] font-medium tracking-[0.01em] text-[var(--color-stone-veil)] transition-colors hover:bg-ink/85",
              `transition-[opacity,transform] ${DURATION} ${EASE}`,
              active ? "translate-y-0 opacity-100 delay-100" : "translate-y-1 opacity-0",
            )}
          >
            {tile.ctaLabel}
            <svg viewBox="0 0 16 16" className="size-3" fill="none" aria-hidden>
              <path
                d="M3 8h10m-4-4 4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
