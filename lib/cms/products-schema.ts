import { z } from "zod";
import {
  PRODUCT_CATEGORIES,
  PRODUCTS_HERO_IMAGE_DEFAULT,
  SEED_PRODUCT_CATALOG,
  type ProductCategorySlug,
} from "@/content/product-catalog";
import { CONTACT_FORM_HREF } from "@/lib/navigation";

const categorySlugSchema = z.enum(
  PRODUCT_CATEGORIES.map((c) => c.slug) as [ProductCategorySlug, ...ProductCategorySlug[]],
);

const ctaSchema = z.object({
  label: z.string().max(80),
  href: z.string().max(2048),
});

export const productCardSchema = z.object({
  id: z.string().max(80),
  category: categorySlugSchema,
  title: z.string().max(80),
  image: z.string().max(2048),
  hoverImage: z.string().max(2048).default(""),
  featured: z.boolean().default(false),
});

export const productsContentSchema = z.object({
  intro: z
    .object({
      eyebrow: z.string().max(80).default("Products"),
      headline: z.string().max(120).default("Our products"),
      image: z.string().max(2048).default(PRODUCTS_HERO_IMAGE_DEFAULT),
    })
    .prefault({}),

  catalog: z.array(productCardSchema).default([]),

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

export type ProductCard = z.infer<typeof productCardSchema>;
export type ProductsContent = z.infer<typeof productsContentSchema>;

export const PRODUCTS_CONTENT_DEFAULTS: ProductsContent = {
  intro: {
    eyebrow: "Products",
    headline: "Our products",
    image: PRODUCTS_HERO_IMAGE_DEFAULT,
  },
  catalog: [],
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
        href: secondary.href ?? CONTACT_FORM_HREF,
      },
    };
  }
  if (cta && "contactCta" in cta && cta.contactCta && typeof cta.contactCta === "object") {
    const contact = cta.contactCta as { label?: string; href?: string };
    return {
      ...base,
      contactCta: {
        label: contact.label ?? base.contactCta.label,
        href: contact.href ?? CONTACT_FORM_HREF,
      },
    };
  }
  return base;
}

export function resolveProductCatalog(catalog: ProductCard[]): ProductCard[] {
  if (catalog.length > 0) {
    return catalog.map((item) => ({
      ...item,
      hoverImage: item.hoverImage ?? "",
      featured: item.featured ?? false,
    }));
  }
  return SEED_PRODUCT_CATALOG.map((item) => ({
    ...item,
    featured: item.featured ?? false,
  }));
}

/**
 * Products surfaced in the homepage rail. Falls back to the first few items so
 * the rail is never empty if an editor hasn't flagged anything yet.
 */
export function getFeaturedProducts(catalog: ProductCard[], limit = 8): ProductCard[] {
  const flagged = catalog.filter((item) => item.featured);
  const base = flagged.length > 0 ? flagged : catalog;
  return base.slice(0, limit);
}

export function parseProductsContent(raw: unknown): ProductsContent {
  if (raw && typeof raw === "object") {
    const p = raw as Record<string, unknown>;

    if (isLegacyProductsPayload(p)) {
      return {
        intro: {
          ...PRODUCTS_CONTENT_DEFAULTS.intro,
          ...((p.intro as object) ?? {}),
          image:
            (p.intro as { image?: string } | undefined)?.image ?? PRODUCTS_HERO_IMAGE_DEFAULT,
        },
        catalog: [],
        cta: migrateLegacyCta(p.cta as Record<string, unknown> | undefined),
      };
    }

    const catalog = Array.isArray(p.catalog)
      ? (p.catalog as ProductCard[]).filter(
          (item) => item && typeof item === "object" && "category" in item,
        )
      : [];

    return {
      intro: {
        ...PRODUCTS_CONTENT_DEFAULTS.intro,
        ...((p.intro as object) ?? {}),
      },
      catalog,
      cta: migrateLegacyCta(p.cta as Record<string, unknown> | undefined),
    };
  }

  const result = productsContentSchema.safeParse(raw);
  if (result.success) return result.data;
  return PRODUCTS_CONTENT_DEFAULTS;
}
