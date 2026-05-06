import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Sustainability",
  description:
    "Lower MOQ, lean supply chain, considered fibres. The principles that shape how Lineamode manufactures responsibly.",
  path: "/sustainability",
});

const PRINCIPLES = [
  {
    n: "01",
    title: "Make less. Make better.",
    body: "Low MOQ isn't a discount — it's our most direct lever against overproduction. Every short run we accept is inventory a brand doesn't have to write off.",
  },
  {
    n: "02",
    title: "A lean supply chain.",
    body: "Short lead times mean fewer trips, less air freight, less spoilage. Operational discipline is also environmental discipline.",
  },
  {
    n: "03",
    title: "Polyester, considered.",
    body: "Our performance polyester knits are recycled, recyclable and engineered to last. The most responsible fibre is one that survives many seasons.",
  },
  {
    n: "04",
    title: "Traceable inputs.",
    body: "Mills, dye-houses, finishers — every step in the chain is auditable. We document who, what, where and how, by default.",
  },
  {
    n: "05",
    title: "Honest about progress.",
    body: "Certifications matter. We are transparent about what we hold today, what we are pursuing, and what is still ahead.",
  },
];

const CERTIFICATIONS = [
  { code: "GRS", name: "Global Recycled Standard", state: "Pursuing" },
  { code: "OCS", name: "Organic Content Standard", state: "Pursuing" },
  { code: "ISO 9001", name: "Quality Management Systems", state: "Pursuing" },
  { code: "BSCI", name: "Business Social Compliance Initiative", state: "Pursuing" },
];

export default function SustainabilityPage() {
  return (
    <>
      {/* Intro */}
      <section className="relative bg-[var(--color-moss-veil)] text-ink pt-40 pb-32 overflow-hidden">
        <GridPattern
          className="absolute inset-0 text-ink opacity-[0.07]"
          density={32}
          disruption
        />
        <div className="shell relative grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-3">
            <Eyebrow number="00">Sustainability</Eyebrow>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h1 className="text-display leading-[0.95]">
              <span className="block">
                <SplitText by="word" stagger={0.05} duration={1}>
                  Responsible by
                </SplitText>
              </span>
              <span className="block italic font-extralight">
                <SplitText by="word" stagger={0.05} duration={1} delay={0.2}>
                  the way we run.
                </SplitText>
              </span>
            </h1>
            <p className="text-body text-ink/75 max-w-xl mt-10">
              Lineamode treats responsibility as an operating principle, not a
              campaign. Most of the impact in our category is decided long
              before a fibre is spun — in calendar discipline, MOQ structure
              and how a brand plans its year.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="bg-stone py-32 md:py-44">
        <div className="shell">
          <div className="grid grid-cols-12 gap-6 mb-16">
            <div className="col-span-12 md:col-span-4">
              <Eyebrow number="01">Principles</Eyebrow>
              <h2 className="text-h1 mt-6">
                Five working
                <br />
                <span className="italic font-extralight">commitments.</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            {PRINCIPLES.map((p) => (
              <div key={p.n} className="border-t hairline pt-6">
                <div className="flex justify-between text-label text-ink/55 mb-4">
                  <span>/ {p.n}</span>
                  <span>Principle</span>
                </div>
                <p className="text-h2 leading-snug max-w-md">{p.title}</p>
                <p className="text-body text-ink/70 max-w-md mt-4">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications — hidden for now, kept in source for re-use. */}
      {false && (
        <section className="bg-ink text-stone py-32 md:py-44 overflow-hidden">
          <div className="shell">
            <div className="grid grid-cols-12 gap-6 mb-16">
              <div className="col-span-12 md:col-span-5">
                <Eyebrow number="02" className="text-stone/70">
                  Certifications
                </Eyebrow>
                <h2 className="text-h1 mt-6">
                  What we hold,
                  <br />
                  <span className="italic font-extralight">what we're pursuing.</span>
                </h2>
              </div>
              <div className="col-span-12 md:col-span-5 md:col-start-8 self-end">
                <p className="text-body text-stone/75 max-w-md">
                  We are early-stage on certifications and choose to be honest
                  about it. The list below is what we are actively building
                  towards — verified by independent auditors, not assumed.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-stone/15">
              {CERTIFICATIONS.map((c) => (
                <div
                  key={c.code}
                  className="bg-ink p-8 md:p-10 flex flex-col gap-3 min-h-48"
                >
                  <span className="text-label text-stone/55">{c.state}</span>
                  <span className="text-h2">{c.code}</span>
                  <span className="text-body text-stone/70 mt-auto">{c.name}</span>
                </div>
              ))}
            </div>

            <div className="mt-16 flex justify-end">
              <ButtonLink href="/contact" variant="ink">
                Audit our supply chain
              </ButtonLink>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
