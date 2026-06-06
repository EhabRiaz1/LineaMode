/** Canonical contact page for site CTAs. */
export const CONTACT_PAGE_HREF = "/contact";

/** @deprecated Prefer CONTACT_PAGE_HREF — kept for existing imports. */
export const CONTACT_FORM_HREF = CONTACT_PAGE_HREF;

export const CONTACT_CTA_ID = "contact-cta";

const LEGACY_CONTACT_HREFS = new Set([
  "/#contact-cta",
  "#contact-cta",
  "/#contact-cta/",
]);

/** Map legacy homepage contact anchors to the contact page. */
export function resolveContactHref(href?: string | null): string {
  if (!href) return CONTACT_PAGE_HREF;
  const normalized = href.trim();
  if (LEGACY_CONTACT_HREFS.has(normalized) || normalized.includes("contact-cta")) {
    return CONTACT_PAGE_HREF;
  }
  return normalized;
}

/** Header offset (px) when scrolling to anchored sections. */
export const SCROLL_HEADER_OFFSET = 96;

/** Safely extract the first element id from a hash (handles duplicated hashes). */
export function parseHashId(hash: string): string | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return null;
  return raw.split("#")[0] || null;
}

/** Scroll offset for a hash target; contact CTA is flush to the viewport top. */
export function getScrollOffsetForHashId(id: string): number {
  if (id === CONTACT_CTA_ID) return 0;
  return SCROLL_HEADER_OFFSET;
}
