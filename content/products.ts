export type ProductCategory = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  highlights: string[];
  hero: string;
  detail: string;
};

export const products: ProductCategory[] = [
  {
    slug: "knitwear",
    title: "Knitwear",
    tagline: "Our flagship discipline",
    description:
      "Engineered knits, jersey programs and structured silhouettes built on three decades of know-how. Our home category and the gravitational centre of the studio.",
    highlights: ["Single, double & rib jerseys", "Pique and interlock", "Engineered jacquards"],
    hero: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=80",
    detail: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "performance-polyester",
    title: "Performance Polyester",
    tagline: "Our specialism",
    description:
      "Recycled, recyclable and engineered polyester knits with moisture management, four-way stretch, and proprietary handfeels developed for active and modern lifestyle wear.",
    highlights: ["Moisture-managed knits", "4-way stretch", "Recycled / recyclable yarns"],
    hero: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
    detail: "https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "soft-wovens",
    title: "Soft Wovens",
    tagline: "Considered weight",
    description:
      "Shirting, light layers and elevated basics in cotton, blends and tencel — finished with the same engineering discipline as our knits.",
    highlights: ["Shirting and overshirts", "Light layers", "Cotton / tencel / blends"],
    hero: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
    detail: "https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "outerwear",
    title: "Outerwear",
    tagline: "Built to last",
    description:
      "Bonded knits, midweight zip-throughs and modern shells for transitional wardrobes. Constructed for movement, finished for the front of the floor.",
    highlights: ["Bonded constructions", "Zip-throughs and shells", "Technical finishings"],
    hero: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1600&q=80",
    detail: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "sweaters",
    title: "Sweaters",
    tagline: "Hand-feel first",
    description:
      "Whole-garment, fully-fashioned and cut-and-sew sweaters across gauges and fibres. Comfort engineered, never overworked.",
    highlights: ["Fully-fashioned", "Whole-garment programs", "3 to 14 gauge"],
    hero: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1600&q=80",
    detail: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1600&q=80",
  },
];
