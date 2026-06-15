export const PRODUCT_CATEGORIES = [
  { slug: "lifestyle", title: "Lifestyle" },
  { slug: "athleisure", title: "Athleisure" },
  { slug: "sportswear", title: "Sportswear" },
] as const;

export type ProductCategorySlug = (typeof PRODUCT_CATEGORIES)[number]["slug"];

const PRODUCT_CATEGORY_SLUGS = new Set<string>(
  PRODUCT_CATEGORIES.map((category) => category.slug),
);

export function parseProductCategorySlug(
  value: string | null | undefined,
): ProductCategorySlug {
  if (value && PRODUCT_CATEGORY_SLUGS.has(value)) {
    return value as ProductCategorySlug;
  }
  return "lifestyle";
}

export function productsCategoryHref(
  category: ProductCategorySlug,
  basePath = "/products",
): string {
  const path = basePath.split("?")[0] || "/products";
  return `${path}?category=${encodeURIComponent(category)}`;
}

export function productsSubcategoryHref(
  category: ProductCategorySlug,
  subcategorySlug: string,
  basePath = "/products",
): string {
  const path = basePath.split("?")[0] || "/products";
  const params = new URLSearchParams({ category, subcategory: subcategorySlug });
  const hash = subcategorySectionId(category, subcategorySlug);
  return `${path}?${params.toString()}#${hash}`;
}

export function subcategorySectionId(
  category: ProductCategorySlug,
  subcategorySlug: string,
): string {
  return `products-subcategory-${category}-${subcategorySlug}`;
}

export function parseProductSubcategorySlug(
  category: ProductCategorySlug,
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const slugs = new Set(SEED_SUBCATEGORIES[category].map((sub) => sub.slug));
  return slugs.has(value) ? value : null;
}

export type SeedSubcategory = {
  id: string;
  title: string;
  slug: string;
  image?: string;
  sortOrder: number;
};

export const CATEGORY_DESCRIPTIONS: Record<ProductCategorySlug, string> = {
  lifestyle:
    "Elevated everyday essentials cut from natural, considered fabrics for an easy, refined wardrobe.",
  athleisure:
    "Versatile, comfort-first pieces engineered to move with you from the studio to the street.",
  sportswear:
    "High-performance kit built for training, competition and recovery with technical fabrics.",
};

export const SEED_SUBCATEGORIES: Record<ProductCategorySlug, SeedSubcategory[]> = {
  lifestyle: [
    { id: "lifestyle-knitwear", title: "Knitwear", slug: "knitwear", sortOrder: 0 },
    { id: "lifestyle-outerwear", title: "Outerwear", slug: "outerwear", sortOrder: 1 },
    { id: "lifestyle-tailoring", title: "Tailoring", slug: "tailoring", sortOrder: 2 },
    { id: "lifestyle-accessories", title: "Accessories", slug: "accessories", sortOrder: 3 },
  ],
  athleisure: [
    { id: "athleisure-tops", title: "Tops", slug: "tops", sortOrder: 0 },
    { id: "athleisure-bottoms", title: "Bottoms", slug: "bottoms", sortOrder: 1 },
    { id: "athleisure-layers", title: "Layers", slug: "layers", sortOrder: 2 },
    { id: "athleisure-accessories", title: "Accessories", slug: "accessories", sortOrder: 3 },
  ],
  sportswear: [
    { id: "sportswear-performance", title: "Performance", slug: "performance", sortOrder: 0 },
    { id: "sportswear-compression", title: "Compression", slug: "compression", sortOrder: 1 },
    { id: "sportswear-recovery", title: "Recovery", slug: "recovery", sortOrder: 2 },
    { id: "sportswear-teamwear", title: "Teamwear", slug: "teamwear", sortOrder: 3 },
  ],
};

export type SeedProductCard = {
  id: string;
  category: ProductCategorySlug;
  subcategoryId: string;
  title: string;
  image: string;
  hoverImage: string;
  featured?: boolean;
};

export const PRODUCTS_HERO_IMAGE_DEFAULT =
  "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=2400&q=85";

export const SEED_PRODUCT_CATALOG: SeedProductCard[] = [
  // Lifestyle
  {
    id: "lifestyle-merino-crew",
    category: "lifestyle",
    subcategoryId: "lifestyle-knitwear",
    title: "Merino Crew Neck",
    image:
      "https://images.unsplash.com/photo-1751973016610-514b7a4b8091?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&h=875&q=80",
    featured: true,
  },
  {
    id: "lifestyle-linen-shirt",
    category: "lifestyle",
    subcategoryId: "lifestyle-tailoring",
    title: "Linen Resort Shirt",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb086d8?auto=format&fit=crop&w=1400&h=875&q=80",
  },
  {
    id: "lifestyle-cashmere-polo",
    category: "lifestyle",
    subcategoryId: "lifestyle-knitwear",
    title: "Cashmere Polo",
    image:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb086d8?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&h=875&q=80",
  },
  {
    id: "lifestyle-oxford-shirt",
    category: "lifestyle",
    subcategoryId: "lifestyle-tailoring",
    title: "Oxford Button-Down",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2b?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1400&h=875&q=80",
  },
  {
    id: "lifestyle-chino-trouser",
    category: "lifestyle",
    subcategoryId: "lifestyle-tailoring",
    title: "Stretch Chino Trouser",
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a51?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1400&h=875&q=80",
  },
  {
    id: "lifestyle-quilted-jacket",
    category: "lifestyle",
    subcategoryId: "lifestyle-outerwear",
    title: "Quilted Liner Jacket",
    image:
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&h=875&q=80",
    featured: true,
  },
  // Athleisure
  {
    id: "athleisure-training-short",
    category: "athleisure",
    subcategoryId: "athleisure-bottoms",
    title: "Training Short",
    image:
      "https://images.unsplash.com/photo-1763499390126-d431dcb095bc?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1400&h=875&q=80",
  },
  {
    id: "athleisure-hybrid-jogger",
    category: "athleisure",
    subcategoryId: "athleisure-bottoms",
    title: "Hybrid Jogger",
    image:
      "https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=1400&h=875&q=80",
    featured: true,
  },
  {
    id: "athleisure-seamless-legging",
    category: "athleisure",
    subcategoryId: "athleisure-bottoms",
    title: "Seamless Legging",
    image:
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1518310950930-46c585893871?auto=format&fit=crop&w=1400&h=875&q=80",
  },
  {
    id: "athleisure-zip-hoodie",
    category: "athleisure",
    subcategoryId: "athleisure-layers",
    title: "Zip-Through Hoodie",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1578587018452-892bace9663?auto=format&fit=crop&w=1400&h=875&q=80",
    featured: true,
  },
  {
    id: "athleisure-crop-top",
    category: "athleisure",
    subcategoryId: "athleisure-tops",
    title: "Sculpt Crop Top",
    image:
      "https://images.unsplash.com/photo-1518310950930-46c585893871?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1400&h=875&q=80",
  },
  {
    id: "athleisure-track-pant",
    category: "athleisure",
    subcategoryId: "athleisure-bottoms",
    title: "Tapered Track Pant",
    image:
      "https://images.unsplash.com/photo-1578587018452-892bace9663?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1400&h=875&q=80",
  },
  // Sportswear
  {
    id: "sportswear-compression-top",
    category: "sportswear",
    subcategoryId: "sportswear-compression",
    title: "Compression Top",
    image:
      "https://images.unsplash.com/photo-1724456285504-a023ac479ff8?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1571907637847-4c8ab3255142?auto=format&fit=crop&w=1400&h=875&q=80",
    featured: true,
  },
  {
    id: "sportswear-recovery-hoodie",
    category: "sportswear",
    subcategoryId: "sportswear-recovery",
    title: "Recovery Hoodie",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&h=875&q=80",
  },
  {
    id: "sportswear-performance-tee",
    category: "sportswear",
    subcategoryId: "sportswear-performance",
    title: "Performance Tee",
    image:
      "https://images.unsplash.com/photo-1571907637847-4c8ab3255142?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1400&h=875&q=80",
  },
  {
    id: "sportswear-running-tight",
    category: "sportswear",
    subcategoryId: "sportswear-compression",
    title: "Running Tight",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1517438476312-10d79c077119?auto=format&fit=crop&w=1400&h=875&q=80",
  },
  {
    id: "sportswear-warm-up-jacket",
    category: "sportswear",
    subcategoryId: "sportswear-recovery",
    title: "Warm-Up Jacket",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1517438476312-10d79c077119?auto=format&fit=crop&w=1400&h=875&q=80",
    featured: true,
  },
  {
    id: "sportswear-training-vest",
    category: "sportswear",
    subcategoryId: "sportswear-performance",
    title: "Mesh Training Vest",
    image:
      "https://images.unsplash.com/photo-1517438476312-10d79c077119?auto=format&fit=crop&w=1400&h=875&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1724456285504-a023ac479ff8?auto=format&fit=crop&w=1400&h=875&q=80",
  },
];
