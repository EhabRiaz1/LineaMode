"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";
import { productsCategoryHref } from "@/content/product-catalog";
import type { ProductCard as ProductCardType } from "@/lib/cms/products-schema";
import { ProductCard } from "./ProductCard";

type HomeProductRailProps = {
  products: ProductCardType[];
  viewAllHref?: string;
};

const CATEGORY_BLURBS: Record<string, string> = {
  lifestyle:
    "Elevated everyday essentials cut from natural, considered fabrics for an easy, refined wardrobe.",
  athleisure:
    "Versatile, comfort-first pieces engineered to move with you from the studio to the street.",
  sportswear:
    "High-performance kit built for training, competition and recovery with technical fabrics.",
};

const DEFAULT_BLURB =
  "Premium, made-to-order pieces developed end-to-end with our team.";

export function HomeProductRail({ products, viewAllHref = "/products" }: HomeProductRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [scrollThumb, setScrollThumb] = useState({ width: 48, offset: 0 });

  const updateScrollState = useCallback(() => {
    const el = railRef.current;
    const track = trackRef.current;
    if (!el) return;

    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);

    const trackWidth = track?.clientWidth ?? el.clientWidth;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const ratio = el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1;
    const thumbWidth = Math.min(trackWidth, Math.max(48, trackWidth * ratio));
    const maxThumbTravel = Math.max(0, trackWidth - thumbWidth);
    const thumbOffset =
      maxScroll > 0 ? (el.scrollLeft / maxScroll) * maxThumbTravel : 0;

    setScrollThumb({ width: thumbWidth, offset: thumbOffset });
  }, []);

  useEffect(() => {
    updateScrollState();

    const el = railRef.current;
    if (!el) return;

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    if (trackRef.current) observer.observe(trackRef.current);

    window.addEventListener("resize", updateScrollState);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [products.length, updateScrollState]);

  const scrollRail = (direction: "prev" | "next") => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "next" ? 400 : -400, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[var(--color-terracotta)] py-16 text-stone md:py-20">
      <GridPattern className="absolute inset-0 text-stone opacity-[0.07]" density={28} disruption />

      <div className="shell relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow number="03" className="text-stone/75">
            Products
          </Eyebrow>
          <h2 className="mt-4 font-sans text-[clamp(1.85rem,4vw,2.65rem)] font-medium leading-[1.15] tracking-[-0.015em] text-stone text-balance">
            A selection from across our range
          </h2>
        </div>
      </div>

      <div className="relative z-10 mt-8 md:mt-10">
        <div
          ref={railRef}
          onScroll={updateScrollState}
          className="flex items-start gap-5 overflow-x-auto px-[clamp(20px,4vw,56px)] pb-2 snap-x snap-mandatory scroll-smooth scroll-px-[clamp(20px,4vw,56px)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-6"
        >
          {products.map((item) => (
            <ProductCard
              key={item.id}
              title={item.title}
              image={item.image}
              hoverImage={item.hoverImage}
              description={CATEGORY_BLURBS[item.category] ?? DEFAULT_BLURB}
              ctaHref={productsCategoryHref(item.category, viewAllHref)}
            />
          ))}
        </div>

        <div className="md:hidden mt-5 px-[clamp(20px,4vw,56px)]" aria-hidden>
          <div
            ref={trackRef}
            className="relative h-[3px] overflow-hidden rounded-full bg-stone/20 ring-1 ring-inset ring-stone/15"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-stone shadow-[0_0_10px_rgba(225,225,220,0.45)] transition-[transform,width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
              style={{
                width: scrollThumb.width,
                transform: `translateX(${scrollThumb.offset}px)`,
              }}
            />
          </div>
        </div>

        {canScrollNext && (
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 items-center justify-end pr-2 md:flex">
            <button
              type="button"
              aria-label="Scroll products forward"
              onClick={() => scrollRail("next")}
              className="pointer-events-auto flex size-11 items-center justify-center rounded-full bg-stone text-ink shadow-[0_4px_20px_rgba(0,0,0,0.12)] ring-1 ring-ink/10 transition-transform hover:scale-105"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}

        {canScrollPrev && (
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 items-center justify-start pl-2 md:flex">
            <button
              type="button"
              aria-label="Scroll products back"
              onClick={() => scrollRail("prev")}
              className="pointer-events-auto flex size-11 items-center justify-center rounded-full bg-stone text-ink shadow-[0_4px_20px_rgba(0,0,0,0.12)] ring-1 ring-ink/10 transition-transform hover:scale-105"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M10 3L5 8l5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="shell relative z-10 mt-8 flex justify-center md:mt-10">
        <ButtonLink
          href={viewAllHref}
          variant="ghost"
          plain
          className="!text-stone ring-stone/40 hover:bg-stone/10"
        >
          View all products
        </ButtonLink>
      </div>
    </section>
  );
}
