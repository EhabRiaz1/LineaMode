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
      "We translate your ideas to well-engineered garments. From concept development to production readiness, our services include trend forecasting, collection planning, design development, tech packs, 3D design, pattern and CAD services, and prototyping to help brands create market-relevant products with confidence.",
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
      "We focus on materials planning for fabrics, trims, and accessories with our elaborate vendor network to ensure quality and cost expectations are aligned – this helps all manufacturing needs are met to deliver product with quick lead times.",
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
      "We specialize in the production of knit and woven apparel, offering agile manufacturing, low MOQ flexibility, and responsive execution to support brands across a wide range of product categories and business stages.",
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
      "We combine analytics, insights, and merchandising expertise to help brands optimize their product range, identify growth opportunities, and build balanced assortments that improve commercial performance and ensure it is aligned with optimised supply chains.",
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
