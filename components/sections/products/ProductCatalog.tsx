"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PRODUCT_CATEGORIES, type ProductCategorySlug } from "@/content/product-catalog";
import type { ProductCard as ProductCardType } from "@/lib/cms/products-schema";
import { easeBrand } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

type ProductCatalogProps = {
  catalog: ProductCardType[];
};

const catalogInset = "mx-auto w-full max-w-[1760px] px-[clamp(28px,5vw,72px)]";

const catalogCardWidth =
  "w-full sm:w-[calc((100%-var(--catalog-gap))/2)] lg:w-[calc((100%-var(--catalog-gap)*3)/4)]";

export function ProductCatalog({ catalog }: ProductCatalogProps) {
  const [active, setActive] = useState<ProductCategorySlug>("lifestyle");

  const filtered = catalog.filter((item) => item.category === active);

  return (
    <section className="border-t hairline bg-stone">
      <div className={`${catalogInset} pt-14 md:pt-16`}>
        <div className="border-b border-ink/15">
          <nav aria-label="Product categories" role="tablist" className="flex justify-center">
            <div className="inline-flex flex-wrap justify-center gap-x-8 md:gap-x-14">
              {PRODUCT_CATEGORIES.map((category) => {
                const isActive = active === category.slug;
                return (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => setActive(category.slug)}
                    aria-selected={isActive}
                    role="tab"
                    className={cn(
                      "relative px-1 pb-4 font-[family-name:var(--font-display)] text-[clamp(1.25rem,2vw,1.6rem)] leading-none tracking-[0.01em] transition-colors duration-300",
                      isActive
                        ? "font-medium text-ink"
                        : "font-normal text-ink/45 hover:text-ink/70",
                    )}
                  >
                    {category.title}
                    {isActive && (
                      <motion.span
                        layoutId="products-tab-underline"
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-ink"
                        transition={{ duration: 0.4, ease: easeBrand }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      <div className={`${catalogInset} pb-24 pt-10 md:pb-32 md:pt-12`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            role="tabpanel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.45, ease: easeBrand }}
            className="flex flex-wrap justify-center gap-[var(--catalog-gap)] [--catalog-gap:2rem] md:[--catalog-gap:2.5rem]"
          >
            {filtered.map((item) => (
              <ProductCard
                key={item.id}
                title={item.title}
                image={item.image}
                hoverImage={item.hoverImage}
                variant="grid"
                className={catalogCardWidth}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
