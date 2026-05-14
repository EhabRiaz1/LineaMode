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
    slug: "lifestyle",
    title: "Lifestyle",
    tagline: "Everyday essentials, refined",
    description:
      "Everyday silhouettes built with considered fabric choices and precise finish. From lightweight jersey basics to elevated casual layers — designed to sit well across any wardrobe and any market.",
    highlights: ["Jersey basics", "Elevated casual layers", "Woven shirting", "Considered finish"],
    hero: "https://images.unsplash.com/photo-1751973016610-514b7a4b8091?auto=format&fit=crop&w=1600&q=80",
    detail: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "athleisure",
    title: "Athleisure",
    tagline: "Where movement meets life",
    description:
      "Performance knits and hybrid constructions engineered for the space between sport and daily wear. Flexible, durable, and finished to look as considered off the track as on it.",
    highlights: ["Performance knits", "Hybrid constructions", "4-way stretch", "Moisture management"],
    hero: "https://images.unsplash.com/photo-1763499390126-d431dcb095bc?auto=format&fit=crop&w=1600&q=80",
    detail: "https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "sportswear",
    title: "Sportswear",
    tagline: "Built for the athlete",
    description:
      "Technical programs engineered for training, recovery, and competition. Moisture management, compression zones, and purpose-built knit structures — uncompromising from first wear.",
    highlights: ["Technical knit structures", "Compression zones", "Recycled performance yarns", "UV & anti-odour finishes"],
    hero: "https://images.unsplash.com/photo-1724456285504-a023ac479ff8?auto=format&fit=crop&w=1600&q=80",
    detail: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1600&q=80",
  },
];
