import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { GridPattern } from "@/components/ui/GridPattern";
import { pageMetadata } from "@/lib/seo/metadata";
import { getAboutContent } from "@/lib/cms";
import { ABOUT_CONTENT_DEFAULTS } from "@/lib/cms/about-schema";
import { ManifestoBrandLogos } from "@/components/about/ManifestoBrandLogos";
import { AboutFounderPreviewCard } from "@/components/about/AboutFounderPreviewCard";
import { AboutGlobe } from "@/components/about/AboutGlobe";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Lineamode Apparel was established to help brands address quality, lead-time and coordination problems with end-to-end design-to-production solutions.",
  path: "/about",
});

export default async function AboutPage() {
  const cms = await getAboutContent();
  const founderCards = cms.foundersCta.cards.length
    ? cms.foundersCta.cards
    : ABOUT_CONTENT_DEFAULTS.foundersCta.cards;
  const foundersHeadlineLine1 = cms.foundersCta.headlineLine1
    .toLowerCase()
    .includes("four founders")
    ? "Three Founders."
    : cms.foundersCta.headlineLine1;
  const foundersHeadlineLine2 =
    cms.foundersCta.headlineLine2.toLowerCase() === "one studio."
      ? "One Studio."
      : cms.foundersCta.headlineLine2;
  const manifestoNumber = cms.manifesto.sectionLabel.match(/^(\d+)/)?.[1] ?? "01";
  const manifestoTitle =
    cms.manifesto.sectionLabel.replace(/^\d+\s*/, "") || "Manifesto";

  return (
    <>
      {/* Intro */}
      <section className="relative bg-[var(--color-ash-linen)] text-ink pt-32 pb-20 md:pt-36 md:pb-24 overflow-hidden">
        <GridPattern className="absolute inset-0 text-ink opacity-[0.07]" density={28} disruption />
        <div className="shell relative grid grid-cols-12 gap-4 md:gap-5 items-end">
          <div className="col-span-12 md:col-span-3">
            <Eyebrow number="00">{cms.intro.eyebrow}</Eyebrow>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h1 className="text-about-intro-headline">
              <span className="block">
                <SplitText by="word" stagger={0.05} duration={1}>
                  {cms.intro.headlineLine1}
                </SplitText>
              </span>
              <span className="block italic font-extralight">
                <SplitText by="word" stagger={0.05} duration={1} delay={0.2}>
                  {cms.intro.headlineLine2}
                </SplitText>
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="relative pt-20 pb-28 md:pt-24 md:pb-36">
        <div className="shell grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 md:col-span-3 order-1">
            <Eyebrow number={manifestoNumber} className="text-ink/70">
              {manifestoTitle}
            </Eyebrow>
            <ManifestoBrandLogos logos={cms.manifesto.brandLogos} />
          </div>
          <div className="col-span-12 md:col-span-9 order-2 w-full min-w-0">
            <div className="md:text-right">
              <p className="text-about-manifesto-headline mb-10 mt-4 md:mt-0">
                {cms.manifesto.headlineLine1}{" "}
                <span className="italic font-extralight">{cms.manifesto.headlineItalic}</span>
              </p>
              <p className="text-body text-ink/80 max-w-2xl mb-12 md:ml-auto">
                {cms.manifesto.subheadline}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-body text-ink/75 max-w-3xl md:ml-auto text-justify">
              {cms.manifesto.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="relative bg-[var(--color-graphite-blue)] text-stone overflow-hidden">
        <GridPattern className="absolute inset-0 text-stone opacity-[0.07]" density={48} disruption />
        <div
          aria-hidden
          className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-stone/10 blur-3xl"
        />
        <div className="shell relative py-24 md:py-32">
          <div className="grid grid-cols-12 gap-6 md:gap-10 items-end border-b border-stone/20 pb-10 md:pb-12">
            <div className="col-span-12 md:col-span-5">
              <Eyebrow number="03" className="text-stone/70">
                {cms.foundersCta.eyebrow}
              </Eyebrow>
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

          <div className="mt-12 md:mt-14 flex justify-center">
            <div className="flex w-full max-w-[980px] justify-start gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:justify-center md:overflow-visible md:pb-0 md:snap-none">
              {founderCards.map((founder) => (
                <AboutFounderPreviewCard key={founder.name} founder={founder} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HQ */}
      <section className="relative bg-[var(--color-chalk-sand)] py-24 md:py-32">
        <div className="shell grid grid-cols-12 gap-8 md:gap-10 items-start md:items-center">
          <div className="col-span-12 md:col-span-5">
            <Eyebrow number="04">{cms.hq.eyebrow}</Eyebrow>
            <h2 className="text-h1 mt-6">
              {cms.hq.headlineLine1}{" "}
              <span className="italic font-extralight">{cms.hq.headlineLine2}</span>
            </h2>
            <p className="text-body text-ink/75 max-w-md mt-6">{cms.hq.body}</p>
            <address className="not-italic text-body text-ink/85 mt-8 leading-relaxed whitespace-pre-line">
              {cms.hq.address}
            </address>
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7 w-full">
            <AboutGlobe />
          </div>
        </div>
      </section>
    </>
  );
}
