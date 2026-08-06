/** The live public domain. Every absolute URL we publish resolves here. */
export const SITE_URL = "https://lineamode-apparel.com";

/**
 * Canonical public origin for absolute URLs in metadata (Open Graph, JSON-LD,
 * sitemap, robots).
 *
 * Resolution order:
 * - `NEXT_PUBLIC_SITE_URL` when set — the explicit override.
 * - `SITE_URL` on production deployments. Deliberately *not* `VERCEL_URL`:
 *   that is the per-deployment host (`linea-mode-<hash>.vercel.app`), which
 *   Vercel Deployment Protection puts behind an SSO redirect. Crawlers that
 *   fetch an og:image from it get bounced to a login page and silently drop
 *   the preview — which is exactly how WhatsApp previews broke.
 * - `VERCEL_URL` only for preview/branch deploys, where a per-deployment
 *   host is the correct self-reference.
 * - `SITE_URL` for local dev.
 */
export function getDeploymentSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;

  if (process.env.VERCEL_ENV === "production") return SITE_URL;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }
  return SITE_URL;
}

export const SITE_NAME = "Lineamode Apparel";

export const SITE_TAGLINE = "From Idea to Execution";

export const SITE_DESCRIPTION =
  "Lineamode Apparel is an end-to-end clothing manufacturer with specializations in knitwear garments made of performance polyesters. Design support, product development, and agile manufacturing for global fashion brands.";

export const SITE_OG_DESCRIPTION =
  "End-to-end clothing manufacturer specializing in knitwear and performance polyesters. Design support, prototyping, and agile production for global fashion brands.";

export const SITE_TWITTER_DESCRIPTION =
  "End-to-end clothing manufacturer specializing in knitwear and performance polyesters.";

/** Square wordmark — JSON-LD `logo`, in-page brand, etc. */
export const SQUARE_LOGO_PATH = "/brand/logo-square.png";

/**
 * Flat JPEG for Open Graph / Twitter / WhatsApp (crawlers often handle JPG more reliably than PNG).
 * Same wordmark look as `logo-square.png`, 1200×630.
 */
export const LINK_PREVIEW_IMAGE_PATH = "/brand/og-social.jpg";

export const LINK_PREVIEW_IMAGE_WIDTH = 1200;

export const LINK_PREVIEW_IMAGE_HEIGHT = 630;

export const DEFAULT_OG_IMAGE_ALT = `${SITE_NAME} — ${SITE_TAGLINE}`;
