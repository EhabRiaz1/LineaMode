/**
 * Lineamode motion primitives.
 * The "brand" easing is a custom cubic-bezier reused everywhere so all motion
 * across the site shares the same vocabulary.
 */

export const easeBrand = [0.22, 1, 0.36, 1] as const;
export const easeBrandIn = [0.7, 0, 0.84, 0] as const;
export const easeStandard = [0.4, 0, 0.2, 1] as const;

export const dur = {
  xs: 0.2,
  s: 0.4,
  m: 0.7,
  l: 1.1,
  xl: 1.6,
} as const;
