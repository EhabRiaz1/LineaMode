import { z } from "zod";

export const contactContentSchema = z.object({
  intro: z
    .object({
      eyebrow: z.string().max(80).default("Contact"),
      headlineLine1: z.string().max(120).default("Brief the studio."),
      headlineLine2: z.string().max(120).default("We answer in two days."),
    })
    .default({}),

  details: z
    .object({
      email: z.string().max(200).default("saif@lineamode.com"),
      phone: z.string().max(80).default("+92 300 1234567"),
      address: z
        .string()
        .max(400)
        .default("1st Floor, NESPAK House,\nG-5/2, Attaturk Avenue,\nIslamabad, Pakistan."),
      hours: z.string().max(120).default("Mon — Fri · 09:00 to 18:00 PKT"),
      formSectionLabel: z.string().max(80).default("Project Brief"),
    })
    .default({}),
});

export type ContactContent = z.infer<typeof contactContentSchema>;

export const CONTACT_CONTENT_DEFAULTS: ContactContent = {
  intro: {
    eyebrow: "Contact",
    headlineLine1: "Brief the studio.",
    headlineLine2: "We answer in two days.",
  },
  details: {
    email: "saif@lineamode.com",
    phone: "+92 300 1234567",
    address: "1st Floor, NESPAK House,\nG-5/2, Attaturk Avenue,\nIslamabad, Pakistan.",
    hours: "Mon — Fri · 09:00 to 18:00 PKT",
    formSectionLabel: "Project Brief",
  },
};

export function parseContactContent(raw: unknown): ContactContent {
  const result = contactContentSchema.safeParse(raw);
  if (result.success) return result.data;
  if (raw && typeof raw === "object") {
    const p = raw as Record<string, unknown>;
    return {
      intro: { ...CONTACT_CONTENT_DEFAULTS.intro, ...((p.intro as object) ?? {}) },
      details: { ...CONTACT_CONTENT_DEFAULTS.details, ...((p.details as object) ?? {}) },
    };
  }
  return CONTACT_CONTENT_DEFAULTS;
}
