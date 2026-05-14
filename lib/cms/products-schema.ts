import { z } from "zod";

const ctaSchema = z.object({
  label: z.string().max(80),
  href: z.string().max(2048),
});

const productItemSchema = z.object({
  title: z.string().max(80),
  tagline: z.string().max(120),
  description: z.string().max(600),
  highlights: z.array(z.string().max(120)).default([]),
  hero: z.string().max(2048),
  detail: z.string().max(2048),
  moq: z.string().max(80).default("From 200 pcs"),
  leadTime: z.string().max(80).default("45–60 days"),
});

export const productsContentSchema = z.object({
  intro: z
    .object({
      eyebrow: z.string().max(80).default("Products"),
      headline: z.string().max(120).default("Our products"),
    })
    .default({}),

  products: z.array(productItemSchema).default([]),

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
      primaryCta: ctaSchema.default({ label: "Start a project", href: "/start" }),
      secondaryCta: ctaSchema.default({ label: "Contact us", href: "/contact" }),
    })
    .default({}),
});

export type ProductItem = z.infer<typeof productItemSchema>;
export type ProductsContent = z.infer<typeof productsContentSchema>;

export const PRODUCTS_CONTENT_DEFAULTS: ProductsContent = {
  intro: {
    eyebrow: "Products",
    headline: "Our products",
  },
  products: [],
  cta: {
    headlineLine1: "Build a range",
    headlineLine2: "with us.",
    body: "Send a brief and we'll respond with fabric options, costings and an indicative critical path within two working days.",
    primaryCta: { label: "Start a project", href: "/start" },
    secondaryCta: { label: "Contact us", href: "/contact" },
  },
};

export function parseProductsContent(raw: unknown): ProductsContent {
  const result = productsContentSchema.safeParse(raw);
  if (result.success) return result.data;
  if (raw && typeof raw === "object") {
    const p = raw as Record<string, unknown>;
    return {
      intro: { ...PRODUCTS_CONTENT_DEFAULTS.intro, ...((p.intro as object) ?? {}) },
      products: Array.isArray(p.products) ? (p.products as ProductItem[]) : [],
      cta: { ...PRODUCTS_CONTENT_DEFAULTS.cta, ...((p.cta as object) ?? {}) },
    };
  }
  return PRODUCTS_CONTENT_DEFAULTS;
}
