import { Suspense } from "react";
import { connection } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/client";
import { ABOUT_CONTENT_DEFAULTS, parseAboutContent } from "@/lib/cms/about-schema";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";

async function AboutPreviewContent() {
  await connection();
  const sb = getServiceRoleClient();
  const [{ data: draftRow }, { data: pubRow }] = await Promise.all([
    sb.from("cms_settings").select("value").eq("key", "about_content_draft").maybeSingle(),
    sb.from("cms_settings").select("value").eq("key", "about_content").maybeSingle(),
  ]);
  const cms = parseAboutContent(draftRow?.value ?? pubRow?.value);
  const founderCards = cms.foundersCta.cards.length
    ? cms.foundersCta.cards
    : ABOUT_CONTENT_DEFAULTS.foundersCta.cards;
  const foundersCtaLabel = cms.foundersCta.cta.label.toLowerCase().includes("meet")
    ? "Learn more about us"
    : cms.foundersCta.cta.label;
  const foundersHeadlineLine1 = cms.foundersCta.headlineLine1
    .toLowerCase()
    .includes("two founders")
    ? "Four Founders."
    : cms.foundersCta.headlineLine1;
  const foundersHeadlineLine2 =
    cms.foundersCta.headlineLine2.toLowerCase() === "one studio."
      ? "One Studio."
      : cms.foundersCta.headlineLine2;

  return (
    <>
      <div style={{ zIndex: 9999 }} className="fixed top-0 left-0 right-0 bg-yellow-400/95 backdrop-blur-sm text-ink text-center py-1.5 text-[11px] tracking-[0.18em] uppercase font-medium pointer-events-none">
        Draft Preview · {draftRow ? "Unsaved draft" : "Published content"}
      </div>
      <div className="pt-9">
        {/* Intro */}
        <section className="relative bg-[var(--color-ash-linen)] text-ink pt-40 pb-32 overflow-hidden">
          <GridPattern className="absolute inset-0 text-ink opacity-[0.07]" density={28} disruption />
          <div className="shell relative grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 md:col-span-3">
              <Eyebrow number="00">{cms.intro.eyebrow}</Eyebrow>
            </div>
            <div className="col-span-12 md:col-span-9">
              <h1 className="text-display leading-[0.95]">
                <span className="block">
                  <SplitText by="word" stagger={0.05} duration={1}>{cms.intro.headlineLine1}</SplitText>
                </span>
                <span className="block italic font-extralight">
                  <SplitText by="word" stagger={0.05} duration={1} delay={0.2}>{cms.intro.headlineLine2}</SplitText>
                </span>
              </h1>
            </div>
          </div>
        </section>

        {/* Manifesto */}
        <section className="relative pt-24 pb-32 md:pt-32 md:pb-44">
          <div className="shell grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-3 order-2 md:order-1 md:pt-1">
              <p className="text-h2 italic font-extralight font-display max-w-md border-l border-ink/30 pl-6 mt-10 md:mt-0">
                "{cms.manifesto.pull}"
              </p>
            </div>
            <div className="col-span-12 md:col-span-9 order-1 md:order-2 w-full min-w-0">
              <p className="text-eyebrow text-ink/55">/ {cms.manifesto.sectionLabel}</p>
              <div className="md:text-right">
                <p className="text-h1 leading-[1.05] mb-10 mt-4 md:mt-0">
                  {cms.manifesto.headlineLine1}{" "}
                  <span className="italic font-extralight">{cms.manifesto.headlineItalic}</span>
                </p>
                <p className="text-body text-ink/80 max-w-2xl mb-12 md:ml-auto">{cms.manifesto.subheadline}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-body text-ink/75 max-w-3xl md:ml-auto md:text-right">
                {cms.manifesto.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          </div>
        </section>

        {/* Founders */}
        <section className="relative bg-[var(--color-graphite-blue)] text-stone overflow-hidden">
          <GridPattern className="absolute inset-0 text-stone opacity-[0.07]" density={48} disruption />
          <div className="shell relative py-24 md:py-32">
            <div className="grid grid-cols-12 gap-6 md:gap-10 items-end border-b border-stone/20 pb-10 md:pb-12">
              <div className="col-span-12 md:col-span-5">
                <Eyebrow number="03" className="text-stone/70">{cms.foundersCta.eyebrow}</Eyebrow>
                <h2 className="mt-6 text-h1 leading-[1.02] md:text-[clamp(2rem,2.5vw,3.5rem)]">
                  <span className="block whitespace-nowrap">{foundersHeadlineLine1}</span>
                  <span className="block whitespace-nowrap italic font-extralight">
                    {foundersHeadlineLine2}
                  </span>
                </h2>
              </div>
              <div className="col-span-12 md:col-span-6 md:col-start-7">
                <p className="text-body text-stone/80 max-w-md md:ml-auto">{cms.foundersCta.body}</p>
              </div>
            </div>

            <div className="relative mt-12 md:mt-14 -mr-[var(--shell-pad-x)]">
              <div className="overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex w-max gap-4 md:gap-5 pr-[var(--shell-pad-x)]">
                  {founderCards.map((founder, index) => (
                    <article
                      key={founder.name}
                      className="group snap-start shrink-0 w-[min(68vw,240px)] sm:w-[260px] md:w-[300px] lg:w-[320px]"
                    >
                      <div className="relative aspect-square overflow-hidden bg-stone/10 ring-1 ring-stone/20 transition-[box-shadow,transform] duration-500 group-hover:-translate-y-1 group-hover:ring-stone/35 group-hover:shadow-[0_24px_60px_-40px_rgba(0,0,0,0.65)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={founder.portrait}
                          alt={founder.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/45 to-transparent px-4 pb-4 pt-16 md:px-5 md:pb-5 md:pt-20">
                          <p className="text-eyebrow text-stone/50 mb-2">
                            / {String(index + 1).padStart(2, "0")}
                          </p>
                          <h3 className="font-[family-name:var(--font-display)] text-[clamp(1.2rem,1.5vw,1.65rem)] font-light leading-[1.05] tracking-[-0.02em]">
                            {founder.name}
                          </h3>
                          <p className="mt-2 font-[family-name:var(--font-display)] text-[clamp(0.82rem,0.95vw,0.95rem)] font-extralight italic leading-snug text-stone/85 line-clamp-2">
                            {founder.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 md:mt-14 flex justify-center md:justify-start">
              <ButtonLink href={cms.foundersCta.cta.href} variant="ink">
                {foundersCtaLabel}
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* HQ */}
        <section className="relative bg-[var(--color-chalk-sand)] py-32">
          <div className="shell grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 md:col-span-5">
              <Eyebrow number="04">{cms.hq.eyebrow}</Eyebrow>
              <h2 className="text-h1 mt-6">
                {cms.hq.headlineLine1} <span className="italic font-extralight">{cms.hq.headlineLine2}</span>
              </h2>
              <p className="text-body text-ink/75 max-w-md mt-6">{cms.hq.body}</p>
              <address className="not-italic text-body text-ink/85 mt-8 leading-relaxed whitespace-pre-line">
                {cms.hq.address}
              </address>
            </div>
            <div className="col-span-12 md:col-span-6 md:col-start-7">
              <div className="aspect-[5/4] overflow-hidden ring-1 ring-ink/15 bg-ink/5">
                {cms.hq.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cms.hq.image} alt="Studio building" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-ink/5 flex items-end p-6">
                    <p className="text-label text-ink/40">No image set</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default function AboutPreviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-stone"><p className="text-label text-ink/55">Loading preview…</p></div>}>
      <AboutPreviewContent />
    </Suspense>
  );
}
