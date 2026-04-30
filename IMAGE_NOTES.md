# Image Notes

The site is designed around brand-toned photography. Until that exists, all
image slots are filled with curated stock imagery served via Unsplash.

## What needs to be swapped before launch

| Surface                        | Slot                                | Replace with                          |
| ------------------------------ | ----------------------------------- | ------------------------------------- |
| Home / Hero                    | Full-bleed editorial frame (currently a cream-blazer / red-rose editorial portrait — picked because it sits exactly on the brand palette of Chalk Sand + Carbon Ink + Terracotta) | Lineamode FW '26 hero key visual |
| Home / Products                | Five category hero + detail images  | Studio-shot lookbook of each category |
| Home / LookbookTeaser          | Full-bleed editorial               | FW '26 lookbook key visual            |
| Lookbook                       | All spreads (cover, wide, diptych) | Lookbook '26 final layout assets      |
| About / Founder                | Founder portrait                    | Saif Ahmed studio portrait            |
| About / HQ                     | Studio building                     | NESPAK House exterior / studio interior |
| Capabilities                   | Five discipline images              | Process photography                   |
| Products                       | Hero + hover detail per category    | Garment + fabric macro per category   |
| Journal                        | Cover for every entry               | Editorial cover per article           |

## Conventions

- All imagery is clipped with a 1px Carbon-Ink hairline (`ring-1 ring-ink/15`).
- Aspect ratios are encoded per slot — match them on swap.
- Tone all photography to the Stone Veil canvas: warm-grey, low contrast,
  soft highlights. Avoid pure white or saturated colour casts.

## Sources today

All imagery currently links to `images.unsplash.com`. The site's
`next.config.ts` allows that hostname only for development. When real
imagery lands, place files under `public/images/` and migrate the
references in:

- `content/products.ts`
- `content/lookbook.ts`
- `content/journal/index.ts`
- `components/sections/Hero.tsx`
- `components/sections/LookbookTeaser.tsx`
- `app/about/page.tsx`
- `app/capabilities/page.tsx`
