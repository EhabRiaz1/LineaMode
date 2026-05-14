import { z } from "zod";

const ctaSchema = z.object({
  label: z.string().max(80),
  href: z.string().max(2048),
});

export const homeContentSchema = z.object({
  hero: z
    .object({
      eyebrow: z.string().max(120).default("Lineamode Apparel · Est. Islamabad"),
      headlineLine1: z.string().max(120).default("From Idea"),
      headlineLine2: z.string().max(120).default("to Execution."),
      description: z.string().max(200).default("Knitwear · Performance Polyester · Soft Wovens"),
      bottomLabel: z.string().max(120).default("Design / Development / Manufacture"),
      image: z
        .string()
        .max(2048)
        .default(
          "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=2400&q=85",
        ),
      primaryCta: ctaSchema.default({ label: "What we do", href: "/capabilities" }),
      secondaryCta: ctaSchema.default({ label: "Start a project", href: "/start" }),
    })
    .prefault({}),

  whatWeDo: z
    .object({
      enabled: z.boolean().default(true),
      eyebrow: z.string().max(80).default("Services"),
      headlineLine1: z.string().max(120).default("What we can do"),
      headlineLine2: z.string().max(120).default("for your fashion brand"),
    })
    .prefault({}),

  products: z
    .object({
      enabled: z.boolean().default(true),
      headline: z.string().max(200).default("We cover a full range of products"),
      headlineItalic: z
        .string()
        .max(200)
        .default("designed to meet performance and lifestyle needs"),
      body: z
        .string()
        .max(600)
        .default(
          "From everyday essentials to performance-led ranges, we build product lines with the right fabric, fit, and finish for the market they need to serve.",
        ),
      tiles: z
        .array(
          z.object({
            title: z.string().max(80),
            caption: z.string().max(200),
            poster: z.string().max(2048),
            imageAlt: z.string().max(200),
          }),
        )
        .default([]),
    })
    .prefault({}),

  identity: z
    .object({
      enabled: z.boolean().default(true),
      eyebrow: z.string().max(80).default("Our Identity"),
      headline: z.string().max(200).default("Decades in the studio,"),
      headlineItalic: z.string().max(200).default("one disciplined line."),
      body: z
        .string()
        .max(800)
        .default(
          "Lineamode Apparel is a design-led manufacturing partner shaped by years on the floor and in the field — from trend and textile to production and merchandising. We work with global fashion brands that need technical competence, operational agility, and a studio that treats every collection as a long-term collaboration.",
        ),
      image: z.string().max(2048).default("/images/home/identity-office.jpg"),
    })
    .prefault({}),

  journal: z
    .object({
      enabled: z.boolean().default(true),
      eyebrow: z.string().max(80).default("Journal"),
      headlineLine1: z.string().max(200).default("Stay up to date with the latest news"),
      headlineLine2: z
        .string()
        .max(200)
        .default("and trends for global fashion and textile"),
      body: z
        .string()
        .max(600)
        .default(
          "Field notes on materials, manufacturing, and the wider industry — written for brands that want context without the noise.",
        ),
      ctaLabel: z.string().max(80).default("Read the journal"),
      ctaHref: z.string().max(2048).default("/journal"),
    })
    .prefault({}),

  contactCta: z
    .object({
      enabled: z.boolean().default(true),
      eyebrow: z.string().max(80).default("Start a Project"),
      headlineLine1: z.string().max(120).default("Tell us"),
      headlineLine2: z.string().max(120).default("what you're making."),
      body: z
        .string()
        .max(600)
        .default(
          "We work with global brands of all sizes — from emerging labels with their first runs, to established houses scaling new divisions. Share what you're building and we'll come back inside two working days.",
        ),
      email: z.string().max(200).default("saif@lineamode.com"),
      phone: z.string().max(80).default("+92 300 1234567"),
      studio: z.string().max(120).default("Islamabad, Pakistan"),
      primaryCta: ctaSchema.default({ label: "Brief the studio", href: "/start" }),
      secondaryCta: ctaSchema.default({ label: "Contact", href: "/contact" }),
    })
    .prefault({}),

  capabilities: z
    .object({
      enabled: z.boolean().default(true),
      headline: z.string().max(120).default("One studio."),
      headlineItalic: z.string().max(120).default("Every step in motion."),
      items: z
        .array(
          z.object({
            title: z.string().max(120),
            short: z.string().max(600),
            image: z.string().max(2048).default(""),
          }),
        )
        .default([]),
    })
    .prefault({}),
});

export type HomeContent = z.infer<typeof homeContentSchema>;

export const HOME_CONTENT_DEFAULTS: HomeContent = {
  hero: {
    eyebrow: "Lineamode Apparel · Est. Islamabad",
    headlineLine1: "From Idea",
    headlineLine2: "to Execution.",
    description: "Knitwear · Performance Polyester · Soft Wovens",
    bottomLabel: "Design / Development / Manufacture",
    image:
      "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=2400&q=85",
    primaryCta: { label: "What we do", href: "/capabilities" },
    secondaryCta: { label: "Start a project", href: "/start" },
  },
  whatWeDo: {
    enabled: true,
    eyebrow: "Services",
    headlineLine1: "What we can do",
    headlineLine2: "for your fashion brand",
  },
  products: {
    enabled: true,
    headline: "We cover a full range of products",
    headlineItalic: "designed to meet performance and lifestyle needs",
    body: "From everyday essentials to performance-led ranges, we build product lines with the right fabric, fit, and finish for the market they need to serve.",
    tiles: [],
  },
  identity: {
    enabled: true,
    eyebrow: "Our Identity",
    headline: "Decades in the studio,",
    headlineItalic: "one disciplined line.",
    body: "Lineamode Apparel is a design-led manufacturing partner shaped by years on the floor and in the field — from trend and textile to production and merchandising. We work with global fashion brands that need technical competence, operational agility, and a studio that treats every collection as a long-term collaboration.",
    image: "/images/home/identity-office.jpg",
  },
  journal: {
    enabled: true,
    eyebrow: "Journal",
    headlineLine1: "Stay up to date with the latest news",
    headlineLine2: "and trends for global fashion and textile",
    body: "Field notes on materials, manufacturing, and the wider industry — written for brands that want context without the noise.",
    ctaLabel: "Read the journal",
    ctaHref: "/journal",
  },
  contactCta: {
    enabled: true,
    eyebrow: "Start a Project",
    headlineLine1: "Tell us",
    headlineLine2: "what you're making.",
    body: "We work with global brands of all sizes — from emerging labels with their first runs, to established houses scaling new divisions. Share what you're building and we'll come back inside two working days.",
    email: "saif@lineamode.com",
    phone: "+92 300 1234567",
    studio: "Islamabad, Pakistan",
    primaryCta: { label: "Brief the studio", href: "/start" },
    secondaryCta: { label: "Contact", href: "/contact" },
  },
  capabilities: {
    enabled: true,
    headline: "One studio.",
    headlineItalic: "Every step in motion.",
    items: [],
  },
};

export function parseHomeContent(raw: unknown): HomeContent {
  const result = homeContentSchema.safeParse(raw);
  if (result.success) return result.data;
  if (raw && typeof raw === "object") {
    const p = raw as Record<string, unknown>;
    return {
      hero: { ...HOME_CONTENT_DEFAULTS.hero, ...((p.hero as object) ?? {}) },
      whatWeDo: { ...HOME_CONTENT_DEFAULTS.whatWeDo, ...((p.whatWeDo as object) ?? {}) },
      products: { ...HOME_CONTENT_DEFAULTS.products, ...((p.products as object) ?? {}) },
      identity: { ...HOME_CONTENT_DEFAULTS.identity, ...((p.identity as object) ?? {}) },
      journal: { ...HOME_CONTENT_DEFAULTS.journal, ...((p.journal as object) ?? {}) },
      contactCta: { ...HOME_CONTENT_DEFAULTS.contactCta, ...((p.contactCta as object) ?? {}) },
      capabilities: {
        ...HOME_CONTENT_DEFAULTS.capabilities,
        ...((p.capabilities as object) ?? {}),
      },
    };
  }
  return HOME_CONTENT_DEFAULTS;
}
