import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(filename) {
  try {
    const raw = readFileSync(join(root, filename), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional when env is already exported
  }
}

function loadEnv() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const SEED_SUBCATEGORIES = {
  lifestyle: [
    { id: "lifestyle-knitwear", title: "Knitwear", slug: "knitwear", sortOrder: 0, image: "" },
    { id: "lifestyle-outerwear", title: "Outerwear", slug: "outerwear", sortOrder: 1, image: "" },
    { id: "lifestyle-tailoring", title: "Tailoring", slug: "tailoring", sortOrder: 2, image: "" },
    { id: "lifestyle-accessories", title: "Accessories", slug: "accessories", sortOrder: 3, image: "" },
  ],
  athleisure: [
    { id: "athleisure-tops", title: "Tops", slug: "tops", sortOrder: 0, image: "" },
    { id: "athleisure-bottoms", title: "Bottoms", slug: "bottoms", sortOrder: 1, image: "" },
    { id: "athleisure-layers", title: "Layers", slug: "layers", sortOrder: 2, image: "" },
    { id: "athleisure-accessories", title: "Accessories", slug: "accessories", sortOrder: 3, image: "" },
  ],
  sportswear: [
    { id: "sportswear-performance", title: "Performance", slug: "performance", sortOrder: 0, image: "" },
    { id: "sportswear-compression", title: "Compression", slug: "compression", sortOrder: 1, image: "" },
    { id: "sportswear-recovery", title: "Recovery", slug: "recovery", sortOrder: 2, image: "" },
    { id: "sportswear-teamwear", title: "Teamwear", slug: "teamwear", sortOrder: 3, image: "" },
  ],
};

const SEED_SUBCATEGORY_BY_PRODUCT_ID = new Map([
  ["lifestyle-merino-crew", "lifestyle-knitwear"],
  ["lifestyle-linen-shirt", "lifestyle-tailoring"],
  ["lifestyle-cashmere-polo", "lifestyle-knitwear"],
  ["lifestyle-oxford-shirt", "lifestyle-tailoring"],
  ["lifestyle-chino-trouser", "lifestyle-tailoring"],
  ["lifestyle-quilted-jacket", "lifestyle-outerwear"],
  ["athleisure-training-short", "athleisure-bottoms"],
  ["athleisure-hybrid-jogger", "athleisure-bottoms"],
  ["athleisure-seamless-legging", "athleisure-bottoms"],
  ["athleisure-zip-hoodie", "athleisure-layers"],
  ["athleisure-crop-top", "athleisure-tops"],
  ["athleisure-track-pant", "athleisure-bottoms"],
  ["sportswear-compression-top", "sportswear-compression"],
  ["sportswear-recovery-hoodie", "sportswear-recovery"],
  ["sportswear-performance-tee", "sportswear-performance"],
  ["sportswear-running-tight", "sportswear-compression"],
  ["sportswear-warm-up-jacket", "sportswear-recovery"],
  ["sportswear-training-vest", "sportswear-performance"],
]);

function inferSubcategoryId(product) {
  if (product.subcategoryId) return product.subcategoryId;
  const fromSeed = SEED_SUBCATEGORY_BY_PRODUCT_ID.get(product.id);
  if (fromSeed) return fromSeed;

  const title = (product.title || "").toLowerCase();
  const id = (product.id || "").toLowerCase();
  const category = product.category;

  const rules = {
    lifestyle: [
      { match: /jacket|outer|quilted|coat/, subcategoryId: "lifestyle-outerwear" },
      { match: /knit|merino|cashmere|crew|polo|sweater/, subcategoryId: "lifestyle-knitwear" },
      { match: /shirt|chino|trouser|linen|oxford|tailor/, subcategoryId: "lifestyle-tailoring" },
      { match: /accessor|bag|belt|scarf/, subcategoryId: "lifestyle-accessories" },
    ],
    athleisure: [
      { match: /hoodie|layer|zip/, subcategoryId: "athleisure-layers" },
      { match: /top|crop|tank|tee/, subcategoryId: "athleisure-tops" },
      { match: /jogger|short|legging|pant|bottom/, subcategoryId: "athleisure-bottoms" },
      { match: /accessor/, subcategoryId: "athleisure-accessories" },
    ],
    sportswear: [
      { match: /compress|tight/, subcategoryId: "sportswear-compression" },
      { match: /recover|warm-up|hoodie/, subcategoryId: "sportswear-recovery" },
      { match: /team/, subcategoryId: "sportswear-teamwear" },
      { match: /performance|training|tee|vest/, subcategoryId: "sportswear-performance" },
    ],
  };

  for (const rule of rules[category] || []) {
    if (rule.match.test(title) || rule.match.test(id)) return rule.subcategoryId;
  }

  return SEED_SUBCATEGORIES[category]?.[0]?.id ?? "";
}

function backfillContent(content) {
  if (!content || typeof content !== "object") return null;

  const next = structuredClone(content);
  const catalog = Array.isArray(next.catalog) ? next.catalog : [];
  let updated = 0;

  next.catalog = catalog.map((item) => {
    if (!item || typeof item !== "object") return item;
    const subcategoryId = inferSubcategoryId(item);
    if (subcategoryId && item.subcategoryId !== subcategoryId) {
      updated += 1;
      return { ...item, subcategoryId };
    }
    if (!item.subcategoryId && subcategoryId) {
      updated += 1;
      return { ...item, subcategoryId };
    }
    return item;
  });

  if (!Array.isArray(next.categories) || next.categories.length === 0) {
    next.categories = Object.entries(SEED_SUBCATEGORIES).map(([slug, subcategories]) => ({
      slug,
      image: "",
      hoverImage: "",
      description: "",
      subcategories,
    }));
    updated += 1;
  }

  return { content: next, updated };
}

async function main() {
  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };

  const selectRes = await fetch(
    `${SUPABASE_URL}/rest/v1/cms_settings?select=key,value&key=in.(products_content,products_content_draft)`,
    { headers },
  );

  if (!selectRes.ok) {
    throw new Error(`Failed to read cms_settings: ${selectRes.status} ${await selectRes.text()}`);
  }

  const data = await selectRes.json();
  if (!Array.isArray(data) || data.length === 0) {
    console.log("No products_content rows found in cms_settings — nothing to backfill.");
    return;
  }

  for (const row of data) {
    const result = backfillContent(row.value);
    if (!result) continue;

    const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/cms_settings?on_conflict=key`, {
      method: "POST",
      headers: {
        ...headers,
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        key: row.key,
        value: result.content,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!upsertRes.ok) {
      throw new Error(`Failed to update ${row.key}: ${upsertRes.status} ${await upsertRes.text()}`);
    }

    console.log(`Updated ${row.key}: ${result.updated} assignment(s) applied.`);
  }

  console.log("Backfill complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
