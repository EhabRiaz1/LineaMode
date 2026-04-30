import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";
import { capabilities } from "@/content/capabilities";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Capabilities",
  description:
    "Design support, product development, fabric sourcing, agile manufacturing and merchandising — five disciplines, one studio.",
  path: "/capabilities",
});

const PROCESS = [
  { step: "01", title: "Brief", note: "Calendar, target cost, range strategy" },
  { step: "02", title: "Develop", note: "Fabric, pattern, prototype, fit" },
  { step: "03", title: "Approve", note: "PP sample, sealed swatch, sign-off" },
  { step: "04", title: "Produce", note: "Bulk run with in-line and end-line QC" },
  { step: "05", title: "Deliver", note: "Audit, document, ship, account" },
];

export default function CapabilitiesPage() {
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
            <Eyebrow number="00">Capabilities</Eyebrow>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h1 className="text-display leading-[0.95]">
              <span className="block">
                <SplitText by="word" stagger={0.05} duration={1}>
                  Five disciplines.
                </SplitText>
              </span>
              <span className="block italic font-extralight">
                <SplitText by="word" stagger={0.05} duration={1} delay={0.2}>
                  One studio floor.
                </SplitText>
              </span>
            </h1>
            <p className="text-body text-ink/70 max-w-md mt-10">
              Each capability is owned by a senior in-house team — not
              outsourced and not relabelled. The work moves between them
              without changing partner.
            </p>
          </div>
        </div>
      </section>

      {/* Anchor nav */}
      <nav
        aria-label="Capability sections"
        className="sticky top-[60px] z-30 bg-stone/85 backdrop-blur border-y hairline"
      >
        <div className="shell flex gap-8 overflow-x-auto py-4 text-label">
          {capabilities.map((c) => (
            <a
              key={c.slug}
              href={`#${c.slug}`}
              className="whitespace-nowrap text-ink/65 hover:text-ink transition-colors"
            >
              / {c.number} {c.title}
            </a>
          ))}
        </div>
      </nav>

      {/* Capability detail blocks */}
      {capabilities.map((c, i) => (
        <section
          key={c.slug}
          id={c.slug}
          className="relative py-24 md:py-32 border-b hairline"
        >
          <div className="shell grid grid-cols-12 gap-6 md:gap-12 items-start">
            <div
              className={`col-span-12 md:col-span-7 ${i % 2 === 1 ? "md:order-2" : ""}`}
            >
              <div className="aspect-[5/4] overflow-hidden ring-1 ring-ink/15 bg-ink/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://images.unsplash.com/photo-${
                    [
                      "1620799140408-edc6dcb6d633",
                      "1485518882345-15568b007407",
                      "1542060748-10c28b62716f",
                      "1591047139829-d91aecb6caea",
                      "1551028719-00167b16eac5",
                    ][i]
                  }?auto=format&fit=crop&w=1600&q=80`}
                  alt={c.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div
              className={`col-span-12 md:col-span-5 sticky top-32 ${i % 2 === 1 ? "md:order-1" : ""}`}
            >
              <div className="flex justify-between text-label text-ink/55 mb-6">
                <span>/ {c.number}</span>
                <span>Discipline</span>
              </div>
              <h2 className="text-h1 mb-6">{c.title}</h2>
              <p className="text-body text-ink/80 max-w-md mb-4">{c.short}</p>
              <p className="text-body text-ink/65 max-w-md">{c.description}</p>

              <ul className="mt-10 grid grid-cols-1 gap-3 text-body text-ink/80">
                {c.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex gap-3 border-t hairline pt-3 first:border-t-0 first:pt-0"
                  >
                    <span className="text-ink/40">—</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}

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
              <Eyebrow number="06" className="text-stone/70">
                Process
              </Eyebrow>
              <h2 className="text-h1 mt-6">
                One critical path,
                <br />
                <span className="italic font-extralight">five honest steps.</span>
              </h2>
            </div>
            <div className="col-span-12 md:col-span-5 md:col-start-8 self-end">
              <p className="text-body text-stone/75 max-w-md">
                Every project moves on the same five-step rail. Each step has
                an owner, a deliverable and a target date — visible to the
                client at all times.
              </p>
            </div>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-5 gap-px bg-stone/15">
            {PROCESS.map((p) => (
              <li
                key={p.step}
                className="bg-[var(--color-graphite-blue)] p-8 md:p-10 flex flex-col gap-4 min-h-56"
              >
                <span className="text-label text-stone/60">/ {p.step}</span>
                <span className="text-h2">{p.title}</span>
                <span className="text-body text-stone/70 mt-auto">{p.note}</span>
              </li>
            ))}
          </ol>

          <div className="mt-16 flex justify-end">
            <ButtonLink href="/contact" variant="ink">
              Brief the studio
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
