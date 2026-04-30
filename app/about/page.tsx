import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";
import { manifesto } from "@/content/manifesto";
import { values } from "@/content/values";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Lineamode Apparel was established to help brands address quality, lead-time and coordination problems with end-to-end design-to-production solutions.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      {/* Intro */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <GridPattern
          className="absolute inset-0 text-ink opacity-[0.05]"
          density={28}
          disruption
        />
        <div className="shell relative grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-3">
            <Eyebrow number="00">About</Eyebrow>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h1 className="text-display leading-[0.95]">
              <span className="block">
                <SplitText by="word" stagger={0.05} duration={1}>
                  A studio for brands
                </SplitText>
              </span>
              <span className="block italic font-extralight">
                <SplitText by="word" stagger={0.05} duration={1} delay={0.2}>
                  that move fast.
                </SplitText>
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="relative pb-32 md:pb-44">
        <div className="shell grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3">
            <p className="text-eyebrow text-ink/55">/ 01 Manifesto</p>
          </div>
          <div className="col-span-12 md:col-span-8 md:col-start-5 max-w-3xl">
            <p className="text-h1 leading-[1.05] mb-12">{manifesto.short}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-body text-ink/75">
              {manifesto.long.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <p className="mt-16 text-h2 italic font-extralight font-display max-w-2xl border-l border-ink/30 pl-6">
              "{manifesto.pull}"
            </p>
          </div>
        </div>
      </section>

      {/* Founder note */}
      <section className="relative bg-[var(--color-graphite-blue)] text-stone py-32 md:py-44 overflow-hidden">
        <GridPattern
          className="absolute inset-0 text-stone opacity-[0.07]"
          density={48}
          disruption
        />
        <div className="shell relative grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 md:col-span-5">
            <div className="aspect-[4/5] overflow-hidden ring-1 ring-stone/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1600&q=80"
                alt="Founder portrait"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7">
            <Eyebrow number="02" className="text-stone/70">
              Founder
            </Eyebrow>
            <h2 className="text-h1 mt-6">
              Saif Ahmed,
              <br />
              <span className="italic font-extralight">on the long game.</span>
            </h2>
            <p className="text-body text-stone/80 max-w-md mt-8">
              Three decades in the global textile industry — working alongside
              the most exacting brands and manufacturers in fashion — taught
              the studio one thing above all: brands grow when their partner
              owns the long-term, not just the next purchase order.
            </p>
            <p className="text-body text-stone/80 max-w-md mt-4">
              That belief is the spine of Lineamode. Every process, every
              hire, every fabric we add to our library is in service of
              becoming the partner our customers can stay with for years.
            </p>
            <div className="mt-10">
              <ButtonLink href="/contact" variant="ink">
                Speak to the studio
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative bg-stone py-32 md:py-44">
        <div className="shell">
          <div className="grid grid-cols-12 gap-6 mb-16">
            <div className="col-span-12 md:col-span-4">
              <Eyebrow number="03">Values</Eyebrow>
              <h2 className="text-h1 mt-6">
                Five principles
                <br />
                <span className="italic font-extralight">we work by.</span>
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            {values.map((v) => (
              <div key={v.number} className="border-t hairline pt-6">
                <div className="flex justify-between text-label text-ink/55 mb-4">
                  <span>/ {v.number}</span>
                  <span>{v.title}</span>
                </div>
                <p className="text-h2 leading-tight max-w-md">{v.title}</p>
                <p className="text-body text-ink/70 max-w-md mt-4">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HQ */}
      <section className="relative bg-[var(--color-chalk-sand)] py-32">
        <div className="shell grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-5">
            <Eyebrow number="04">Studio</Eyebrow>
            <h2 className="text-h1 mt-6">
              Islamabad, <span className="italic font-extralight">Pakistan.</span>
            </h2>
            <p className="text-body text-ink/75 max-w-md mt-6">
              The studio sits at NESPAK House on Attaturk Avenue — a working
              floor, not a showroom. Visitors are welcome by appointment.
            </p>
            <address className="not-italic text-body text-ink/85 mt-8 leading-relaxed">
              1st Floor, NESPAK House,
              <br />
              G-5/2, Attaturk Avenue,
              <br />
              Islamabad, Pakistan.
            </address>
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7">
            <div className="aspect-[5/4] overflow-hidden ring-1 ring-ink/15 bg-ink/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1600&q=80"
                alt="Studio building exterior"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
