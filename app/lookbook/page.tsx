import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GridPattern } from "@/components/ui/GridPattern";
import { ButtonLink } from "@/components/ui/Button";
import { lookbook26, type Spread } from "@/content/lookbook";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
    title: "Lookbook '26",
    description:
      "An editorial scroll of the studio's knitwear and performance polyester development for the '26 calendar.",
    path: "/lookbook",
});

export default function LookbookPage() {
  return (
    <article className="bg-stone text-ink">
      {lookbook26.map((s) => (
        <SpreadView key={s.index} spread={s} />
      ))}
    </article>
  );
}

function SpreadView({ spread }: { spread: Spread }) {
  const { variant } = spread;

  if (variant === "cover") return <CoverSpread spread={spread} />;
  if (variant === "wide") return <WideSpread spread={spread} />;
  if (variant === "diptych") return <DiptychSpread spread={spread} />;
  if (variant === "type") return <TypeSpread spread={spread} />;
  if (variant === "end") return <EndSpread spread={spread} />;
  return <SideSpread spread={spread} />;
}

function CoverSpread({ spread }: { spread: Spread }) {
  return (
    <section className="relative min-h-[100svh] flex flex-col justify-between bg-ink text-stone py-24 overflow-hidden">
      <GridPattern
        density={32}
        disruption
        className="absolute inset-0 text-stone opacity-[0.08]"
      />
      <div className="shell relative flex justify-between items-start text-label text-stone/70">
        <span>Lineamode Apparel</span>
        <span>Lookbook · 2026</span>
      </div>
      <div className="shell relative">
        <p className="text-eyebrow text-stone/60 mb-8">{spread.caption}</p>
        <h1 className="text-display leading-[0.9]">
          {spread.title?.split(" ").slice(0, -1).join(" ")}
          <br />
          <span className="italic font-extralight">
            '{spread.title?.split(" ").slice(-1)}
          </span>
        </h1>
      </div>
      <div className="shell relative flex justify-between items-end text-label text-stone/70">
        <span>www.lineamode.com</span>
        <span>From Idea to Execution</span>
      </div>
    </section>
  );
}

function WideSpread({ spread }: { spread: Spread }) {
  return (
    <section className="relative bg-stone">
      <div className="px-[var(--shell-pad-x)] py-12">
        <div className="aspect-[16/9] overflow-hidden ring-1 ring-ink/10">
          {spread.images?.[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={spread.images[0]}
              alt={spread.caption ?? ""}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        {spread.caption && (
          <p className="text-label text-ink/55 mt-4 flex justify-between">
            <span>{spread.caption}</span>
            <span>/ {spread.index}</span>
          </p>
        )}
      </div>
    </section>
  );
}

function DiptychSpread({ spread }: { spread: Spread }) {
  return (
    <section className="relative bg-stone">
      <div className="px-[var(--shell-pad-x)] py-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        {spread.images?.map((src, i) => (
          <div
            key={i}
            className={`overflow-hidden ring-1 ring-ink/10 ${i === 0 ? "aspect-[3/4]" : "aspect-[4/5] md:translate-y-12"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      {spread.caption && (
        <p className="px-[var(--shell-pad-x)] pb-12 text-label text-ink/55 flex justify-between">
          <span>{spread.caption}</span>
          <span>/ {spread.index}</span>
        </p>
      )}
    </section>
  );
}

function SideSpread({ spread }: { spread: Spread }) {
  const isLeft = spread.variant === "image-left";
  return (
    <section className="relative bg-stone py-24 md:py-32">
      <div className="shell grid grid-cols-12 gap-6 md:gap-12 items-center">
        <div
          className={`col-span-12 md:col-span-7 ${isLeft ? "md:order-1" : "md:order-2"}`}
        >
          {spread.images?.[0] && (
            <div className="aspect-[4/5] overflow-hidden ring-1 ring-ink/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={spread.images[0]}
                alt={spread.title ?? ""}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        <div
          className={`col-span-12 md:col-span-4 ${isLeft ? "md:order-2 md:col-start-9" : "md:order-1"}`}
        >
          <p className="text-label text-ink/50 mb-4">/ {spread.index}</p>
          {spread.title && (
            <h2 className="text-h1 leading-tight">{spread.title}</h2>
          )}
          {spread.body && (
            <p className="text-body text-ink/75 max-w-md mt-6">{spread.body}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function TypeSpread({ spread }: { spread: Spread }) {
  return (
    <section className="relative min-h-[80vh] bg-[var(--color-ash-linen)] flex flex-col justify-center py-32 overflow-hidden">
      <GridPattern
        density={36}
        disruption
        className="absolute inset-0 text-ink opacity-[0.08]"
      />
      <div className="shell relative">
        <p className="text-label text-ink/50 mb-10">/ {spread.index}</p>
        {spread.title && (
          <h2 className="text-display leading-[0.92]">
            {spread.title.split(",").map((part, i) => (
              <span key={i} className="block">
                {i === 1 ? (
                  <span className="italic font-extralight">{part.trim()}</span>
                ) : (
                  part.trim()
                )}
                {i < (spread.title?.split(",").length ?? 0) - 1 && ","}
              </span>
            ))}
          </h2>
        )}
        {spread.body && (
          <p className="text-h3 max-w-2xl text-ink/75 mt-12">{spread.body}</p>
        )}
      </div>
    </section>
  );
}

function EndSpread({ spread }: { spread: Spread }) {
  return (
    <section className="relative min-h-[100svh] flex flex-col justify-between bg-ink text-stone py-24 overflow-hidden">
      <GridPattern
        density={32}
        disruption
        className="absolute inset-0 text-stone opacity-[0.08]"
      />
      <div className="shell relative flex justify-between items-start text-label text-stone/70">
        <span>Lineamode Apparel</span>
        <span>Lookbook · 2026</span>
      </div>
      <div className="shell relative text-center">
        <Eyebrow className="justify-center text-stone/60 mb-8">
          From Idea to Execution
        </Eyebrow>
        <h2 className="text-display leading-[0.9]">
          The <span className="italic font-extralight">end.</span>
        </h2>
        <div className="mt-16 flex flex-col md:flex-row gap-3 justify-center">
          <ButtonLink href="/contact" variant="ink">
            Brief the studio
          </ButtonLink>
          <Link
            href="/journal"
            className="text-label inline-flex items-center gap-2 self-center"
          >
            Read the Journal →
          </Link>
        </div>
      </div>
      <div className="shell relative flex justify-between items-end text-label text-stone/70">
        <span>{spread.caption}</span>
        <span>/ {spread.index}</span>
      </div>
    </section>
  );
}
