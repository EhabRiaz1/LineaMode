import type { JournalEntry } from "@/lib/cms";

/**
 * Seed entries for the Journal. Real posts live in MDX files under this
 * directory once a writer is added; until then these typed objects keep the
 * design fully populated and let the CMS adapter return real shapes.
 */
export const journalEntries: JournalEntry[] = [
  {
    slug: "knit-the-grain",
    title: "Why we build with the grain",
    category: "Field Notes",
    excerpt:
      "On the discipline of knitting with — not against — the natural behaviour of yarn. A short essay on how grain dictates everything from drape to durability.",
    cover:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1600&q=80",
    date: "March 2026",
    readTime: "5 min read",
    body: `Yarn has memory. The way it was spun, the speed it was knitted, the temperature it was dyed at — every step writes itself into the finished cloth. The studio's job is to read that memory before it reads us.\n\nWhen we sample with the grain — letting the yarn lay where it wants, structuring the silhouette around the way the cloth falls — the garment behaves predictably for the next ten thousand pieces. When we fight it, the first bulk shipment will tell us we were wrong. The hem will roll. The shoulder will rotate. The fabric will whisper, then complain.\n\nThe craft is not in choosing the loudest construction. It is in knowing when to step back.`,
  },
  {
    slug: "low-moq-is-a-design-decision",
    title: "Low MOQ is a design decision, not a discount",
    category: "Studio",
    excerpt:
      "Treat minimum order quantity as a creative constraint and a sustainability lever — not a sales concession. Notes on running lean for emerging brands.",
    cover:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
    date: "February 2026",
    readTime: "7 min read",
    body: `For an emerging label, the difference between a 100-piece run and a 1,000-piece run isn't a price negotiation. It's a question of survival.\n\nLow MOQ isn't a favour we extend; it's a discipline we engineer. It changes which fabrics we hold in stock, how we plan capacity, how we cost development. It rewards brands that prefer to learn fast over those who must commit early. And it shrinks the footprint of overproduction across the industry — quietly, one short run at a time.`,
  },
  {
    slug: "performance-polyester-misunderstood",
    title: "The most misunderstood fibre in the studio",
    category: "Materials",
    excerpt:
      "Performance polyester is rarely understood for what it can be — recycled, recyclable, engineered for hand and movement. A field guide.",
    cover:
      "https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1600&q=80",
    date: "January 2026",
    readTime: "6 min read",
    body: `Polyester gets a flat reputation, mostly earned. But the version that walks into our studio is rarely the version most consumers have in mind. The yarns we knit with are recycled, recyclable, engineered for moisture management and finished to handle a pencil-skirt drape or a hoodie's stretch with equal grace.\n\nThe question isn't "polyester or not?" It's "which polyester, made how, finished to what end?" That's the conversation we like to have.`,
  },
];
