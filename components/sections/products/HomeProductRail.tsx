"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";
import type { ProductCard as ProductCardType } from "@/lib/cms/products-schema";
import { ProductCard } from "./ProductCard";

type HomeProductRailProps = {
  products: ProductCardType[];
  viewAllHref?: string;
};

export function HomeProductRail({ products, viewAllHref = "/products" }: HomeProductRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
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
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.85rem,4vw,2.65rem)] font-light leading-[1.15] tracking-tight text-stone text-balance">
            A selection from across our range.
          </h2>
        </div>
      </div>

      <div className="relative z-10 mt-8 md:mt-10">
        <div
          ref={railRef}
          onScroll={updateScrollState}
          className="flex gap-5 overflow-x-auto px-[clamp(20px,4vw,56px)] pb-2 snap-x snap-mandatory scroll-smooth scroll-px-[clamp(20px,4vw,56px)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-6"
        >
          {products.map((item) => (
            <ProductCard
              key={item.id}
              title={item.title}
              image={item.image}
              hoverImage={item.hoverImage}
            />
          ))}
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
          className="!text-stone ring-stone/40 hover:bg-stone/10"
        >
          View all products
        </ButtonLink>
      </div>
    </section>
  );
}
