import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";
import { FounderCard } from "@/components/sections/FounderCard";
import { founders } from "@/content/founders";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Founders",
  description:
    "Meet the founders of Lineamode Apparel — Saif Ahmed and Wasay Hasan. Three decades of textile know-how directing one studio.",
  path: "/founders",
});

export default function FoundersPage() {
  return (
    <>
      {/* Intro — chalk-sand mirrors the front of the business card. */}
      <section className="relative bg-[var(--color-chalk-sand)] text-ink pt-40 pb-32 overflow-hidden">
        <GridPattern
          className="absolute inset-0 text-ink opacity-[0.07]"
          density={28}
          disruption
        />
        <div className="shell relative grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-3">
            <Eyebrow number="00">Founders</Eyebrow>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h1 className="text-display leading-[0.95]">
              <span className="block">
                <SplitText by="word" stagger={0.05} duration={1}>
                  Two founders.
                </SplitText>
              </span>
              <span className="block italic font-extralight">
                <SplitText by="word" stagger={0.05} duration={1} delay={0.2}>
                  One studio.
                </SplitText>
              </span>
            </h1>
            <p className="text-body text-ink/70 max-w-md mt-10">
              Lineamode is run by two founders with overlapping but
              complementary remits — commercial and operational, strategy and
              floor. Scroll to flip each card and meet them.
            </p>
          </div>
        </div>
      </section>

      {/* Founder cards — alternating layout for rhythm */}
      {founders.map((f, i) => (
        <FounderCard
          key={f.slug}
          founder={f}
          index={i}
          reverse={i % 2 === 1}
        />
      ))}

      {/* Closing CTA */}
      <section className="relative bg-[var(--color-terracotta)] text-stone py-32 md:py-44 overflow-hidden">
        <div className="shell relative grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3">
            <Eyebrow number="03" className="text-stone/80">
              Speak to us
            </Eyebrow>
          </div>
          <div className="col-span-12 md:col-span-8 md:col-start-5">
            <h2 className="text-display leading-[0.95]">
              Brief us
              <br />
              <span className="italic font-extralight">directly.</span>
            </h2>
            <p className="text-body text-stone/85 max-w-md mt-8">
              Both founders sit on every project pitch. Tell us what you're
              building and we'll come back inside two working days.
            </p>
            <div className="mt-12">
              <ButtonLink href="/contact" variant="ink">
                Open the brief form
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
