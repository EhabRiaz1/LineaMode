export type HomeProductTile = {
  slug: string;
  title: string;
  caption: string;
  poster: string;
  imageAlt: string;
  accentClass: string;
};

export const homeProducts: HomeProductTile[] = [
  {
    slug: "lifestyle",
    title: "Lifestyle",
    caption: "Everyday silhouettes with considered fabric and finish.",
    poster:
      "https://images.unsplash.com/photo-1751973016610-514b7a4b8091?auto=format&fit=crop&w=2400&q=85",
    imageAlt: "Outdoor editorial portrait showing refined lifestyle fashion.",
    accentClass: "from-terracotta/25 via-stone/10 to-stone/30",
  },
  {
    slug: "athleisure",
    title: "Athleisure",
    caption: "Performance knits and hybrid pieces for movement and wear.",
    poster:
      "https://images.unsplash.com/photo-1763499390126-d431dcb095bc?auto=format&fit=crop&w=2400&q=85",
    imageAlt: "Model wearing a white tank and olive joggers for athleisure styling.",
    accentClass: "from-moss/25 via-stone/10 to-stone/30",
  },
  {
    slug: "sportswear",
    title: "Sportswear",
    caption: "Technical programs built for training, recovery, and competition.",
    poster:
      "https://images.unsplash.com/photo-1724456285504-a023ac479ff8?auto=format&fit=crop&w=2400&q=85",
    imageAlt: "Activewear editorial image with athletic apparel and sneakers.",
    accentClass: "from-graphite/30 via-stone/10 to-stone/30",
  },
];
