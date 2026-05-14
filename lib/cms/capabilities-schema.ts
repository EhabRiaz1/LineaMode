import { z } from "zod";

const capabilityItemSchema = z.object({
  title: z.string().max(120),
  short: z.string().max(600),
  description: z.string().max(600),
  bullets: z.array(z.string().max(200)).max(8).default([]),
  image: z.string().max(2048).default(""),
});

const processStepSchema = z.object({
  step: z.string().max(10),
  title: z.string().max(80),
  note: z.string().max(200),
});

export const capabilitiesContentSchema = z.object({
  intro: z
    .object({
      eyebrow: z.string().max(80).default("Capabilities"),
      headlineLine1: z.string().max(120).default("Five disciplines."),
      headlineLine2: z.string().max(120).default("One studio floor."),
      body: z
        .string()
        .max(400)
        .default(
          "Each capability is owned by a senior in-house team — not outsourced and not relabelled. The work moves between them without changing partner.",
        ),
    })
    .prefault({}),

  capabilities: z.array(capabilityItemSchema).default([]),

  process: z
    .object({
      eyebrow: z.string().max(80).default("Process"),
      headlineLine1: z.string().max(120).default("One critical path,"),
      headlineLine2: z.string().max(120).default("five honest steps."),
      body: z
        .string()
        .max(400)
        .default(
          "Every project moves on the same five-step rail. Each step has an owner, a deliverable and a target date — visible to the client at all times.",
        ),
      steps: z.array(processStepSchema).default([]),
      ctaLabel: z.string().max(80).default("Brief the studio"),
      ctaHref: z.string().max(2048).default("/contact"),
    })
    .prefault({}),
});

export type CapabilitiesContent = z.infer<typeof capabilitiesContentSchema>;

// Default image URLs corresponding to capabilities 0–3
export const CAPABILITY_DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1600&q=80",
];

export const DEFAULT_PROCESS_STEPS = [
  { step: "01", title: "Brief", note: "Calendar, target cost, range strategy" },
  { step: "02", title: "Develop", note: "Fabric, pattern, prototype, fit" },
  { step: "03", title: "Approve", note: "PP sample, sealed swatch, sign-off" },
  { step: "04", title: "Produce", note: "Bulk run with in-line and end-line QC" },
  { step: "05", title: "Deliver", note: "Audit, document, ship, account" },
];

export const CAPABILITIES_CONTENT_DEFAULTS: CapabilitiesContent = {
  intro: {
    eyebrow: "Capabilities",
    headlineLine1: "Five disciplines.",
    headlineLine2: "One studio floor.",
    body: "Each capability is owned by a senior in-house team — not outsourced and not relabelled. The work moves between them without changing partner.",
  },
  capabilities: [],
  process: {
    eyebrow: "Process",
    headlineLine1: "One critical path,",
    headlineLine2: "five honest steps.",
    body: "Every project moves on the same five-step rail. Each step has an owner, a deliverable and a target date — visible to the client at all times.",
    steps: [],
    ctaLabel: "Brief the studio",
    ctaHref: "/contact",
  },
};

export function parseCapabilitiesContent(raw: unknown): CapabilitiesContent {
  const result = capabilitiesContentSchema.safeParse(raw);
  if (result.success) return result.data;
  if (raw && typeof raw === "object") {
    const p = raw as Record<string, unknown>;
    return {
      intro: { ...CAPABILITIES_CONTENT_DEFAULTS.intro, ...((p.intro as object) ?? {}) },
      capabilities: Array.isArray(p.capabilities)
        ? (p.capabilities as CapabilitiesContent["capabilities"])
        : [],
      process: { ...CAPABILITIES_CONTENT_DEFAULTS.process, ...((p.process as object) ?? {}) },
    };
  }
  return CAPABILITIES_CONTENT_DEFAULTS;
}
