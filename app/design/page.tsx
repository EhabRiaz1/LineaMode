import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";
import { capabilities } from "@/content/capabilities";
import { pageMetadata } from "@/lib/seo/metadata";
import { CONTACT_FORM_HREF } from "@/lib/navigation";

export const metadata = pageMetadata({
    title: "Design",
    description:
      "Lineamode's design service — trend forecasting, range planning, sketch development, CAD, tech packs, and brand-aligned material curation. Design with us, or design through us.",
    path: "/design",
});

const SUB_SERVICES = [
  {
    n: "01",
    title: "Trend forecasting",
    body: "Seasonal direction, colour stories and silhouette research mapped to your brand's calendar — translated into briefs your team can actually act on.",
  },
  {
    n: "02",
    title: "Range planning",
    body: "Merchandised line architecture: hero pieces, supporting carries, fabric blocks and price ladder — engineered against your sell-through, not invented in isolation.",
  },
  {
    n: "03",
    title: "Sketch · CAD · tech packs",
    body: "From hand-sketch to CAD to a production-ready tech pack — every detail spec'd, measured and graded so the floor builds what your team approved.",
  },
  {
    n: "04",
    title: "Material curation",
    body: "Brand-aligned fabric, yarn and trim curation drawn from a vetted mill network — including custom finishes and proprietary handfeels developed for your line.",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Brief",
    body: "Brand, calendar, target cost, range strategy. We meet you wherever the work starts — concept, mood-board, or partial pack.",
  },
  {
    step: "02",
    title: "Direction",
    body: "Trend research, colour and material direction, silhouette options. A short, opinionated direction document signed off before we sketch.",
  },
  {
    step: "03",
    title: "Develop",
    body: "Sketch, CAD, fabric and trim resolution. Tech pack iterations until the line is technically correct and commercially right.",
  },
  {
    step: "04",
    title: "Hand-off",
    body: "Production-ready packs, sealed swatches and PP samples handed straight to our development team — no translation lost between studios.",
  },
];

export default function DesignPage() {
  // Pull design-support copy from capabilities for the spine paragraph.
  const designSupport = capabilities.find((c) => c.slug === "design-support");

  return (
    <>
      {/* Intro */}
      <section className="relative bg-[var(--color-moss-veil)] text-ink pt-40 pb-24 overflow-hidden">
        <GridPattern
          className="absolute inset-0 text-ink opacity-[0.07]"
          density={28}
          disruption
        />
        <div className="shell relative grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-3">
            <Eyebrow number="00">Design</Eyebrow>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h1 className="text-display leading-[0.95]">
              <span className="block">
                <SplitText by="word" stagger={0.05} duration={1}>
                  Design the line.
                </SplitText>
              </span>
              <span className="block italic font-extralight">
                <SplitText by="word" stagger={0.05} duration={1} delay={0.2}>
                  Engineer the run.
                </SplitText>
              </span>
            </h1>
            <p className="text-body text-ink/70 max-w-xl mt-10">
              {designSupport?.short ??
                "Design with us, or design through us. We translate your concept into garments engineered to scale."}
            </p>
          </div>
        </div>
      </section>

      {/* Editorial paired-image slab */}
      <section className="relative pt-24 md:pt-32 pb-24">
        <div className="shell grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 md:col-span-7">
            <div className="aspect-[5/4] overflow-hidden ring-1 ring-ink/15 bg-ink/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=80"
                alt="Garment rack — design direction"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="col-span-12 md:col-span-5 flex flex-col gap-6 md:gap-6">
            <div className="aspect-[4/5] overflow-hidden ring-1 ring-ink/15 bg-ink/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1400&q=80"
                alt="Sketches and tech pack development"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sub-services */}
      <section className="relative bg-stone py-32 md:py-44">
        <div className="shell">
          <div className="grid grid-cols-12 gap-6 mb-16">
            <div className="col-span-12 md:col-span-4">
              <Eyebrow number="01">Service</Eyebrow>
              <h2 className="text-h1 mt-6">
                Four threads
                <br />
                <span className="italic font-extralight">running through.</span>
              </h2>
            </div>
            <div className="col-span-12 md:col-span-5 md:col-start-8 self-end">
              <p className="text-body text-ink/70 max-w-md">
                Our design team works alongside yours, or in your stead, to
                develop ranges that are commercially aware and technically
                resolved. The work spans four overlapping disciplines.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            {SUB_SERVICES.map((s) => (
              <div key={s.n} className="border-t hairline pt-6">
                <div className="flex justify-between text-label text-ink/55 mb-4">
                  <span>/ {s.n}</span>
                  <span>Discipline</span>
                </div>
                <p className="text-h2 leading-snug max-w-md">{s.title}</p>
                <p className="text-body text-ink/70 max-w-md mt-4">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="relative bg-[var(--color-graphite-blue)] text-stone py-32 md:py-44 overflow-hidden">
        <GridPattern
          className="absolute inset-0 text-stone opacity-[0.07]"
          density={48}
          disruption
        />
        <div className="shell relative">
          <div className="grid grid-cols-12 gap-6 mb-16">
            <div className="col-span-12 md:col-span-5">
              <Eyebrow number="02" className="text-stone/70">
                How we work
              </Eyebrow>
              <h2 className="text-h1 mt-6">
                Four steps,
                <br />
                <span className="italic font-extralight">brief to hand-off.</span>
              </h2>
            </div>
            <div className="col-span-12 md:col-span-5 md:col-start-8 self-end">
              <p className="text-body text-stone/75 max-w-md">
                Every design engagement moves on the same four-step rail.
                Each step has an owner, a deliverable and a target date —
                visible to the client at all times.
              </p>
            </div>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-4 gap-px bg-stone/15">
            {PROCESS.map((p) => (
              <li
                key={p.step}
                className="bg-[var(--color-graphite-blue)] p-8 md:p-10 flex flex-col gap-4 min-h-56"
              >
                <span className="text-label text-stone/60">/ {p.step}</span>
                <span className="text-h2">{p.title}</span>
                <span className="text-body text-stone/70 mt-auto">{p.body}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative bg-[var(--color-chalk-sand)] py-32 md:py-44">
        <div className="shell grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-7">
            <Eyebrow number="03">Start</Eyebrow>
            <h2 className="text-display leading-[0.95] mt-6">
              Design with us,
              <br />
              <span className="italic font-extralight">or through us.</span>
            </h2>
            <p className="text-body text-ink/75 max-w-md mt-8">
              Bring us a concept, a partial pack, or a brief — we'll meet
              you where the work is and take it to a production-ready line.
            </p>
            <div className="mt-12 flex flex-wrap gap-3">
              <ButtonLink href={CONTACT_FORM_HREF} variant="ink">
                Brief the studio
              </ButtonLink>
              <ButtonLink href="/capabilities" variant="ghost">
                See the full capability stack
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
