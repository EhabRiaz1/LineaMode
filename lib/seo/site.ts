export const SITE_URL = "https://www.lineamode.com";

/**
 * Canonical public origin for absolute URLs in metadata (Open Graph, favicon base, JSON-LD).
 *
 * - Set `NEXT_PUBLIC_SITE_URL` on Vercel (e.g. `https://lineamode.vercel.app` or your custom domain).
 * - If unset, uses `VERCEL_URL` (each Vercel project’s default host) so previews work on *.vercel.app.
 * - Falls back to `SITE_URL` for local dev.
 */
export function getDeploymentSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
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

/** Used for link previews (WhatsApp, iMessage, Slack, etc.) and JSON-LD logo. */
export const SQUARE_LOGO_PATH = "/brand/logo-square.png";

export const DEFAULT_OG_IMAGE_WIDTH = 512;

export const DEFAULT_OG_IMAGE_HEIGHT = 512;

export const DEFAULT_OG_IMAGE_ALT = `${SITE_NAME} — ${SITE_TAGLINE}`;
