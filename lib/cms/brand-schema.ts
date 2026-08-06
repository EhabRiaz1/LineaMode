/**
 * Site-wide brand tokens: the default SEO copy and footer line that apply to
 * every page. Previously hardcoded constants in lib/seo/site.ts, which meant a
 * code change and a deploy to reword the meta description.
 *
 * Page-specific SEO still comes from each page's own `pageMetadata()` call —
 * these are only the site-wide defaults.
 */

import { z } from "zod";

export const brandTokensSchema = z.object({
  tagline: z
    .string()
    .trim()
    .min(1, "Tagline is required.")
    .max(120)
    .default("From Idea to Execution"),
  metaDescription: z
    .string()
    .trim()
    .min(1, "Meta description is required.")
    .max(320)
    .default(""),
  socialDescription: z.string().trim().max(300).default(""),
  twitterDescription: z.string().trim().max(200).default(""),
  footerTagline: z.string().trim().max(160).default(""),
});

export type BrandTokens = z.infer<typeof brandTokensSchema>;

/** cms_settings key holding the published tokens. */
export const BRAND_TOKENS_SETTING_KEY = "brand_tokens";

/** Shipped copy — the fallback whenever Supabase is unconfigured or the row is absent. */
export const BRAND_TOKENS_DEFAULTS: BrandTokens = {
  tagline: "From Idea to Execution",
  metaDescription:
    "Lineamode Apparel is an end-to-end clothing manufacturer with specializations in knitwear garments made of performance polyesters. Design support, product development, and agile manufacturing for global fashion brands.",
  socialDescription:
    "End-to-end clothing manufacturer specializing in knitwear and performance polyesters. Design support, prototyping, and agile production for global fashion brands.",
  twitterDescription:
    "End-to-end clothing manufacturer specializing in knitwear and performance polyesters.",
  footerTagline: "Design-led apparel manufacturing · Lahore, Pakistan",
};

/** Field metadata driving the admin form, so labels live beside the schema. */
export const BRAND_TOKEN_FIELDS: Array<{
  key: keyof BrandTokens;
  label: string;
  hint: string;
  multiline: boolean;
  max: number;
}> = [
  {
    key: "tagline",
    label: "Tagline",
    hint: "Follows the site name in the browser tab and link previews.",
    multiline: false,
    max: 120,
  },
  {
    key: "metaDescription",
    label: "Default meta description",
    hint: "Used by search engines for any page without its own description. Aim for 150–160 characters.",
    multiline: true,
    max: 320,
  },
  {
    key: "socialDescription",
    label: "Social preview description",
    hint: "Open Graph description — what WhatsApp, Slack and Facebook show under the link.",
    multiline: true,
    max: 300,
  },
  {
    key: "twitterDescription",
    label: "Twitter/X description",
    hint: "Shorter variant for Twitter cards.",
    multiline: true,
    max: 200,
  },
  {
    key: "footerTagline",
    label: "Footer tagline",
    hint: "The line beside the copyright at the bottom of every page.",
    multiline: false,
    max: 160,
  },
];

export function parseBrandTokens(raw: unknown): BrandTokens {
  const result = brandTokensSchema.safeParse(raw);
  if (result.success) {
    // A stored-but-blank optional field should fall back rather than render empty.
    return {
      tagline: result.data.tagline || BRAND_TOKENS_DEFAULTS.tagline,
      metaDescription:
        result.data.metaDescription || BRAND_TOKENS_DEFAULTS.metaDescription,
      socialDescription:
        result.data.socialDescription || BRAND_TOKENS_DEFAULTS.socialDescription,
      twitterDescription:
        result.data.twitterDescription || BRAND_TOKENS_DEFAULTS.twitterDescription,
      footerTagline:
        result.data.footerTagline || BRAND_TOKENS_DEFAULTS.footerTagline,
    };
  }
  return BRAND_TOKENS_DEFAULTS;
}
