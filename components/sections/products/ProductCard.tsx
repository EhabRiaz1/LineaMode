"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CmsImage } from "@/components/ui/CmsImage";
import { cmsImageSrc, type CmsImageValue } from "@/lib/cms/cms-image";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  title: string;
  image: CmsImageValue;
  hoverImage?: CmsImageValue;
  variant?: "rail" | "grid";
  className?: string;
  /** Short blurb revealed when the tile expands on hover. */
  description?: string;
  /** Destination for the "Explore more" button shown in the expanded tile. */
  ctaHref?: string;
  ctaLabel?: string;
};

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const DURATION = "duration-[620ms]";

/** Single full-width edge frost — one layer per card state. */
function EdgeBackdrop({
  edge,
  className,
}: {
  edge: "bottom" | "top";
  className?: string;
}) {
  const isTop = edge === "top";

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 z-[1]",
        isTop
          ? "top-0 h-[50%] bg-white/[0.12] backdrop-blur-[8px] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_14%,rgba(0,0,0,0.42)_30%,rgba(0,0,0,0.18)_46%,rgba(0,0,0,0.06)_62%,rgba(0,0,0,0.02)_76%,transparent_90%)] [mask-image:linear-gradient(to_bottom,black_0%,black_14%,rgba(0,0,0,0.42)_30%,rgba(0,0,0,0.18)_46%,rgba(0,0,0,0.06)_62%,rgba(0,0,0,0.02)_76%,transparent_90%)]"
          : "bottom-0 h-[44%] bg-white/[0.14] backdrop-blur-[10px] [-webkit-mask-image:linear-gradient(to_top,black_0%,black_22%,rgba(0,0,0,0.55)_38%,rgba(0,0,0,0.28)_52%,rgba(0,0,0,0.1)_68%,rgba(0,0,0,0.03)_80%,transparent_94%)] [mask-image:linear-gradient(to_top,black_0%,black_22%,rgba(0,0,0,0.55)_38%,rgba(0,0,0,0.28)_52%,rgba(0,0,0,0.1)_68%,rgba(0,0,0,0.03)_80%,transparent_94%)]",
        className,
      )}
    />
  );
}

export function ProductCard({
  title,
  image,
  hoverImage,
  variant = "rail",
  className,
  description,
  ctaHref = "/products",
  ctaLabel = "Explore more",
}: ProductCardProps) {
  const hoverValue =
    hoverImage && cmsImageSrc(hoverImage) ? hoverImage : image;
  const [active, setActive] = useState(false);
  const lastPointer = useRef<string>("mouse");
  const hasDetails = Boolean(description);

  const sizing =
    variant === "grid"
      ? "w-full"
      : cn(
          `shrink-0 snap-start transition-[width] ${DURATION} ${EASE}`,
          active && hasDetails
            ? "w-[min(86vw,380px)] sm:w-[520px] md:w-[560px]"
            : "w-[min(72vw,340px)] sm:w-[360px] md:w-[380px]",
        );

  const frame =
    variant === "grid" ? "aspect-[4/5]" : "h-[400px] sm:h-[450px] md:h-[475px]";

  const headingClass = cn(
    "font-sans font-light leading-[1.15] tracking-[-0.01em] text-ink",
    variant === "grid"
      ? "text-[clamp(1.5rem,2.6vw,1.8rem)]"
      : "text-[clamp(1.35rem,2.4vw,1.65rem)]",
    hasDetails && active
      ? "[text-shadow:0_0_18px_rgba(255,255,255,0.75),0_0_34px_rgba(255,255,255,0.4),0_1px_2px_rgba(255,255,255,0.7)]"
      : "[text-shadow:0_1px_14px_rgba(255,255,255,0.35)]",
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
        if (lastPointer.current !== "mouse") setActive((v) => !v);
      }}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <div className={cn("relative overflow-hidden rounded-none bg-ink/5 ring-1 ring-ink/[0.06]", frame)}>
        <CmsImage
          value={image}
          alt={title}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700",
            EASE,
            active ? "scale-[1.03] opacity-0" : "scale-100 opacity-100",
          )}
        />
        <CmsImage
          value={hoverValue}
          alt=""
          aria-hidden
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700",
            EASE,
            active ? "scale-[1.03] opacity-100" : "scale-100 opacity-0",
          )}
        />

        <EdgeBackdrop
          edge="bottom"
          className={cn(
            "transition-opacity duration-[400ms]",
            EASE,
            hasDetails && active ? "opacity-0" : "opacity-100",
          )}
        />
        {hasDetails && (
          <EdgeBackdrop
            edge="top"
            className={cn(
              "transition-opacity duration-[500ms]",
              EASE,
              active ? "opacity-100 delay-[360ms]" : "opacity-0 delay-0 duration-[200ms]",
            )}
          />
        )}

        {hasDetails ? (
          <>
            {/* Heading glides bottom-left → top-left across the full card. */}
            <div className="absolute inset-0 [container-type:size]">
              <div
                className={cn(
                  "absolute bottom-0 left-0 z-10 w-fit max-w-[88%] will-change-transform transition-transform",
                  DURATION,
                  EASE,
                  active && "-translate-y-[calc(100cqh-100%)]",
                )}
              >
                <div
                  className={cn(
                    "relative w-fit transition-[padding] delay-0",
                    DURATION,
                    active
                      ? "pb-0 pl-3.5 pr-1.5 pt-3.5 text-left delay-[280ms]"
                      : "pb-1.5 pl-3.5 pr-1.5 pt-0 text-left",
                  )}
                >
                  <div className="relative">
                    <h3 className={headingClass}>{title}</h3>
                    <p
                      className={cn(
                        "mt-3 font-display text-[1.0925rem] font-normal leading-[1.5] text-ink/85",
                        active
                          ? "[text-shadow:0_0_14px_rgba(255,255,255,0.7),0_0_28px_rgba(255,255,255,0.35),0_1px_2px_rgba(255,255,255,0.65)]"
                          : "[text-shadow:0_1px_12px_rgba(255,255,255,0.3)]",
                        `transition-[opacity,transform,max-height] ${DURATION} ${EASE}`,
                        active
                          ? "max-h-40 translate-y-0 opacity-100 delay-[420ms]"
                          : "max-h-0 translate-y-2 overflow-hidden opacity-0 delay-0",
                      )}
                    >
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Explore more — bottom-left corner. */}
            <Link
              href={ctaHref}
              tabIndex={active ? 0 : -1}
              className={cn(
                "absolute bottom-3.5 left-3.5 z-20 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[0.78rem] font-medium tracking-[0.01em] text-[var(--color-stone-veil)]",
                `transition-[opacity,transform,background-color] ${DURATION} ${EASE} hover:bg-ink/85`,
                active
                  ? "translate-y-0 opacity-100 delay-[480ms]"
                  : "pointer-events-none translate-y-3 opacity-0 delay-0",
              )}
            >
              {ctaLabel}
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
          </>
        ) : (
          <div className="absolute bottom-0 left-0 z-10">
            <div className="relative w-fit pb-1.5 pl-3.5 pr-1.5 pt-0">
              <h3 className={cn("relative", headingClass)}>{title}</h3>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
