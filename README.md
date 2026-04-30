# Lineamode Apparel — Website

Editorial-grade marketing site for Lineamode Apparel. Built with Next.js 16
(App Router), Tailwind CSS v4, Motion (Framer Motion), GSAP and Lenis.

## Brand reference

The visual system follows the Lineamode brand deck under `docs/`:

- Canvas: Stone Veil `#E1E1DC`. Text: Carbon Ink `#201C1D`.
- Accents: Terracotta, Chalk Sand, Ash Linen, Moss Veil, Graphite Blue.
- Type: Manrope (UI), Fraunces as a Larken substitute (display), Inter as a
  Neue Haas Grotesk substitute (labels). Replace the substitute fonts in
  `app/layout.tsx` once licensed Larken and Neue Haas Grotesk are available.
- Tagline: "From Idea to Execution".
- Linear Grid pattern with controlled disruption is rendered in
  `components/ui/GridPattern.tsx` and reused as a section divider and hero
  backdrop.

## Stack

| Concern   | Choice                                                       |
| --------- | ------------------------------------------------------------ |
| Framework | Next.js 16 (App Router, RSC, View Transitions API)           |
| Styling   | Tailwind CSS v4, brand tokens in `app/globals.css`           |
| Motion    | Motion (Framer Motion) + GSAP/ScrollTrigger + Lenis          |
| Fonts     | `next/font` self-hosting Manrope, Fraunces, Inter            |
| Forms     | Resend + Zod-validated server actions                        |
| Content   | Typed modules under `content/` behind `lib/cms` adapter      |

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

The dev server listens on http://localhost:3000.

> **Note on memory.** Long-running Turbopack dev sessions combined with
> editor file-watching on `node_modules` can balloon memory usage during
> heavy edits. A `.cursorignore` is included to exclude `node_modules`,
> `.next/`, lock files and PDFs from indexing.

## Environment

```ini
RESEND_API_KEY=         # Resend API key (contact form)
CONTACT_EMAIL_TO=saif@lineamode.com
CONTACT_EMAIL_FROM=Lineamode <hello@lineamode.com>
```

When `RESEND_API_KEY` is missing the contact form server action logs the
brief and returns a successful state, so the form UX can be reviewed
without provisioning Resend.

## Project layout

```
app/                Routes (App Router)
  layout.tsx        Fonts, smooth scroll, cursor, grain, header, footer
  page.tsx          Home
  about, capabilities, products, sustainability, lookbook, journal, contact
  api/, sitemap.ts, robots.ts, opengraph-image.tsx
components/
  brand/            Wordmark
  layout/           Header, Footer, GrainOverlay, Cursor, SmoothScroll, PageTransition
  sections/         All page sections
  ui/               Design-system primitives (SplitText, Marquee, GridPattern, …)
content/            Static, typed content (capabilities, products, values, manifesto, lookbook, journal)
lib/
  cms/              Adapter (`local` provider; `sanity` provider stubbed)
  motion/           Eases and Framer variants
  seo/              JSON-LD, page-level metadata helpers
public/brand/       SVG brand mark
docs/               Brand brief and PowerPoint reference (not deployed)
```

## CMS adapter

All dynamic content reads through `lib/cms`. The default backend is `local`,
which serves typed entries from `content/journal/index.ts`. A `sanity`
provider is stubbed out — when a real CMS is added, only `lib/cms/index.ts`
needs to change. No page imports the local provider directly.

## Deploy

This site is designed to deploy on Vercel without further configuration.
The `next/og` opengraph image at `app/opengraph-image.tsx` runs on the edge.

## Imagery

The site currently uses curated stock imagery (see `IMAGE_NOTES.md`). Swap
to brand photography before launch. The `next.config.ts` `remotePatterns`
allow `images.unsplash.com` for development; you may want to remove this in
production.
