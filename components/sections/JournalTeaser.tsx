"use client";

import Image from "next/image";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { journalEntries } from "@/content/journal";

const featuredEntries = journalEntries.slice(0, 2);

function JournalPreviewCard({
  entry,
}: {
  entry: (typeof featuredEntries)[number];
}) {
  return (
    <article className="relative w-[min(58vw,27rem)] shrink-0 overflow-hidden rounded-md border border-ink/10 bg-stone shadow-[0_18px_56px_rgba(15,15,15,0.1)]">
      <div className="relative aspect-[5/4] overflow-hidden">
        <Image
          src={entry.cover}
          alt={entry.title}
          fill
          sizes="(max-width: 768px) 58vw, 27rem"
          className="object-cover"
        />
      </div>

      <div className="space-y-2 px-5 py-5">
        <p className="text-label text-ink/50">{entry.category}</p>
        <h3 className="text-h3 font-light leading-snug text-ink/90">
          {entry.title}
        </h3>
      </div>
    </article>
  );
}

export function JournalTeaser() {
  return (
    <section className="relative min-h-[32rem] overflow-hidden bg-stone py-28 md:min-h-[40rem] md:py-44">
      {/* Mobile layout: blur the cards behind the centered heading + CTA */}
      <div className="relative z-10 mx-auto max-w-2xl text-center md:hidden px-5">
        <Eyebrow number="05">Journal</Eyebrow>
        <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.05rem,6vw,2.75rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink/90">
          Stay up to date with the latest news
          <span className="block italic font-extralight">
            and trends for global fashion and textile
          </span>
        </h2>
        <p className="text-body text-ink/70 mt-6">
          Field notes on materials, manufacturing, and the wider industry — written for
          brands that want context without the noise.
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/journal" variant="ink" size="sm">
            Read the journal
          </ButtonLink>
        </div>
      </div>
      <div className="absolute inset-0 z-[1] md:hidden">
        <div className="absolute inset-0 scale-[1.08] blur-xl opacity-80">
          <div className="flex h-full w-full items-center justify-center gap-4 px-4">
            <JournalPreviewCard entry={featuredEntries[0]} />
            <JournalPreviewCard entry={featuredEntries[1]} />
          </div>
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-stone via-stone/80 to-stone"
        />
      </div>

      {/* Desktop / tablet layout (unchanged) */}
      <div className="hidden md:block">
        <div className="shell relative z-10">
          <div className="grid grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="col-span-12 md:col-span-6 lg:col-span-5 max-w-xl">
              <Eyebrow number="05">Journal</Eyebrow>
              <h2 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(2.15rem,3.6vw,3.75rem)] font-light leading-[1.04] tracking-[-0.02em] text-ink/88">
                <span className="block">Stay up to date with the latest news</span>
                <span className="block italic font-extralight">
                  and trends for global fashion and textile
                </span>
              </h2>
              <p className="text-body text-ink/65 max-w-lg mt-8">
                Field notes on materials, manufacturing, and the wider industry —
                written for brands that want context without the noise.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute inset-y-0 left-[26%] right-0 z-[2] flex items-center justify-end">
          <div className="flex translate-x-[8%] flex-row items-stretch gap-5 md:translate-x-[10%] md:gap-6">
            <JournalPreviewCard entry={featuredEntries[0]} />
            <JournalPreviewCard entry={featuredEntries[1]} />
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[26%] right-0 z-[4] backdrop-blur-[1px] [mask-image:linear-gradient(to_right,transparent_0%,transparent_16%,rgba(0,0,0,0.12)_30%,rgba(0,0,0,0.42)_52%,black_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[26%] right-0 z-[4] backdrop-blur-sm [mask-image:linear-gradient(to_right,transparent_0%,transparent_20%,rgba(0,0,0,0.18)_36%,rgba(0,0,0,0.62)_58%,black_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[26%] right-0 z-[4] backdrop-blur-lg [mask-image:linear-gradient(to_right,transparent_0%,transparent_24%,rgba(0,0,0,0.1)_40%,rgba(0,0,0,0.45)_62%,black_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[26%] right-0 z-[4] bg-gradient-to-l from-stone/55 via-stone/12 to-transparent [mask-image:linear-gradient(to_right,transparent_0%,transparent_18%,rgba(0,0,0,0.12)_34%,rgba(0,0,0,0.42)_56%,black_100%)]"
        />

        <div className="pointer-events-none absolute inset-y-0 left-[26%] right-0 z-20 flex items-center justify-end pr-6 md:pr-12 lg:pr-16">
          <div className="pointer-events-auto">
            <ButtonLink href="/journal" variant="ink" size="sm">
              Read the journal
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
