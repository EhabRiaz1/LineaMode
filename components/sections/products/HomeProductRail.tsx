"use client";

import { useCallback, useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";
import type { HomeCategoryTile } from "@/lib/cms/products-schema";
import type { ProductCategorySlug } from "@/content/product-catalog";
import { cn } from "@/lib/utils";
import { CategoryTile } from "./CategoryTile";

type HomeProductRailProps = {
  categories: HomeCategoryTile[];
  viewAllHref?: string;
};

export function HomeProductRail({ categories, viewAllHref = "/products" }: HomeProductRailProps) {
  const [activeSlug, setActiveSlug] = useState<ProductCategorySlug | null>(null);

  const handleActivate = useCallback((slug: ProductCategorySlug) => {
    setActiveSlug(slug);
  }, []);

  const handleDeactivate = useCallback(() => {
    setActiveSlug(null);
  }, []);

  if (categories.length === 0) return null;

  const slugs = categories.map((tile) => tile.slug);

  const gridColumns = (() => {
    if (!activeSlug) return "1fr 1fr 1fr";
    const activeIndex = slugs.indexOf(activeSlug);
    if (activeIndex === 0) return "2.8fr 0.5fr 0.5fr";
    if (activeIndex === 1) return "0.5fr 2.8fr 0.5fr";
    return "0.5fr 0.5fr 2.8fr";
  })();

  return (
    <section className="relative overflow-visible bg-[var(--color-terracotta)] py-16 text-stone md:py-20">
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
        <div className="w-full px-[clamp(20px,3.5vw,72px)]">
          <div
            className="mx-auto hidden w-full max-w-[1760px] gap-4 transition-[grid-template-columns] duration-[680ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:grid"
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

          <div className="mx-auto flex w-full max-w-[1760px] flex-col gap-4 md:hidden">
            {categories.map((tile) => {
              const isActive = activeSlug === tile.slug;
              return (
                <CategoryTile
                  key={tile.slug}
                  tile={tile}
                  active={isActive}
                  onActivate={() => handleActivate(tile.slug)}
                  className="w-full"
                />
              );
            })}
          </div>
        </div>
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
