import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";
import { pageMetadata } from "@/lib/seo/metadata";
import { getAboutContent } from "@/lib/cms";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Lineamode Apparel was established to help brands address quality, lead-time and coordination problems with end-to-end design-to-production solutions.",
  path: "/about",
});

export default async function AboutPage() {
  const cms = await getAboutContent();

  return (
    <>
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
              <p className="text-body text-ink/80 max-w-2xl mb-12 md:ml-auto">
                {cms.manifesto.subheadline}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-body text-ink/75 max-w-3xl md:ml-auto md:text-right">
              {cms.manifesto.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founders CTA */}
      <section className="relative bg-[var(--color-graphite-blue)] text-stone overflow-hidden min-h-[70vh] flex items-center">
        <GridPattern className="absolute inset-0 text-stone opacity-[0.07]" density={48} disruption />
        <div
          aria-hidden
          className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-stone/10 blur-3xl"
        />
        <div className="shell relative grid grid-cols-12 gap-6 md:gap-12 items-center py-24 md:py-32 w-full">
          <div className="col-span-12 md:col-span-5">
            <div className="aspect-[4/5] overflow-hidden ring-1 ring-stone/15 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cms.foundersCta.image}
                alt="The founders of Lineamode Apparel"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7">
            <Eyebrow number="03" className="text-stone/70">
              {cms.foundersCta.eyebrow}
            </Eyebrow>
            <h2 className="text-display leading-[0.95] mt-6">
              {cms.foundersCta.headlineLine1}
              <br />
              <span className="italic font-extralight">{cms.foundersCta.headlineLine2}</span>
            </h2>
            <p className="text-body text-stone/80 max-w-md mt-8">{cms.foundersCta.body}</p>
            <div className="mt-10">
              <ButtonLink href={cms.foundersCta.cta.href} variant="ink">
                {cms.foundersCta.cta.label}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* HQ */}
      <section className="relative bg-[var(--color-chalk-sand)] py-32">
        <div className="shell grid grid-cols-12 gap-6 items-end">
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
          <div className="col-span-12 md:col-span-6 md:col-start-7">
            <div className="aspect-[5/4] overflow-hidden ring-1 ring-ink/15 bg-ink/5">
              {cms.hq.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cms.hq.image}
                  alt="Studio building exterior"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-ink/8 flex items-end p-6">
                  <p className="text-label text-ink/40">No image set</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
