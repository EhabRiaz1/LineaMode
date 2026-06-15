"use client";

import Link from "next/link";
import { useRef } from "react";
import type { HomeCategoryTile } from "@/lib/cms/products-schema";
import { cmsImageSrc } from "@/lib/cms/cms-image";
import { CmsImage } from "@/components/ui/CmsImage";
import { cn } from "@/lib/utils";

type CategoryTileProps = {
  tile: HomeCategoryTile;
  active: boolean;
  onActivate: () => void;
  className?: string;
};

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const DURATION = "duration-[680ms]";

export function CategoryTile({
  tile,
  active,
  onActivate,
  className,
}: CategoryTileProps) {
  const lastPointer = useRef<string>("mouse");
  const hasSubcategories = tile.subcategories.length > 0;
  const expanded = active && hasSubcategories;

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
        {/* Collapsed hero */}
        <div
          className={cn(
            "absolute inset-0 transition-[opacity,transform] duration-700",
            EASE,
            expanded ? "scale-[1.04] opacity-0" : "scale-100 opacity-100",
          )}
        >
          <CmsImage
            value={tile.image}
            alt={tile.title}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700",
              EASE,
              active && !expanded ? "scale-[1.03] opacity-0" : "scale-100 opacity-100",
            )}
          />
          <CmsImage
            value={
              cmsImageSrc(tile.hoverImage) ? tile.hoverImage : tile.image
            }
            alt=""
            aria-hidden
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700",
              EASE,
              active && !expanded ? "scale-[1.03] opacity-100" : "scale-100 opacity-0",
            )}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[58%] bg-white/[0.1] backdrop-blur-[6px] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_42%,rgba(0,0,0,0.45)_68%,transparent_100%)] [mask-image:linear-gradient(to_right,black_0%,black_42%,rgba(0,0,0,0.45)_68%,transparent_100%)]"
          />

          <div className="absolute inset-y-0 left-0 z-10 flex max-w-[78%] items-center px-4 sm:px-5">
            <h3
              className={cn(
                "font-sans text-[clamp(1.45rem,2.8vw,1.85rem)] font-light leading-[1.1] tracking-[-0.02em] text-ink",
                "[text-shadow:0_0_18px_rgba(255,255,255,0.72),0_0_34px_rgba(255,255,255,0.38),0_1px_2px_rgba(255,255,255,0.68)]",
                `transition-[opacity,transform] ${DURATION} ${EASE}`,
                expanded ? "-translate-x-2 opacity-0" : "translate-x-0 opacity-100",
              )}
            >
              {tile.title}
            </h3>
          </div>
        </div>

        {/* Expanded horizontal panel */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col transition-[opacity,transform]",
            DURATION,
            EASE,
            expanded
              ? "translate-x-0 opacity-100 delay-100"
              : "pointer-events-none translate-x-3 opacity-0 delay-0",
          )}
        >
          <div className="flex h-full min-h-0 flex-col md:flex-row">
            {/* Left — subcategory photo grid */}
            <div className="grid min-h-0 flex-[1.15] grid-cols-2 grid-rows-2 gap-1.5 bg-stone p-2 sm:gap-2 sm:p-2.5">
              {tile.subcategories.map((sub, index) => (
                <Link
                  key={sub.id}
                  href={sub.href}
                  tabIndex={expanded ? 0 : -1}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "group/sub relative min-h-0 overflow-hidden bg-ink/5 ring-1 ring-ink/[0.08] transition-[transform,box-shadow,ring-color]",
                    "duration-500 hover:ring-ink/20 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)]",
                    EASE,
                    expanded ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                  )}
                  style={expanded ? { transitionDelay: `${180 + index * 70}ms` } : undefined}
                >
                  {cmsImageSrc(sub.image) ? (
                    <CmsImage
                      value={sub.image}
                      alt={sub.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/sub:scale-[1.05]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-ink/[0.06]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 z-10 p-2.5 sm:p-3">
                    <p className="text-[0.625rem] uppercase tracking-[0.16em] text-stone/70">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-0.5 font-sans text-[0.92rem] font-light leading-tight tracking-[-0.01em] text-stone">
                      {sub.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right — heading + description */}
            <div
              className={cn(
                "flex min-h-0 flex-1 flex-col justify-center border-t border-ink/[0.08] bg-[var(--color-stone-veil)] px-4 py-5 sm:px-5 md:border-t-0 md:border-l",
                `transition-[opacity,transform] ${DURATION} ${EASE}`,
                expanded ? "translate-x-0 opacity-100 delay-[320ms]" : "translate-x-3 opacity-0",
              )}
            >
              <p className="text-[0.625rem] uppercase tracking-[0.18em] text-ink/45">
                Category
              </p>
              <h3 className="mt-2 font-sans text-[clamp(1.35rem,2.2vw,1.75rem)] font-medium leading-[1.12] tracking-[-0.02em] text-ink">
                {tile.title}
              </h3>
              <p className="mt-3 max-w-[28ch] font-display text-[0.95rem] leading-[1.55] text-ink/72">
                {tile.description}
              </p>
              <Link
                href={tile.ctaHref}
                tabIndex={expanded ? 0 : -1}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-4 py-2 text-[0.78rem] font-medium tracking-[0.01em] text-[var(--color-stone-veil)] transition-colors hover:bg-ink/85",
                  `transition-[opacity,transform] ${DURATION} ${EASE}`,
                  expanded ? "translate-y-0 opacity-100 delay-[420ms]" : "translate-y-2 opacity-0",
                )}
              >
                Explore {tile.title.toLowerCase()}
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
        </div>
      </div>
    </article>
  );
}
