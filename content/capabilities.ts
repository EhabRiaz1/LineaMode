export type Capability = {
  number: string;
  slug: string;
  title: string;
  short: string;
  description: string;
  bullets: string[];
};

export const capabilities: Capability[] = [
  {
    number: "01",
    slug: "design-support",
    title: "Design Support",
    short:
      "Design with us, or design through us. We translate your concept into garments engineered to scale.",
    description:
      "From mood-board to tech pack, our design team works alongside yours to develop ranges that are commercially aware and technically resolved.",
    bullets: [
      "Trend forecasting and seasonal direction",
      "Range planning and merchandising",
      "Sketch development, CAD and tech packs",
      "Brand-aligned colour and material curation",
    ],
  },
  {
    number: "02",
    slug: "product-development",
    title: "Product Development",
    short:
      "Patterns, prototypes, fittings — every detail re-developed until it earns its place in the line.",
    description:
      "We move from first sample to production-ready in weeks, with disciplined iteration so nothing reaches your buyer that isn't right.",
    bullets: [
      "Pattern engineering and grading",
      "Multi-round prototyping with audit trail",
      "Fit sessions and sizing roll-outs",
      "Performance-fabric R&D in-house",
    ],
  },
  {
    number: "03",
    slug: "fabric-sourcing",
    title: "Fabric Sourcing",
    short:
      "Performance polyesters and premium knits from a curated mill network across the region.",
    description:
      "Three decades of mill relationships let us specify fabrics with confidence — including custom yarns, finishes and blends developed for your line.",
    bullets: [
      "Performance polyester knits as our core",
      "Custom yarn and finish development",
      "Trim and accessory libraries",
      "Traceable, audited supply chain",
    ],
  },
  {
    number: "04",
    slug: "manufacturing",
    title: "Agile Manufacturing",
    short:
      "Low MOQ. Short lead times. A lean line that responds to your calendar, not the other way around.",
    description:
      "Our manufacturing floor is built for high-mix, low-volume runs so growing brands can launch on instinct without over-committing inventory.",
    bullets: [
      "Low MOQ from sample to bulk",
      "Short, predictable lead times",
      "In-line and end-line QC at every stage",
      "Capacity that flexes with your calendar",
    ],
  },
  {
    number: "05",
    slug: "merchandising",
    title: "Merchandising",
    short:
      "Critical-path planning, costings and order tracking so launches land on time and on margin.",
    description:
      "A dedicated merchandiser owns your timeline end-to-end — from PO to dispatch — keeping every stakeholder honest and informed.",
    bullets: [
      "Critical path with weekly status",
      "Open-cost and target-cost engineering",
      "Order tracking and milestone alerts",
      "Dispatch coordination and documentation",
    ],
  },
];
