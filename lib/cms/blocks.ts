import { z } from "zod";
import { cmsImageSchema } from "@/lib/cms/cms-image";

/**
 * Source-of-truth schemas for the Supabase-backed CMS. The same Zod schema
 * is consumed by:
 *
 *   - the customer renderer ([components/sections/BlockRenderer.tsx]) to
 *     coerce/validate before rendering,
 *   - the admin editor server actions when saving a draft, and
 *   - the published-page reader to assert the blob in `cms_pages.blocks`
 *     hasn't drifted shape.
 *
 * Keep this file the *only* place block shape is described — adding a field
 * means editing one schema, adding one field to the editor, and one line in
 * the renderer.
 */

const cta = z
  .object({
    label: z.string().min(1).max(80),
    href: z.string().min(1).max(2048),
    variant: z.enum(["primary", "ghost", "ink"]).default("primary"),
    external: z.boolean().optional(),
  })
  .strict();

const mediaRef = z
  .object({
    id: z.string().uuid().optional(),
    src: z.string().max(2048).default(""),
    alt: z.string().max(240).optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    focal_x: z.number().min(0).max(1).optional(),
    focal_y: z.number().min(0).max(1).optional(),
  })
  .strict();

const richText = z.string().max(2000);

export const heroBlock = z
  .object({
    type: z.literal("hero"),
    mediaMode: z.enum(["image", "video"]).default("image"),
    image: mediaRef,
    video: cmsImageSchema.default(""),
    eyebrow: z.string().max(120),
    headline: richText,
    sublines: z.array(z.string().max(280)).max(3).default([]),
    ctas: z.array(cta).max(3).default([]),
  })
  .strict();

export const editorialSplitBlock = z
  .object({
    type: z.literal("editorial_split"),
    image: mediaRef,
    eyebrow: z.string().max(120),
    title: richText,
    body: z.string().max(800),
    cta: cta.optional(),
    align: z.enum(["left", "right"]).default("left"),
  })
  .strict();

export const capabilitiesBlock = z
  .object({
    type: z.literal("capabilities"),
    eyebrow: z.string().max(120).default("What we do"),
    headline: richText.default("One studio, five disciplines."),
    slugs: z.array(z.string().max(60)).max(8).optional(),
  })
  .strict();

export const lookbookTeaserBlock = z
  .object({
    type: z.literal("lookbook_teaser"),
    image: mediaRef,
    eyebrow: z.string().max(120),
    title: richText,
    body: z.string().max(600),
    cta: cta,
  })
  .strict();

export const journalGridBlock = z
  .object({
    type: z.literal("journal_grid"),
    eyebrow: z.string().max(120).default("Journal"),
    headline: richText.default("From the studio."),
    limit: z.number().int().min(1).max(12).default(3),
  })
  .strict();

export const galleryBlock = z
  .object({
    type: z.literal("gallery"),
    eyebrow: z.string().max(120).optional(),
    images: z.array(mediaRef).min(1).max(12),
  })
  .strict();

export const ctaBlock = z
  .object({
    type: z.literal("cta"),
    eyebrow: z.string().max(120),
    headline: richText,
    body: z.string().max(600).optional(),
    cta: cta,
  })
  .strict();

export const quoteBlock = z
  .object({
    type: z.literal("quote"),
    text: z.string().max(800),
    attribution: z.string().max(160),
  })
  .strict();

export const richTextBlock = z
  .object({
    type: z.literal("rich_text"),
    body: z.string().max(8000),
  })
  .strict();

export const block = z.discriminatedUnion("type", [
  heroBlock,
  editorialSplitBlock,
  capabilitiesBlock,
  lookbookTeaserBlock,
  journalGridBlock,
  galleryBlock,
  ctaBlock,
  quoteBlock,
  richTextBlock,
]);

export const blocks = z.array(block).max(40);

export const seoSchema = z
  .object({
    title: z.string().max(120).optional(),
    description: z.string().max(320).optional(),
    canonical: z.string().max(2048).optional(),
  })
  .partial();

export const pageSchema = z.object({
  slug: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  status: z.enum(["draft", "published", "archived"]),
  blocks: blocks,
  seo: seoSchema.optional(),
});

export type Cta = z.infer<typeof cta>;
export type MediaRef = z.infer<typeof mediaRef>;
export type Block = z.infer<typeof block>;
export type Blocks = z.infer<typeof blocks>;
export type Seo = z.infer<typeof seoSchema>;
export type Page = z.infer<typeof pageSchema>;

export const BLOCK_KINDS: Block["type"][] = [
  "hero",
  "editorial_split",
  "capabilities",
  "lookbook_teaser",
  "journal_grid",
  "gallery",
  "cta",
  "quote",
  "rich_text",
];

export const BLOCK_LABELS: Record<Block["type"], string> = {
  hero: "Hero",
  editorial_split: "Editorial split",
  capabilities: "Capabilities",
  lookbook_teaser: "Lookbook teaser",
  journal_grid: "Journal grid",
  gallery: "Gallery",
  cta: "Call to action",
  quote: "Pull quote",
  rich_text: "Rich text",
};

/**
 * Default values used when adding a new block in the editor. All defaults
 * pass `block.parse()` so the editor never lands in an invalid state.
 */
export function emptyBlock(type: Block["type"]): Block {
  switch (type) {
    case "hero":
      return {
        type: "hero",
        mediaMode: "image",
        image: { src: "" },
        video: "",
        eyebrow: "01 / Lineamode",
        headline: "From idea to ship-ready.",
        sublines: [],
        ctas: [],
      };
    case "editorial_split":
      return {
        type: "editorial_split",
        image: { src: "" },
        eyebrow: "Studio note",
        title: "A focused, editorial moment.",
        body: "Write the supporting copy here.",
        align: "left",
      };
    case "capabilities":
      return {
        type: "capabilities",
        eyebrow: "What we do",
        headline: "One studio, five disciplines.",
      };
    case "lookbook_teaser":
      return {
        type: "lookbook_teaser",
        image: { src: "" },
        eyebrow: "Lookbook",
        title: "The studio, in season.",
        body: "Long-form editorial preview.",
        cta: { label: "Open the Lookbook", href: "/lookbook", variant: "ink" },
      };
    case "journal_grid":
      return { type: "journal_grid", eyebrow: "Journal", headline: "From the studio.", limit: 3 };
    case "gallery":
      return { type: "gallery", images: [{ src: "" }] };
    case "cta":
      return {
        type: "cta",
        eyebrow: "Begin",
        headline: "Start a project.",
        cta: { label: "Start a project", href: "/start", variant: "primary" },
      };
    case "quote":
      return { type: "quote", text: "A short, well-cut sentence.", attribution: "Studio" };
    case "rich_text":
      return { type: "rich_text", body: "" };
  }
}
