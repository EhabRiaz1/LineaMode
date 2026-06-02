/** Deep-link to the homepage inline contact form. */
export const CONTACT_FORM_HREF = "/#contact-cta";

export const CONTACT_CTA_ID = "contact-cta";

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
