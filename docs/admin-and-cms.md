# Admin & CMS

A one-page tour of the Supabase-native admin console and CMS that powers
this site. Read this first if you're touching anything under
`/admin`, `lib/cms/`, or the customer pages.

## What's where

| Surface | Path | Notes |
| --- | --- | --- |
| Customer site | `app/(everything-but-/admin)` | Server-rendered. Reads CMS through `@/lib/cms`. |
| Admin console | `app/admin/(console)` | Route group: layout wraps `AdminSessionProvider` + `ConsoleShell` (sidebar + topbar). |
| Public APIs | `app/api/public/*` | Intake, intake-events, lookup-email. Rate-limited by IP-hash. |
| Admin APIs | `app/api/admin/*` | Bearer-token auth via `requireAdminUser`. |
| Server actions | `app/admin/(console)/content/_actions.ts` | CMS mutations. Each calls `revalidateTag(tag, 'max')`. |

## Admin console layout

The console replaces the previous single-page dashboard with a route
group:

- `app/admin/(console)/layout.tsx` — auth gate + sidebar/topbar shell.
- `app/admin/(console)/page.tsx` — redirects to `/admin/inbox`.
- `inbox/`, `projects/`, `pipeline/`, `clients/`, `content/`,
  `settings/` — top-level sections.

Marketing chrome (header, footer, smooth scroll, intro loader, custom
cursor) is suppressed on `/admin/*` via small client-side gates so the
console runs without any cinema:

- `components/layout/SiteHeader.tsx`, `IntroLoaderGate.tsx`, `Cursor.tsx`,
  `SmoothScroll.tsx`, `MarketingChromeGate.tsx`.

## CMS — Supabase-native

The CMS is a thin wrapper around Postgres + Next 16 cache primitives.

```
cms_pages          — slug-keyed pages with blocks + draft_blocks (jsonb)
cms_pages_revisions — published-history for rollback
cms_journal        — long-form editorial entries
cms_settings       — key/value pairs (CTA copy, default SEO, etc.)
cms_media          — image library, backed by Supabase Storage `cms-media`
cms_journal/journal entries reference cms_media via cover_media_id.
```

Reads go through `lib/cms/supabase.ts` which uses Next 16's `'use cache'`
+ `cacheTag()` so customer pages always hit the cache:

```ts
async function fetchPagePublished(slug: string) {
  'use cache';
  cacheTag(cmsTags.page(slug));
  // SELECT … from cms_pages where slug = ?
}
```

Server actions in `_actions.ts` invalidate by tag on publish:

```ts
revalidateTag(cmsTags.page(slug), 'max');
```

This is **the** mechanism that makes the customer site editable without
redeploys. `'max'` profile means stale-while-revalidate: customers never
see a loading state, the next request silently picks up the change.

### Preview

Draft mode and the `/api/admin/preview` cookie flow were removed because
they conflicted with `cacheComponents` (every public render was forced
dynamic by `await draftMode()`). A replacement in-admin WYSIWYG preview
lands in Phase 2; for now the editor surface saves the draft and admins
can publish to see the result on the public URL.

### Adding a new block type

1. Add the schema in `lib/cms/blocks.ts` (extend the `block` discriminated
   union and `BLOCK_LABELS`/`BLOCK_KINDS`/`emptyBlock`).
2. Add the rendering branch in `components/sections/BlockRenderer.tsx`.
3. Add the field UI in `components/admin/content/BlockFields.tsx`.

That's it — the admin editor and customer renderer pick up the new type
without any other plumbing.

## /start — The Loom Reel

`/start` is built around three components:

- `components/start/LoomReel.tsx` — the chip-pick over a single ambient
  film loop. Hover scrubs the reel to a bookmarked timestamp, click
  triggers a View Transition into the Letter.
- `components/start/StartFlow.tsx` — the orchestrator. Holds form state,
  branches by pipeline, validates with the unified Zod schema in
  `lib/start/schema.ts`, submits to `/api/public/intake`.
- `components/start/LetterStep.tsx` + `LetterField.tsx` — the
  one-question-per-screen flow. Auto-focus per step; `Enter` advances on
  single-line inputs; `aria-live` for inline errors.

Performance + a11y safeguards:

- `prefers-reduced-motion` and `Network Information API`'s `saveData`
  fall back to the poster only — the `<video>` element is never mounted.
- Chips are `role="radio"` inside a `role="radiogroup"`.
- An IntersectionObserver pauses the reel as soon as it scrolls out of
  view.
- `CSS @view-transition-old/new(root)` rules in `app/globals.css` lock
  the dissolve to the brand easing curve.

Funnel events fire passively from `lib/start/analytics.ts` to
`/api/public/intake-event`:

```
landed → pipeline_chosen → letter_started → letter_step_view →
  letter_step_complete → intake_submitted (or letter_dropoff)
```

Attribution (UTMs, referrer) and device signals are captured in
`lib/start/signals.ts` and attached to the intake payload at submit.

## Operational notes

- **Resend**: `lib/email/resend.ts` is a lazy client; missing
  `RESEND_API_KEY` degrades gracefully (project_emails get marked
  `failed`, request still succeeds). Customer auto-reply +
  admin-notification templates live in `lib/email/templates.ts` and are
  fired from `/api/public/intake/route.ts`.
- **Rate limiting**: `lib/utils/rate-limit.ts` is in-memory token bucket.
  Public APIs key by hashed IP (`lib/utils/ip.ts`), salted via
  `IP_HASH_SALT`.
- **Migrations**: `supabase/migrations/` is the source of truth.
  - `0001` — base pipeline schema.
  - `0002` — intake signals + admin tables (notes, emails) + search view.
  - `0003` — CMS schema.
  - `0004` — idempotent policy fixups (PG <16 compatibility).
  - `0005` — view security_invoker + function search_path hardening.
  - `0006` — storage buckets (`cms-media`, `intake-uploads`).
  - `0007` — drops the broad SELECT on `storage.objects` for `cms-media`
    so the bucket no longer permits listing (advisor lint 0025).
- **Security advisors**: only `auth_leaked_password_protection` remains,
  and that's a one-click toggle in the Supabase dashboard
  (Authentication → Policies → Leaked password protection).
- **cacheComponents**: enabled in `next.config.ts`. Means: any
  un-`'use cache'`-marked async data fetch in a Server Component goes
  dynamic. The CMS provider already wraps everything; if you add a new
  data path, mark it `'use cache'` + `cacheTag(...)` to keep the page
  prerenderable.

## Common edits

| Goal | File(s) |
| --- | --- |
| Reorder /start questions | `lib/start/schema.ts` (`COMMON_OPENING`, etc.) |
| Add a chip-pick option to /start | `lib/start/schema.ts` + `lib/validators/intake.ts` (server) |
| Add a CMS block | `lib/cms/blocks.ts`, `BlockRenderer.tsx`, `BlockFields.tsx` |
| Change auto-reply copy | `lib/email/templates.ts` |
| Add an admin section | `app/admin/(console)/<section>/page.tsx` + `components/admin/Sidebar.tsx` |
| Track a new funnel event | `lib/start/analytics.ts` (event union) + emit at the call site |
