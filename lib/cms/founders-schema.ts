import { z } from "zod";

const founderSchema = z.object({
  name: z.string().max(120),
  role: z.string().max(80),
  phone: z.string().max(80),
  email: z.string().max(200),
  website: z.string().max(200),
  address: z.string().max(400),
  bio: z.array(z.string().max(600)).default([]),
  focus: z.array(z.string().max(200)).default([]),
  pull: z.string().max(400),
  portrait: z.string().max(2048).default(""),
});

export const foundersContentSchema = z.object({
  intro: z
    .object({
      eyebrow: z.string().max(80).default("Founders"),
      headlineLine1: z.string().max(120).default("Two founders."),
      headlineLine2: z.string().max(120).default("One studio."),
      body: z
        .string()
        .max(400)
        .default(
          "Lineamode is run by two founders with overlapping but complementary remits — commercial and operational, strategy and floor. Scroll to flip each card and meet them.",
        ),
    })
    .prefault({}),

  founders: z.array(founderSchema).default([]),

  cta: z
    .object({
      eyebrow: z.string().max(80).default("Speak to us"),
      headlineLine1: z.string().max(120).default("Brief us"),
      headlineLine2: z.string().max(120).default("directly."),
      body: z
        .string()
        .max(400)
        .default(
          "Both founders sit on every project pitch. Tell us what you're building and we'll come back inside two working days.",
        ),
      ctaLabel: z.string().max(80).default("Open the brief form"),
      ctaHref: z.string().max(2048).default("/contact"),
    })
    .prefault({}),
});

export type FounderItem = z.infer<typeof founderSchema>;
export type FoundersContent = z.infer<typeof foundersContentSchema>;

export const FOUNDERS_CONTENT_DEFAULTS: FoundersContent = {
  intro: {
    eyebrow: "Founders",
    headlineLine1: "Two founders.",
    headlineLine2: "One studio.",
    body: "Lineamode is run by two founders with overlapping but complementary remits — commercial and operational, strategy and floor. Scroll to flip each card and meet them.",
  },
  founders: [],
  cta: {
    eyebrow: "Speak to us",
    headlineLine1: "Brief us",
    headlineLine2: "directly.",
    body: "Both founders sit on every project pitch. Tell us what you're building and we'll come back inside two working days.",
    ctaLabel: "Open the brief form",
    ctaHref: "/contact",
  },
};

export function parseFoundersContent(raw: unknown): FoundersContent {
  const result = foundersContentSchema.safeParse(raw);
  if (result.success) return result.data;
  if (raw && typeof raw === "object") {
    const p = raw as Record<string, unknown>;
    return {
      intro: { ...FOUNDERS_CONTENT_DEFAULTS.intro, ...((p.intro as object) ?? {}) },
      founders: Array.isArray(p.founders) ? (p.founders as FounderItem[]) : [],
      cta: { ...FOUNDERS_CONTENT_DEFAULTS.cta, ...((p.cta as object) ?? {}) },
    };
  }
  return FOUNDERS_CONTENT_DEFAULTS;
}
