"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ProductCategorySlug } from "@/content/product-catalog";
import { subcategorySectionId } from "@/content/product-catalog";
import type { ProductCard as ProductCardType, Subcategory } from "@/lib/cms/products-schema";
import { easeBrand } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

type SubcategoryProductSectionProps = {
  categorySlug: ProductCategorySlug;
  subcategory: Subcategory | null;
  products: ProductCardType[];
  expanded: boolean;
  onToggleExpanded: () => void;
};

const catalogCardWidth =
  "w-full sm:w-[calc((100%-var(--catalog-gap))/2)] lg:w-[calc((100%-var(--catalog-gap)*3)/4)]";

/** Products shown in the horizontal rail; expanded grid shows the rest only. */
const RAIL_PREVIEW_COUNT = 4;

export function SubcategoryProductSection({
  categorySlug,
  subcategory,
  products,
  expanded,
  onToggleExpanded,
}: SubcategoryProductSectionProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const title = subcategory?.title ?? "Uncategorized";
  const slug = subcategory?.slug ?? "uncategorized";
  const sectionId = subcategory
    ? subcategorySectionId(categorySlug, subcategory.slug)
    : `products-subcategory-${categorySlug}-uncategorized`;

  const railProducts = products.slice(0, RAIL_PREVIEW_COUNT);
  const overflowProducts = products.slice(RAIL_PREVIEW_COUNT);
  const hasOverflow = overflowProducts.length > 0;

  const updateScrollState = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
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
  }, [railProducts.length, updateScrollState]);

  const scrollRail = (direction: "prev" | "next") => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "next" ? 360 : -360, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      aria-labelledby={`${sectionId}-heading`}
      className="scroll-mt-28 border-t border-ink/10 pt-12 first:border-t-0 first:pt-0 md:pt-14"
    >
      <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
        <div>
          <p className="text-[0.625rem] uppercase tracking-[0.18em] text-ink/45">
            {String(slug).replace(/-/g, " ")}
          </p>
          <h3
            id={`${sectionId}-heading`}
            className="mt-2 font-sans text-[clamp(1.35rem,2.2vw,1.75rem)] font-light leading-[1.12] tracking-[-0.02em] text-ink"
          >
            {title}
          </h3>
        </div>
        <p className="hidden text-label text-ink/45 md:block">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      <div className="relative">
        <div
          ref={railRef}
          onScroll={updateScrollState}
          className="flex items-start gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] md:gap-5 [&::-webkit-scrollbar]:hidden"
        >
          {railProducts.map((item) => (
            <ProductCard
              key={item.id}
              title={item.title}
              image={item.image}
              hoverImage={item.hoverImage}
              variant="rail"
              className="shrink-0 snap-start"
            />
          ))}
        </div>

        {canScrollNext && (
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 items-center justify-end md:flex">
            <button
              type="button"
              aria-label={`Scroll ${title} products forward`}
              onClick={() => scrollRail("next")}
              className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-stone text-ink shadow-[0_4px_20px_rgba(0,0,0,0.1)] ring-1 ring-ink/10 transition-transform hover:scale-105"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
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
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-16 items-center justify-start md:flex">
            <button
              type="button"
              aria-label={`Scroll ${title} products back`}
              onClick={() => scrollRail("prev")}
              className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-stone text-ink shadow-[0_4px_20px_rgba(0,0,0,0.1)] ring-1 ring-ink/10 transition-transform hover:scale-105"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
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

      <AnimatePresence initial={false}>
        {expanded && hasOverflow && (
          <motion.div
            id={`${sectionId}-grid`}
            key={`${sectionId}-expanded`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: easeBrand }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -8 }}
              animate={{ y: 0 }}
              exit={{ y: -8 }}
              transition={{ duration: 0.45, ease: easeBrand }}
              className={cn(
                "mt-8 flex flex-wrap justify-center gap-[var(--catalog-gap)] pb-2 [--catalog-gap:2rem] md:[--catalog-gap:2.5rem]",
              )}
            >
              {overflowProducts.map((item) => (
                <ProductCard
                  key={`${item.id}-grid`}
                  title={item.title}
                  image={item.image}
                  hoverImage={item.hoverImage}
                  variant="grid"
                  className={catalogCardWidth}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasOverflow && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onToggleExpanded}
            aria-expanded={expanded}
            aria-controls={`${sectionId}-grid`}
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-stone px-4 py-2 text-[0.78rem] font-medium tracking-[0.02em] text-ink transition-colors hover:border-ink/25 hover:bg-ink/[0.03]"
          >
            {expanded ? `Hide ${title}` : `View all ${title}`}
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.35, ease: easeBrand }}
              className="inline-flex"
              aria-hidden
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.span>
          </button>
        </div>
      )}
    </section>
  );
}
