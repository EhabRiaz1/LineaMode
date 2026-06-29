"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";
import type { HomeCategoryTile } from "@/lib/cms/products-schema";
import type { ProductCategorySlug } from "@/content/product-catalog";
import { cn } from "@/lib/utils";
import { CategoryTile } from "./CategoryTile";
import { RailScrollButton } from "./RailScrollButton";

type HomeProductsCms = {
  eyebrow?: string;
  headline?: string;
  viewAllLabel?: string;
};

type HomeProductRailProps = {
  categories: HomeCategoryTile[];
  cms?: HomeProductsCms;
  viewAllHref?: string;
};

const MOBILE_TILE_WIDTH = "w-[min(88%,320px)]";

export function HomeProductRail({
  categories,
  cms,
  viewAllHref = "/products",
}: HomeProductRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [activeSlug, setActiveSlug] = useState<ProductCategorySlug | null>(null);
  const [canScrollRail, setCanScrollRail] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const handleActivate = useCallback((slug: ProductCategorySlug) => {
    setActiveSlug(slug);
  }, []);

  const handleDeactivate = useCallback(() => {
    setActiveSlug(null);
  }, []);

  const updateScrollState = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setCanScrollRail(el.scrollWidth > el.clientWidth + 4);
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = railRef.current;
    if (!el) return;

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    return () => observer.disconnect();
  }, [categories.length, updateScrollState]);

  const scrollRail = (direction: "prev" | "next") => {
    const el = railRef.current;
    if (!el) return;
    const amount = Math.max(280, Math.round(el.clientWidth * 0.82));
    el.scrollBy({ left: direction === "next" ? amount : -amount, behavior: "smooth" });
  };

  if (categories.length === 0) return null;

  const slugs = categories.map((tile) => tile.slug);

  const gridColumns = (() => {
    if (!activeSlug) return "1fr 1fr 1fr";
    const activeIndex = slugs.indexOf(activeSlug);
    if (activeIndex === 0) return "1.1fr 0.95fr 0.95fr";
    if (activeIndex === 1) return "0.95fr 1.1fr 0.95fr";
    return "0.95fr 0.95fr 1.1fr";
  })();

  const scrollDirection: "prev" | "next" | null = canScrollNext
    ? "next"
    : canScrollPrev
      ? "prev"
      : null;

  const showRailControl = canScrollRail && scrollDirection !== null;
  const eyebrow = cms?.eyebrow ?? "Products";
  const headline = cms?.headline ?? "A selection from across our range";
  const viewAllLabel = cms?.viewAllLabel ?? "View all products";

  return (
    <section className="relative overflow-visible bg-[var(--color-terracotta)] py-16 text-stone md:py-20">
      <GridPattern className="absolute inset-0 text-stone opacity-[0.07]" density={28} disruption />

      <div className="shell relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow number="03" className="text-stone/75">
            {eyebrow}
          </Eyebrow>
          <h2 className="mt-4 font-sans text-[clamp(1.85rem,4vw,2.65rem)] font-medium leading-[1.15] tracking-[-0.015em] text-stone text-balance">
            {headline}
          </h2>
        </div>
      </div>

      <div className="relative z-10 mt-8 md:mt-10">
        <div className="hidden w-full px-[clamp(20px,3.5vw,72px)] md:block">
          <div
            className="mx-auto grid w-full max-w-[1760px] gap-4 transition-[grid-template-columns] duration-[680ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ gridTemplateColumns: gridColumns }}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") handleDeactivate();
            }}
          >
            {categories.map((tile) => {
              const isActive = activeSlug === tile.slug;
              const isSiblingActive = activeSlug !== null && !isActive;

              return (
                <div
                  key={tile.slug}
                  className={cn(
                    "min-w-0 transition-opacity duration-[680ms]",
                    isSiblingActive && "opacity-[0.9]",
                  )}
                >
                  <CategoryTile
                    tile={tile}
                    active={isActive}
                    onActivate={() => handleActivate(tile.slug)}
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative md:hidden">
          <div
            ref={railRef}
            onScroll={updateScrollState}
            className="flex items-start gap-4 overflow-x-auto px-[clamp(20px,3.5vw,72px)] pb-2 snap-x snap-mandatory scroll-smooth scroll-px-[clamp(20px,3.5vw,72px)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((tile) => {
              const isActive = activeSlug === tile.slug;
              const isSiblingActive = activeSlug !== null && !isActive;

              return (
                <CategoryTile
                  key={tile.slug}
                  tile={tile}
                  active={isActive}
                  onActivate={() => handleActivate(tile.slug)}
                  className={cn(
                    MOBILE_TILE_WIDTH,
                    "shrink-0 snap-start transition-opacity duration-[680ms]",
                    isSiblingActive && "opacity-[0.9]",
                  )}
                />
              );
            })}
          </div>

          {showRailControl && scrollDirection && (
            <div className="pointer-events-none absolute right-2 top-1/2 z-10 -translate-y-1/2">
              <RailScrollButton
                direction={scrollDirection}
                label={
                  scrollDirection === "next"
                    ? "Scroll product categories forward"
                    : "Scroll product categories back"
                }
                onClick={() => scrollRail(scrollDirection)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="shell relative z-10 mt-8 flex justify-center md:mt-10">
        <ButtonLink
          href={viewAllHref}
          variant="ghost"
          plain
          className="!text-stone ring-stone/40 hover:bg-stone/10"
        >
          {viewAllLabel}
        </ButtonLink>
      </div>
    </section>
  );
}
