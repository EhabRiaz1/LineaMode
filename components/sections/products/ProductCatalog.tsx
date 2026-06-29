"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  PRODUCT_CATEGORIES,
  parseProductCategorySlug,
  subcategorySectionId,
  type ProductCategorySlug,
} from "@/content/product-catalog";
import type { CategoryConfig, ProductCard as ProductCardType } from "@/lib/cms/products-schema";
import { groupProductsBySubcategory } from "@/lib/cms/products-schema";
import { easeBrand } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";
import { SubcategoryProductSection } from "./SubcategoryProductSection";

type ProductCatalogProps = {
  catalog: ProductCardType[];
  categories: CategoryConfig[];
  lookbookPdfHref?: string;
  lookbookCtaLabel?: string;
};

const catalogInset = "mx-auto w-full max-w-[1760px] px-[clamp(28px,5vw,72px)]";

type ProductCatalogViewProps = ProductCatalogProps & {
  active: ProductCategorySlug;
  activeSubcategory: string | null;
  onTabChange: (slug: ProductCategorySlug) => void;
};

function ProductCatalogView({
  catalog,
  categories,
  active,
  activeSubcategory,
  onTabChange,
  lookbookPdfHref,
  lookbookCtaLabel,
}: ProductCatalogViewProps) {
  const categoryConfig = categories.find((item) => item.slug === active)!;
  const groups = useMemo(
    () => groupProductsBySubcategory(catalog, active, categoryConfig.subcategories),
    [catalog, active, categoryConfig.subcategories],
  );

  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());
  const pendingScrollSlug = useRef<string | null>(null);
  const hasInitializedFromUrl = useRef(false);

  useEffect(() => {
    setExpandedSlugs(new Set());
    hasInitializedFromUrl.current = false;
  }, [active]);

  useEffect(() => {
    if (!activeSubcategory || hasInitializedFromUrl.current) return;

    const exists = groups.some((group) => group.subcategory?.slug === activeSubcategory);
    if (!exists) return;

    hasInitializedFromUrl.current = true;
    pendingScrollSlug.current = activeSubcategory;
    setExpandedSlugs((prev) => new Set(prev).add(activeSubcategory));
  }, [activeSubcategory, groups]);

  useEffect(() => {
    const slug = pendingScrollSlug.current;
    if (!slug) return;

    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(subcategorySectionId(active, slug));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        pendingScrollSlug.current = null;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [active, expandedSlugs, groups]);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash || !hash.startsWith("products-subcategory-")) return;

    const match = groups.find(
      (group) =>
        group.subcategory &&
        subcategorySectionId(active, group.subcategory.slug) === hash,
    );
    if (!match?.subcategory) return;

    setExpandedSlugs((prev) => new Set(prev).add(match.subcategory!.slug));
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [active, groups]);

  const toggleExpanded = (slug: string) => {
    setExpandedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <section className="border-t hairline bg-stone">
      <div className={`${catalogInset} pt-14 md:pt-16`}>
        <div className="border-b border-ink/15">
          <nav
            aria-label="Product categories"
            role="tablist"
            className="overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] md:overflow-visible [&::-webkit-scrollbar]:hidden"
          >
            <div className="mx-auto flex w-max max-w-none flex-nowrap items-end justify-center gap-x-6 px-1 sm:gap-x-8 md:gap-x-14">
              {PRODUCT_CATEGORIES.map((category) => {
                const isActive = active === category.slug;
                return (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => onTabChange(category.slug)}
                    aria-selected={isActive}
                    role="tab"
                    className={cn(
                      "relative shrink-0 whitespace-nowrap px-1 pb-4 font-sans text-[1.05rem] font-light leading-none tracking-[0.01em] transition-colors duration-300 sm:text-[clamp(1.15rem,2vw,1.6rem)]",
                      isActive ? "text-ink" : "text-ink/45 hover:text-ink/70",
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
            className="space-y-12 md:space-y-16"
          >
            {groups.map((group) => {
              const slug = group.subcategory?.slug ?? "uncategorized";
              return (
                <SubcategoryProductSection
                  key={`${active}-${slug}`}
                  categorySlug={active}
                  subcategory={group.subcategory}
                  products={group.products}
                  expanded={expandedSlugs.has(slug)}
                  onToggleExpanded={() => toggleExpanded(slug)}
                  lookbookPdfHref={lookbookPdfHref}
                  lookbookCtaLabel={lookbookCtaLabel}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function ProductCatalogInner({
  catalog,
  categories,
  lookbookPdfHref,
  lookbookCtaLabel,
}: ProductCatalogProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const active = parseProductCategorySlug(searchParams.get("category"));
  const activeSubcategory = (() => {
    const raw = searchParams.get("subcategory");
    if (!raw) return null;
    const config = categories.find((item) => item.slug === active);
    if (!config?.subcategories.some((sub) => sub.slug === raw)) return null;
    return raw;
  })();

  const onTabChange = useCallback(
    (slug: ProductCategorySlug) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("category", slug);
      params.delete("subcategory");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <ProductCatalogView
      catalog={catalog}
      categories={categories}
      active={active}
      activeSubcategory={activeSubcategory}
      onTabChange={onTabChange}
      lookbookPdfHref={lookbookPdfHref}
      lookbookCtaLabel={lookbookCtaLabel}
    />
  );
}

function ProductCatalogFallback({
  catalog,
  categories,
  lookbookPdfHref,
  lookbookCtaLabel,
}: ProductCatalogProps) {
  return (
    <ProductCatalogView
      catalog={catalog}
      categories={categories}
      active="lifestyle"
      activeSubcategory={null}
      onTabChange={() => {}}
      lookbookPdfHref={lookbookPdfHref}
      lookbookCtaLabel={lookbookCtaLabel}
    />
  );
}

export function ProductCatalog(props: ProductCatalogProps) {
  return (
    <Suspense fallback={<ProductCatalogFallback {...props} />}>
      <ProductCatalogInner {...props} />
    </Suspense>
  );
}
