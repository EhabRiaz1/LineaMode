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
      "We translate your ideas to well-engineered garments. Using best practices and tools for trend forecasting, materials selection, and pattern-fitting, we help ensure we prototype product to help meet your quality and cost requirements.",
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
    slug: "textile-sourcing",
    title: "Textile Sourcing",
    short:
      "Leveraging an elaborate vendor network and many years of experience, we help source all the materials necessary to ensure the best quality and price for the garments you wish to make and sell.",
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
    number: "03",
    slug: "production",
    title: "Production",
    short:
      "We pursue agile manufacturing with low MOQs and specialities in a variety of products. Faster lead times and product variety will help ensure commercial success with lean inventory and speed-to-market.",
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
    number: "04",
    slug: "merchandising",
    title: "Merchandising",
    short:
      "Data-driven strategies and analytics help pursue growth and depth in your product range. We have the ability to provide all the necessary insights to help plan your collections.",
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
