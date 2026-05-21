import { z } from "zod";

const ctaSchema = z.object({
  label: z.string().max(80),
  href: z.string().max(2048),
});

const founderPreviewCardSchema = z.object({
  name: z.string().max(120),
  description: z.string().max(300),
  portrait: z.string().max(2048).default(""),
});

export const aboutContentSchema = z.object({
  intro: z
    .object({
      eyebrow: z.string().max(80).default("About"),
      headlineLine1: z.string().max(120).default("A studio for brands"),
      headlineLine2: z.string().max(120).default("that move fast."),
    })
    .prefault({}),

  manifesto: z
    .object({
      sectionLabel: z.string().max(80).default("01 Manifesto"),
      headlineLine1: z.string().max(200).default("End-to-end apparel —"),
      headlineItalic: z.string().max(200).default("design through production."),
      subheadline: z
        .string()
        .max(400)
        .default(
          "A specialism in knitwear made from performance polyesters, with a discipline that reaches into every step of the line.",
        ),
      pull: z
        .string()
        .max(400)
        .default(
          "We act as a design-led innovation partner that understands the intersection of global trends and manufacturing precision.",
        ),
      paragraphs: z
        .array(z.string().max(600))
        .default([
          "Fashion businesses operate in an increasingly complex world, in which issues a brand experiences from a supplier include inadequate product quality, overproduction, poor coordination and long lead times.",
          "There is a constant pressure to be efficient and reduce cost without compromising on the brand — and this is becoming more difficult in a consumer landscape that is always evolving with new trends.",
        ]),
    })
    .prefault({}),

  foundersCta: z
    .object({
      eyebrow: z.string().max(80).default("Founders"),
      headlineLine1: z.string().max(120).default("Four Founders."),
      headlineLine2: z.string().max(120).default("One Studio."),
      body: z
        .string()
        .max(400)
        .default(
          "Three decades in the global textile industry — working alongside the most exacting brands and manufacturers in fashion — taught the studio one thing above all: brands grow when their partner owns the long-term, not just the next purchase order.",
        ),
      image: z
        .string()
        .max(2048)
        .default(
          "https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1600&q=80",
        ),
      cards: z.array(founderPreviewCardSchema).default([
        {
          name: "Saif Ahmed",
          description:
            "Commercial strategy, mill relationships, and long-term partnerships for growing apparel brands.",
          portrait:
            "https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1200&q=80",
        },
        {
          name: "Wasay Hasan",
          description:
            "Design, product development, and critical-path discipline from concept through production.",
          portrait:
            "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1200&q=80",
        },
        {
          name: "Founder Three",
          description:
            "Product and sourcing leadership across fabric development, vendor coordination, and quality.",
          portrait:
            "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
        },
        {
          name: "Founder Four",
          description:
            "Operations and merchandising support that keeps timelines, costing, and delivery aligned.",
          portrait:
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1200&q=80",
        },
      ]),
      cta: ctaSchema.default({ label: "Meet the founders →", href: "/founders" }),
    })
    .prefault({}),

  hq: z
    .object({
      eyebrow: z.string().max(80).default("Studio"),
      headlineLine1: z.string().max(120).default("Islamabad,"),
      headlineLine2: z.string().max(120).default("Pakistan."),
      body: z
        .string()
        .max(400)
        .default(
          "The studio sits at NESPAK House on Attaturk Avenue — a working floor, not a showroom. Visitors are welcome by appointment.",
        ),
      address: z
        .string()
        .max(400)
        .default("1st Floor, NESPAK House,\nG-5/2, Attaturk Avenue,\nIslamabad, Pakistan."),
      image: z
        .string()
        .max(2048)
        .default(
          "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1600&q=80",
        ),
    })
    .prefault({}),
});

export type AboutContent = z.infer<typeof aboutContentSchema>;

export const ABOUT_CONTENT_DEFAULTS: AboutContent = {
  intro: {
    eyebrow: "About",
    headlineLine1: "A studio for brands",
    headlineLine2: "that move fast.",
  },
  manifesto: {
    sectionLabel: "01 Manifesto",
    headlineLine1: "End-to-end apparel —",
    headlineItalic: "design through production.",
    subheadline:
      "A specialism in knitwear made from performance polyesters, with a discipline that reaches into every step of the line.",
    pull: "We act as a design-led innovation partner that understands the intersection of global trends and manufacturing precision.",
    paragraphs: [
      "Fashion businesses operate in an increasingly complex world, in which issues a brand experiences from a supplier include inadequate product quality, overproduction, poor coordination and long lead times.",
      "There is a constant pressure to be efficient and reduce cost without compromising on the brand — and this is becoming more difficult in a consumer landscape that is always evolving with new trends.",
    ],
  },
  foundersCta: {
    eyebrow: "Founders",
    headlineLine1: "Four Founders.",
    headlineLine2: "One Studio.",
    body: "Three decades in the global textile industry — working alongside the most exacting brands and manufacturers in fashion — taught the studio one thing above all: brands grow when their partner owns the long-term, not just the next purchase order.",
    image:
      "https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1600&q=80",
    cards: [
      {
        name: "Saif Ahmed",
        description:
          "Commercial strategy, mill relationships, and long-term partnerships for growing apparel brands.",
        portrait:
          "https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Wasay Hasan",
        description:
          "Design, product development, and critical-path discipline from concept through production.",
        portrait:
          "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Founder Three",
        description:
          "Product and sourcing leadership across fabric development, vendor coordination, and quality.",
        portrait:
          "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Founder Four",
        description:
          "Operations and merchandising support that keeps timelines, costing, and delivery aligned.",
        portrait:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    cta: { label: "Learn more about us", href: "/founders" },
  },
  hq: {
    eyebrow: "Studio",
    headlineLine1: "Islamabad,",
    headlineLine2: "Pakistan.",
    body: "The studio sits at NESPAK House on Attaturk Avenue — a working floor, not a showroom. Visitors are welcome by appointment.",
    address: "1st Floor, NESPAK House,\nG-5/2, Attaturk Avenue,\nIslamabad, Pakistan.",
    image:
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1600&q=80",
  },
};

export function parseAboutContent(raw: unknown): AboutContent {
  const result = aboutContentSchema.safeParse(raw);
  if (result.success) return result.data;
  if (raw && typeof raw === "object") {
    const p = raw as Record<string, unknown>;
    return {
      intro: { ...ABOUT_CONTENT_DEFAULTS.intro, ...((p.intro as object) ?? {}) },
      manifesto: { ...ABOUT_CONTENT_DEFAULTS.manifesto, ...((p.manifesto as object) ?? {}) },
      foundersCta: {
        ...ABOUT_CONTENT_DEFAULTS.foundersCta,
        ...((p.foundersCta as object) ?? {}),
      },
      hq: { ...ABOUT_CONTENT_DEFAULTS.hq, ...((p.hq as object) ?? {}) },
    };
  }
  return ABOUT_CONTENT_DEFAULTS;
}
