import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Project-aware Tailwind class merger.
 *
 * Why we extend tailwind-merge:
 * The brand has a small set of *typography* utilities defined in
 * `app/globals.css` — `text-display`, `text-h1`, `text-h2`, `text-h3`,
 * `text-body`, `text-eyebrow`, `text-label`. They share the `text-*`
 * prefix with Tailwind's color and font-size groups, so by default
 * tailwind-merge treats `text-label` and `text-ink` (a brand color) as
 * the same conflict group and silently drops one of them.
 *
 * That's exactly what was happening on `<ButtonLink variant="ink">`:
 * the variant set `text-ink`, the size set `text-label`, the merger
 * dropped `text-ink`, and the button text inherited the section's
 * `text-stone` parent — producing the "text and button are the same
 * colour" bug.
 *
 * By registering these typography utilities as their own group we tell
 * tailwind-merge they don't conflict with colours or font-sizes, so
 * every `text-{token}` survives the merge.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-typography": [
        {
          text: [
            "display",
            "h1",
            "h2",
            "h3",
            "body",
            "eyebrow",
            "label",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
