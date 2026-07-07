import { z } from "zod";
import {
  PRODUCT_CATEGORIES,
  PRODUCTS_HERO_IMAGE_DEFAULT,
  SEED_PRODUCT_CATALOG,
  SEED_SUBCATEGORIES,
  CATEGORY_DESCRIPTIONS,
  productsCategoryHref,
  type ProductCategorySlug,
} from "@/content/product-catalog";
import { CONTACT_FORM_HREF, resolveContactHref } from "@/lib/navigation";
import { cmsImageSchema, cmsImageSrc, type CmsImageValue } from "@/lib/cms/cms-image";

const categorySlugSchema = z.enum(
  PRODUCT_CATEGORIES.map((c) => c.slug) as [ProductCategorySlug, ...ProductCategorySlug[]],
);

const ctaSchema = z.object({
  label: z.string().max(80),
  href: z.string().max(2048),
});

export const DEFAULT_LOOKBOOK_PDF_HREF = "/documents/lineamode-lookbook.pdf";

export const lookbookCtaSchema = z.object({
  label: z.string().max(80).default("Explore lookbook"),
  pdfHref: z.string().max(2048).default(DEFAULT_LOOKBOOK_PDF_HREF),
});

export const subcategorySchema = z.object({
  id: z.string().max(80),
  title: z.string().max(80),
  slug: z.string().max(80),
  image: cmsImageSchema.default(""),
  sortOrder: z.number().int().min(0).default(0),
});

export const categoryConfigSchema = z.object({
  slug: categorySlugSchema,
  image: cmsImageSchema.default(""),
  hoverImage: cmsImageSchema.default(""),
  /** Optional headline on the homepage hover panel; defaults to the category title. */
  homeHeadline: z.string().max(80).default(""),
  /** Body copy on the homepage hover panel. */
  description: z.string().max(400).default(""),
  /** CTA label on the homepage hover panel. */
  homeCtaLabel: z.string().max(80).default(""),
  subcategories: z.array(subcategorySchema).default([]),
});

export const productCardSchema = z.object({
  id: z.string().max(80),
  category: categorySlugSchema,
  title: z.string().max(80),
  image: cmsImageSchema,
  hoverImage: cmsImageSchema.default(""),
  subcategoryId: z.string().max(80).default(""),
  featured: z.boolean().default(false),
});

export const productsContentSchema = z.object({
  intro: z
    .object({
      eyebrow: z.string().max(80).default("Products"),
      headline: z.string().max(120).default("Our products"),
      image: cmsImageSchema.default(PRODUCTS_HERO_IMAGE_DEFAULT),
    })
    .prefault({}),

  categories: z.array(categoryConfigSchema).default([]),

  catalog: z.array(productCardSchema).default([]),

  lookbookCta: lookbookCtaSchema.prefault({}),

  cta: z
    .object({
      headlineLine1: z.string().max(120).default("Build a range"),
      headlineLine2: z.string().max(120).default("with us."),
      body: z
        .string()
        .max(400)
        .default(
          "Send a brief and we'll respond with fabric options, costings and an indicative critical path within two working days.",
        ),
      contactCta: ctaSchema.default({ label: "Contact us", href: CONTACT_FORM_HREF }),
    })
    .prefault({}),
});

export type Subcategory = z.infer<typeof subcategorySchema>;
export type CategoryConfig = z.infer<typeof categoryConfigSchema>;
export type ProductCard = z.infer<typeof productCardSchema>;
export type ProductsContent = z.infer<typeof productsContentSchema>;

export type HomeCategoryTile = {
  slug: ProductCategorySlug;
  title: string;
  headline: string;
  description: string;
  image: CmsImageValue;
  ctaHref: string;
  ctaLabel: string;
};

export const PRODUCTS_CONTENT_DEFAULTS: ProductsContent = {
  intro: {
    eyebrow: "Products",
    headline: "Our products",
    image: PRODUCTS_HERO_IMAGE_DEFAULT,
  },
  categories: [],
  catalog: [],
  lookbookCta: {
    label: "Explore lookbook",
    pdfHref: DEFAULT_LOOKBOOK_PDF_HREF,
  },
  cta: {
    headlineLine1: "Build a range",
    headlineLine2: "with us.",
    body: "Send a brief and we'll respond with fabric options, costings and an indicative critical path within two working days.",
    contactCta: { label: "Contact us", href: CONTACT_FORM_HREF },
  },
};

function isLegacyProductsPayload(raw: Record<string, unknown>): boolean {
  if (!Array.isArray(raw.products) || raw.products.length === 0) return false;
  const first = raw.products[0];
  return !!first && typeof first === "object" && !("category" in first);
}

function migrateLegacyCta(cta: Record<string, unknown> | undefined): ProductsContent["cta"] {
  const base = { ...PRODUCTS_CONTENT_DEFAULTS.cta, ...(cta ?? {}) };
  if (cta && "secondaryCta" in cta && cta.secondaryCta && typeof cta.secondaryCta === "object") {
    const secondary = cta.secondaryCta as { label?: string; href?: string };
    return {
      ...base,
      contactCta: {
        label: secondary.label ?? base.contactCta.label,
        href: resolveContactHref(secondary.href ?? base.contactCta.href),
      },
    };
  }
  if (cta && "contactCta" in cta && cta.contactCta && typeof cta.contactCta === "object") {
    const contact = cta.contactCta as { label?: string; href?: string };
    return {
      ...base,
      contactCta: {
        label: contact.label ?? base.contactCta.label,
        href: resolveContactHref(contact.href ?? base.contactCta.href),
      },
    };
  }
  return {
    ...base,
    contactCta: {
      ...base.contactCta,
      href: resolveContactHref(base.contactCta.href),
    },
  };
}

function normalizeCatalogItem(item: ProductCard): ProductCard {
  return {
    ...item,
    hoverImage: item.hoverImage ?? "",
    subcategoryId: item.subcategoryId ?? "",
    featured: item.featured ?? false,
  };
}

function firstProductImagesForCategory(
  catalog: ProductCard[],
  slug: ProductCategorySlug,
): { image: string; hoverImage: string } {
  const item = catalog.find((p) => p.category === slug && cmsImageSrc(p.image));
  if (!item) return { image: "", hoverImage: "" };
  const image = cmsImageSrc(item.image);
  const hover = cmsImageSrc(item.hoverImage) || image;
  return { image, hoverImage: hover };
}

export function sortSubcategories(subcategories: Subcategory[]): Subcategory[] {
  return [...subcategories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function resolveProductCatalog(catalog: ProductCard[]): ProductCard[] {
  if (catalog.length > 0) {
    return catalog.map(normalizeCatalogItem);
  }
  return SEED_PRODUCT_CATALOG.map((item) =>
    normalizeCatalogItem({
      ...item,
      subcategoryId: item.subcategoryId ?? "",
      featured: item.featured ?? false,
    }),
  );
}

export function resolveCategoryConfigs(
  content: Pick<ProductsContent, "categories" | "catalog">,
): CategoryConfig[] {
  const catalog = resolveProductCatalog(content.catalog);
  const bySlug = new Map(
    (content.categories ?? []).map((category) => [category.slug, category]),
  );

  return PRODUCT_CATEGORIES.map((category) => {
    const existing = bySlug.get(category.slug);
    const fallbackImages = firstProductImagesForCategory(catalog, category.slug);
    const subcategories =
      existing?.subcategories?.length
        ? sortSubcategories(existing.subcategories).map((sub) => ({
            ...sub,
            image: sub.image ?? "",
          }))
        : SEED_SUBCATEGORIES[category.slug].map((sub) => ({
            ...sub,
            image: sub.image ?? "",
          }));

    return {
      slug: category.slug,
      image: existing?.image || fallbackImages.image,
      hoverImage: existing?.hoverImage || fallbackImages.hoverImage || fallbackImages.image,
      homeHeadline: existing?.homeHeadline ?? "",
      description: existing?.description || CATEGORY_DESCRIPTIONS[category.slug],
      homeCtaLabel: existing?.homeCtaLabel ?? "",
      subcategories,
    };
  });
}

export function getHomeCategoryTiles(
  content: Pick<ProductsContent, "categories" | "catalog">,
  viewAllHref = "/products",
): HomeCategoryTile[] {
  return resolveCategoryConfigs(content).map((config) => {
    const meta = PRODUCT_CATEGORIES.find((c) => c.slug === config.slug)!;
    const productsPath = viewAllHref.split("?")[0] || "/products";
    return {
      slug: config.slug,
      title: meta.title,
      headline: config.homeHeadline?.trim() || meta.title,
      description: config.description || CATEGORY_DESCRIPTIONS[config.slug],
      image: config.image,
      ctaHref: productsCategoryHref(config.slug, productsPath),
      ctaLabel:
        config.homeCtaLabel?.trim() || `Explore ${meta.title.toLowerCase()}`,
    };
  });
}

/** Images previously stored on products_content category config (pre–Home CMS split). */
export function getLegacyHomeCategoryImages(
  content: Pick<ProductsContent, "categories" | "catalog">,
): Partial<Record<ProductCategorySlug, CmsImageValue>> {
  const images: Partial<Record<ProductCategorySlug, CmsImageValue>> = {};
  for (const tile of getHomeCategoryTiles(content)) {
    if (cmsImageSrc(tile.image)) {
      images[tile.slug] = tile.image;
    }
  }
  return images;
}

export type HomeCategoryCopy = {
  slug: ProductCategorySlug;
  headline: string;
  description: string;
  ctaLabel: string;
  image?: CmsImageValue;
};

/** Applies homepage CMS copy and images onto product-sourced category tiles. */
export function applyHomeCategoryCopy(
  tiles: HomeCategoryTile[],
  copy: HomeCategoryCopy[],
): HomeCategoryTile[] {
  const bySlug = new Map(copy.map((item) => [item.slug, item]));

  return tiles.map((tile) => {
    const home = bySlug.get(tile.slug);
    if (!home) return tile;

    return {
      ...tile,
      headline: home.headline.trim() || tile.headline,
      description: home.description.trim() || tile.description,
      ctaLabel: home.ctaLabel.trim() || tile.ctaLabel,
      image: cmsImageSrc(home.image) ? home.image! : tile.image,
    };
  });
}

export type SubcategoryProductGroup = {
  subcategory: Subcategory | null;
  products: ProductCard[];
};

export function groupProductsBySubcategory(
  catalog: ProductCard[],
  categorySlug: ProductCategorySlug,
  subcategories: Subcategory[],
): SubcategoryProductGroup[] {
  const inCategory = catalog.filter((item) => item.category === categorySlug);
  const sorted = sortSubcategories(subcategories);
  const groups: SubcategoryProductGroup[] = sorted.map((subcategory) => ({
    subcategory,
    products: inCategory.filter((item) => item.subcategoryId === subcategory.id),
  }));

  const uncategorized = inCategory.filter(
    (item) => !item.subcategoryId || !sorted.some((sub) => sub.id === item.subcategoryId),
  );

  if (uncategorized.length > 0) {
    groups.push({ subcategory: null, products: uncategorized });
  }

  return groups.filter((group) => group.products.length > 0);
}

const SEED_SUBCATEGORY_BY_PRODUCT_ID = new Map(
  SEED_PRODUCT_CATALOG.map((item) => [item.id, item.subcategoryId]),
);

/** Infer subcategory id for backfill when CMS data is missing assignments. */
export function inferSubcategoryId(product: ProductCard): string {
  if (product.subcategoryId) return product.subcategoryId;

  const fromSeed = SEED_SUBCATEGORY_BY_PRODUCT_ID.get(product.id);
  if (fromSeed) return fromSeed;

  const title = product.title.toLowerCase();
  const id = product.id.toLowerCase();
  const category = product.category;

  const rules: Record<ProductCategorySlug, Array<{ match: RegExp; subcategoryId: string }>> = {
    lifestyle: [
      { match: /jacket|outer|quilted|coat/, subcategoryId: "lifestyle-outerwear" },
      { match: /knit|merino|cashmere|crew|polo|sweater/, subcategoryId: "lifestyle-knitwear" },
      { match: /shirt|chino|trouser|linen|oxford|tailor/, subcategoryId: "lifestyle-tailoring" },
      { match: /accessor|bag|belt|scarf/, subcategoryId: "lifestyle-accessories" },
    ],
    athleisure: [
      { match: /hoodie|layer|zip/, subcategoryId: "athleisure-layers" },
      { match: /top|crop|tank|tee/, subcategoryId: "athleisure-tops" },
      { match: /jogger|short|legging|pant|bottom/, subcategoryId: "athleisure-bottoms" },
      { match: /accessor/, subcategoryId: "athleisure-accessories" },
    ],
    sportswear: [
      { match: /compress|tight/, subcategoryId: "sportswear-compression" },
      { match: /recover|warm-up|hoodie/, subcategoryId: "sportswear-recovery" },
      { match: /team/, subcategoryId: "sportswear-teamwear" },
      { match: /performance|training|tee|vest/, subcategoryId: "sportswear-performance" },
    ],
  };

  for (const rule of rules[category]) {
    if (rule.match.test(title) || rule.match.test(id)) return rule.subcategoryId;
  }

  const fallback = SEED_SUBCATEGORIES[category][0];
  return fallback?.id ?? "";
}

/**
 * @deprecated Homepage now uses category tiles via getHomeCategoryTiles().
 */
export function getFeaturedProducts(catalog: ProductCard[], limit = 8): ProductCard[] {
  const flagged = catalog.filter((item) => item.featured);
  const base = flagged.length > 0 ? flagged : catalog;
  return base.slice(0, limit);
}

function parseCategories(raw: unknown, catalog: ProductCard[]): CategoryConfig[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return resolveCategoryConfigs({ categories: [], catalog });
  }

  const parsed = raw
    .filter((item) => item && typeof item === "object" && "slug" in item)
    .map((item) => {
      const result = categoryConfigSchema.safeParse(item);
      return result.success ? result.data : null;
    })
    .filter((item): item is CategoryConfig => item !== null);

  return resolveCategoryConfigs({ categories: parsed, catalog });
}

function parseCatalog(raw: unknown): ProductCard[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && typeof item === "object" && "category" in item)
    .map((item) => normalizeCatalogItem(item as ProductCard));
}

export function parseProductsContent(raw: unknown): ProductsContent {
  if (raw && typeof raw === "object") {
    const p = raw as Record<string, unknown>;

    if (isLegacyProductsPayload(p)) {
      const catalog: ProductCard[] = [];
      return {
        intro: {
          ...PRODUCTS_CONTENT_DEFAULTS.intro,
          ...((p.intro as object) ?? {}),
          image:
            (p.intro as { image?: string } | undefined)?.image ?? PRODUCTS_HERO_IMAGE_DEFAULT,
        },
        categories: resolveCategoryConfigs({ categories: [], catalog }),
        catalog,
        lookbookCta: {
          ...PRODUCTS_CONTENT_DEFAULTS.lookbookCta,
          ...((p.lookbookCta as object) ?? {}),
        },
        cta: migrateLegacyCta(p.cta as Record<string, unknown> | undefined),
      };
    }

    const catalog = parseCatalog(p.catalog);
    const categories = parseCategories(p.categories, catalog);

    return {
      intro: {
        ...PRODUCTS_CONTENT_DEFAULTS.intro,
        ...((p.intro as object) ?? {}),
      },
      categories,
      catalog,
      lookbookCta: {
        ...PRODUCTS_CONTENT_DEFAULTS.lookbookCta,
        ...((p.lookbookCta as object) ?? {}),
      },
      cta: migrateLegacyCta(p.cta as Record<string, unknown> | undefined),
    };
  }

  const result = productsContentSchema.safeParse(raw);
  if (result.success) {
    const catalog = parseCatalog(result.data.catalog);
    return {
      ...result.data,
      categories: parseCategories(result.data.categories, catalog),
      catalog,
      lookbookCta: result.data.lookbookCta,
      cta: {
        ...result.data.cta,
        contactCta: {
          ...result.data.cta.contactCta,
          href: resolveContactHref(result.data.cta.contactCta.href),
        },
      },
    };
  }
  return {
    ...PRODUCTS_CONTENT_DEFAULTS,
    categories: resolveCategoryConfigs(PRODUCTS_CONTENT_DEFAULTS),
  };
}
