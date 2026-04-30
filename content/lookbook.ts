/**
 * Lookbook '26 spreads.
 *
 * Each entry is a "spread" — a full-bleed editorial page. The Lookbook page
 * iterates these in order. Imagery is curated stock for now; replace with
 * brand photography when available.
 */
export type Spread = {
  index: string;
  title?: string;
  caption?: string;
  variant: "cover" | "image-left" | "image-right" | "wide" | "diptych" | "type" | "end";
  images?: string[];
  body?: string;
};

export const lookbook26: Spread[] = [
  {
    index: "00",
    variant: "cover",
    title: "Lookbook '26",
    caption: "FW '26 · Performance Knit Edit",
  },
  {
    index: "01",
    variant: "image-right",
    title: "The studio in season",
    body: "An edit of the studio's knitwear and performance polyester development for the '26 calendar — laid out as a long-form editorial.",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    index: "02",
    variant: "wide",
    images: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2400&q=80",
    ],
    caption: "Recycled performance polyester · 4-way stretch development",
  },
  {
    index: "03",
    variant: "diptych",
    images: [
      "https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1400&q=80",
    ],
    caption: "Fabric macro · Whole-garment knit · 12gg",
  },
  {
    index: "04",
    variant: "type",
    title: "From idea, to execution.",
    body: "The phrase repeats because the practice does. Brief. Develop. Sample. Approve. Produce. Ship. Repeat with care.",
  },
  {
    index: "05",
    variant: "image-left",
    title: "Considered weight",
    body: "Soft wovens for transitional layers — finished with the same technical discipline as our knits.",
    images: [
      "https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    index: "06",
    variant: "wide",
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2400&q=80",
    ],
    caption: "Outerwear program · Bonded knit shell",
  },
  {
    index: "07",
    variant: "end",
    title: "The end.",
    caption: "Lookbook '26 · Lineamode Apparel · www.lineamode.com",
  },
];
