import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Project-aware Tailwind class merger.
 *
 * Why we extend tailwind-merge:
 * The brand has a small set of *typography* utilities defined in
 * `app/globals.css` — `text-display`, `text-h1`, `text-h2`, `text-h3`,
 * `text-body`, `text-eyebrow`, `text-label`. They share the `text-*`
 * prefix with Tailwind's color group, so by default tailwind-merge
 * silently drops one when both appear on the same element (e.g. the
 * size `text-label` and the variant `text-ink` on a button — the merger
 * keeps only one and the button text inherits the parent colour, which
 * is the "text and button are the same colour" bug).
 *
 * Registering them in the existing `font-size` group is the
 * type-safe fix: our utilities really are font-size definitions (they
 * each set a font-size + line-height pair), and `font-size` is a
 * separate conflict group from `text-color`, so a button can carry
 * `text-label` *and* `text-ink` simultaneously without one dropping the
 * other.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "h1",
            "h2",
            "h3",
            "body",
            "eyebrow",
            "label",
            "admin-h1",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
