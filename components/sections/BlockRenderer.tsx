import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { CmsImage } from "@/components/ui/CmsImage";
import { CapabilitiesRail } from "@/components/sections/CapabilitiesRail";
import { JournalTeaser } from "@/components/sections/JournalTeaser";
import { HeroBackground } from "@/components/sections/HeroBackground";
import { listJournal } from "@/lib/cms";
import type { Block, MediaRef, Cta } from "@/lib/cms/blocks";
import { cn } from "@/lib/utils";
import type { CmsImageValue } from "@/lib/cms/cms-image";

/**
 * BlockRenderer is the only place that knows how a CMS block.type maps to
 * a React rendering. Customer pages call:
 *
 *   {(page?.blocks ?? []).map((block, index) => <BlockRenderer key={index} block={block} />)}
 *
 * — and never touch block-specific markup themselves. Adding a new block
 * type means: a) extend the schema in lib/cms/blocks.ts, b) handle the
 * type in the switch below.
 *
 * Existing section components are reused where they fit; pure CMS-specific
 * shapes (editorial split, gallery, rich text) get inline implementations
 * that follow the brand grammar (numbered eyebrow, italic-extralight verb,
 * stone canvas, hairline rules).
 */

export async function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "hero":
      return <HeroBlock block={block} />;
    case "editorial_split":
      return <EditorialSplitBlock block={block} />;
    case "capabilities":
      return <CapabilitiesRail />;
    case "lookbook_teaser":
      return <LookbookTeaserBlock block={block} />;
    case "journal_grid":
      return <JournalGridBlock limit={block.limit} />;
    case "gallery":
      return <GalleryBlock block={block} />;
    case "cta":
      return <CtaBlock block={block} />;
    case "quote":
      return <QuoteBlock block={block} />;
    case "rich_text":
      return <RichTextBlock body={block.body} />;
    default:
      return null;
  }
}

function CtaPill({ cta, tone = "primary" }: { cta: Cta; tone?: Cta["variant"] }) {
  return (
    <ButtonLink
      href={cta.href}
      variant={cta.variant ?? tone ?? "primary"}
      external={cta.external}
    >
      {cta.label}
    </ButtonLink>
  );
}

function mediaRefToCmsImage(media: MediaRef): CmsImageValue {
  if (!media.src) return "";
  const x = Math.round((media.focal_x ?? 0.5) * 100);
  const y = Math.round((media.focal_y ?? 0.5) * 100);
  if (x === 50 && y === 50) return media.src;
  return { src: media.src, mobileFocus: { x, y } };
}

function MediaImage({
  media,
  className,
  sizes,
  priority,
}: {
  media: MediaRef;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!media.src) return null;
  const cmsValue = mediaRefToCmsImage(media);
  return (
    <CmsImage
      value={cmsValue}
      alt={media.alt ?? ""}
      className={cn("h-full w-full object-cover", className)}
      // sizes/priority only apply to Next Image; kept for API compat
      data-sizes={sizes}
      data-priority={priority ? "true" : undefined}
    />
  );
}

function HeroBlock({ block }: { block: Extract<Block, { type: "hero" }> }) {
  const mediaMode = block.mediaMode ?? "image";
  return (
    <section className="relative h-[100svh] min-h-[640px] overflow-hidden text-stone">
      <HeroBackground
        image={mediaRefToCmsImage(block.image)}
        video={block.video}
        mediaMode={mediaMode}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/65 via-ink/15 to-transparent" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink/35 via-transparent to-ink/75" />
      <div className="shell relative z-10 flex h-full flex-col justify-end pb-14 md:pb-20">
        <div className="space-y-8 max-w-5xl">
          <Eyebrow className="text-stone/85">{block.eyebrow}</Eyebrow>
          <h1 className="text-display leading-[0.92] whitespace-pre-line">{block.headline}</h1>
          {block.sublines.length > 0 && (
            <div className="text-body text-stone/80 max-w-xl space-y-2">
              {block.sublines.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          )}
          {block.ctas.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {block.ctas.map((cta, idx) => (
                <CtaPill key={idx} cta={cta} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function EditorialSplitBlock({
  block,
}: {
  block: Extract<Block, { type: "editorial_split" }>;
}) {
  const reverse = block.align === "right";
  return (
    <section className="relative bg-stone text-ink py-24 md:py-32">
      <div className="shell grid grid-cols-12 gap-6 md:gap-12 items-center">
        <div
          className={cn(
            "col-span-12 md:col-span-6 aspect-[4/5] md:aspect-[5/6] overflow-hidden rounded-3xl border border-[var(--hairline)]",
            reverse ? "md:order-2" : "md:order-1",
          )}
        >
          <MediaImage
            media={block.image}
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div
          className={cn(
            "col-span-12 md:col-span-6 space-y-6",
            reverse ? "md:order-1" : "md:order-2",
          )}
        >
          <Eyebrow>{block.eyebrow}</Eyebrow>
          <h2 className="text-h1 leading-[0.98] whitespace-pre-line">{block.title}</h2>
          <p className="text-body text-ink/80 max-w-xl whitespace-pre-line">{block.body}</p>
          {block.cta && (
            <div>
              <CtaPill cta={block.cta} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function LookbookTeaserBlock({
  block,
}: {
  block: Extract<Block, { type: "lookbook_teaser" }>;
}) {
  return (
    <section className="relative h-[110vh] overflow-hidden bg-ink text-stone">
      <div className="absolute inset-0">
        <MediaImage media={block.image} sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/30 to-ink/40" />
      </div>
      <div className="shell relative z-10 h-full flex flex-col justify-between py-20">
        <Eyebrow className="text-stone/70">{block.eyebrow}</Eyebrow>
        <div className="max-w-3xl space-y-6">
          <h2 className="text-display leading-[0.92] whitespace-pre-line">{block.title}</h2>
          <p className="text-body text-stone/80 max-w-md">{block.body}</p>
          <CtaPill cta={block.cta} tone="ink" />
        </div>
      </div>
    </section>
  );
}

async function JournalGridBlock({ limit }: { limit: number }) {
  const articles = await listJournal();
  return <JournalTeaser articles={articles.slice(0, limit || 4)} />;
}

function GalleryBlock({ block }: { block: Extract<Block, { type: "gallery" }> }) {
  return (
    <section className="relative bg-stone text-ink py-24 md:py-32">
      <div className="shell space-y-8">
        {block.eyebrow && <Eyebrow>{block.eyebrow}</Eyebrow>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {block.images.map((image, index) => (
            <div
              key={index}
              className="aspect-[4/5] overflow-hidden rounded-3xl border border-[var(--hairline)]"
            >
              <MediaImage
                media={image}
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBlock({ block }: { block: Extract<Block, { type: "cta" }> }) {
  return (
    <section className="relative bg-[var(--color-terracotta)] text-stone py-24 md:py-32">
      <div className="shell space-y-6 max-w-3xl">
        <Eyebrow className="text-stone/80">{block.eyebrow}</Eyebrow>
        <h2 className="text-display leading-[0.95] whitespace-pre-line">{block.headline}</h2>
        {block.body && <p className="text-body text-stone/85 max-w-xl">{block.body}</p>}
        <div className="pt-4">
          <CtaPill cta={block.cta} tone="ink" />
        </div>
      </div>
    </section>
  );
}

function QuoteBlock({ block }: { block: Extract<Block, { type: "quote" }> }) {
  return (
    <section className="relative bg-stone text-ink py-24 md:py-32">
      <div className="shell max-w-3xl space-y-6">
        <p className="text-h1 italic font-extralight whitespace-pre-line">“{block.text}”</p>
        <p className="text-eyebrow text-ink/55">— {block.attribution}</p>
      </div>
    </section>
  );
}

function RichTextBlock({ body }: { body: string }) {
  return (
    <section className="relative bg-stone text-ink py-16 md:py-24">
      <div className="shell max-w-3xl prose prose-stone whitespace-pre-wrap text-body text-ink/85">
        {body}
      </div>
    </section>
  );
}

// Re-export so the home page can render an explicit "All entries" link
// without a separate import path.
export { Link };
