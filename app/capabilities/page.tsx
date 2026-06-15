import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { ButtonLink } from "@/components/ui/Button";
import { resolveContactHref } from "@/lib/navigation";
import { GridPattern } from "@/components/ui/GridPattern";
import { CmsImage } from "@/components/ui/CmsImage";
import { capabilities as staticCapabilities } from "@/content/capabilities";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCapabilitiesContent } from "@/lib/cms";
import {
  CAPABILITY_DEFAULT_IMAGES,
  DEFAULT_PROCESS_STEPS,
} from "@/lib/cms/capabilities-schema";

function capabilityBlurb(short: string) {
  const normalized = short.replace(/\s+/g, " ").trim();
  const firstSentence = normalized.split(/(?<=[.!?])\s+/)[0]?.trim() || normalized;
  if (firstSentence.length <= 130) return firstSentence;
  return `${firstSentence.slice(0, 127).trim()}…`;
}

export const metadata = pageMetadata({
  title: "Capabilities",
  description:
    "Design support, textile sourcing, agile manufacturing and merchandising — four disciplines, one studio.",
  path: "/capabilities",
});

export default async function CapabilitiesPage() {
  const cms = await getCapabilitiesContent();

  const displayCaps =
    cms.capabilities.length > 0
      ? cms.capabilities
      : staticCapabilities.map((c, i) => ({
          title: c.title,
          short: c.short,
          description: c.description,
          bullets: c.bullets,
          image: CAPABILITY_DEFAULT_IMAGES[i] ?? "",
        }));

  const displaySteps =
    cms.process.steps.length > 0 ? cms.process.steps : DEFAULT_PROCESS_STEPS;

  return (
    <>
      {/* Intro */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        <GridPattern
          className="absolute inset-0 text-ink opacity-[0.05]"
          density={28}
          disruption
        />
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
            <p className="text-body text-ink/70 max-w-md mt-10">{cms.intro.body}</p>
          </div>
        </div>
      </section>

      {/* Capability detail blocks */}
      {displayCaps.map((cap, i) => (
        <section
          key={i}
          id={staticCapabilities[i]?.slug ?? `cap-${i}`}
          className="relative bg-stone py-4 md:py-6"
        >
          <div className="mx-auto w-full max-w-[min(100%,1720px)] px-2 md:px-3 lg:px-4">
            <article
              className={`grid grid-cols-1 md:grid-cols-2 md:aspect-[12/5] lg:aspect-[14/5] xl:aspect-[3/1] gap-0 overflow-hidden ring-1 ${
                i % 2 === 0
                  ? "bg-ink text-stone ring-stone/10"
                  : "bg-white text-ink ring-ink/10"
              }`}
            >
              <div
                className={`flex min-w-0 flex-col justify-center px-7 py-8 md:px-10 lg:px-12 md:py-0 ${
                  i % 2 === 1 ? "md:order-2" : ""
                }`}
              >
                <p
                  className={`text-eyebrow mb-3 md:mb-4 ${
                    i % 2 === 0 ? "text-stone/55" : "text-ink/55"
                  }`}
                >
                  / {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.65rem,2.2vw,2.35rem)] font-light leading-[1.05] tracking-[-0.02em] max-w-[14ch]">
                  {cap.title}
                </h2>
                <p
                  className={`mt-4 max-w-sm text-body leading-relaxed ${
                    i % 2 === 0 ? "text-stone/75" : "text-ink/70"
                  }`}
                >
                  {capabilityBlurb(cap.short)}
                </p>
              </div>
              <div className={`min-h-[14rem] min-w-0 md:min-h-0 md:h-full ${i % 2 === 1 ? "md:order-1" : ""}`}>
                <div className="h-full overflow-hidden">
                  <CmsImage
                    value={cap.image || CAPABILITY_DEFAULT_IMAGES[i] || ""}
                    alt={cap.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </article>
          </div>
        </section>
      ))}

      {/* Process */}
      <section className="relative bg-[var(--color-graphite-blue)] text-stone py-24 md:py-32 overflow-hidden">
        <GridPattern
          className="absolute inset-0 text-stone opacity-[0.07]"
          density={48}
          disruption
        />
        <div className="shell relative">
          <div className="grid grid-cols-12 gap-6 mb-12">
            <div className="col-span-12 md:col-span-5">
              <Eyebrow number="06" className="text-stone/70">
                {cms.process.eyebrow}
              </Eyebrow>
              <h2 className="text-h1 mt-6">
                {cms.process.headlineLine1}
                <br />
                <span className="italic font-extralight">{cms.process.headlineLine2}</span>
              </h2>
            </div>
            <div className="col-span-12 md:col-span-5 md:col-start-8 self-end">
              <p className="text-body text-stone/75 max-w-md">{cms.process.body}</p>
            </div>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-5 gap-px bg-stone/15">
            {displaySteps.map((step) => (
              <li
                key={step.step}
                className="bg-[var(--color-graphite-blue)] p-6 md:p-7 flex flex-col gap-3 md:min-h-44"
              >
                <span className="text-label text-stone/60">/ {step.step}</span>
                <span className="text-h2">{step.title}</span>
                <span className="text-body text-stone/70">{step.note}</span>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex justify-end">
            <ButtonLink href={resolveContactHref(cms.process.ctaHref)} variant="ink">
              {cms.process.ctaLabel}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
