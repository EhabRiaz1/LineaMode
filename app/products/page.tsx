import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";
import { products } from "@/content/products";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Products",
  description:
    "Knitwear, performance polyesters, soft wovens, outerwear and sweaters — engineered in one studio with a single discipline.",
  path: "/products",
});

export default function ProductsPage() {
  return (
    <>
      {/* Intro */}
      <section className="relative bg-[var(--color-graphite-blue)] text-stone pt-40 pb-24 overflow-hidden">
        <GridPattern
          className="absolute inset-0 text-stone opacity-[0.08]"
          density={28}
          disruption
        />
        <div className="shell relative grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-3">
            <Eyebrow number="00" className="text-stone/80">Products</Eyebrow>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h1 className="text-display leading-[0.95]">
              <span className="block">
                <SplitText by="word" stagger={0.05} duration={1}>
                  Knitwear at the centre.
                </SplitText>
              </span>
              <span className="block italic font-extralight">
                <SplitText by="word" stagger={0.05} duration={1} delay={0.2}>
                  Built outwards from there.
                </SplitText>
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* Category list */}
      <section className="border-t hairline">
        {products.map((p, i) => {
          const flip = i % 2 === 1;
          return (
            <article
              key={p.slug}
              id={p.slug}
              className="border-b hairline scroll-mt-32"
            >
              <div className="shell grid grid-cols-12 gap-6 md:gap-12 py-20 md:py-28 items-center">
                <div
                  className={`col-span-12 md:col-span-7 ${flip ? "md:order-2" : ""}`}
                >
                  <div className="aspect-[4/5] md:aspect-[5/6] overflow-hidden ring-1 ring-ink/15 group/p relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.hero}
                      alt={p.title}
                      className="w-full h-full object-cover transition-opacity duration-700 group-hover/p:opacity-0"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.detail}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover/p:opacity-100"
                    />
                  </div>
                </div>
                <div
                  className={`col-span-12 md:col-span-5 ${flip ? "md:order-1" : ""}`}
                >
                  <div className="flex justify-between text-label text-ink/55 mb-6">
                    <span>/ {String(i + 1).padStart(2, "0")}</span>
                    <span>{p.tagline}</span>
                  </div>
                  <h2 className="text-h1 mb-6">{p.title}</h2>
                  <p className="text-body text-ink/80 max-w-md">{p.description}</p>

                  <div className="mt-10 flex flex-wrap gap-3">
                    {p.highlights.map((h) => (
                      <span
                        key={h}
                        className="inline-flex items-center gap-2 text-label text-ink/85 border border-ink/20 rounded-full px-4 py-2"
                      >
                        <span className="size-1 rounded-full bg-ink/60" />
                        {h}
                      </span>
                    ))}
                  </div>

                  <div className="mt-10 grid grid-cols-2 gap-6 text-label text-ink/65 max-w-sm">
                    <div className="border-t hairline pt-4">
                      <p className="text-ink/45">MOQ</p>
                      <p className="text-ink mt-1 text-body">From 200 pcs</p>
                    </div>
                    <div className="border-t hairline pt-4">
                      <p className="text-ink/45">Lead time</p>
                      <p className="text-ink mt-1 text-body">45–60 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-terracotta)] text-stone py-32">
        <div className="shell grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-7">
            <h2 className="text-display leading-[0.95]">
              Build a range
              <br />
              <span className="italic font-extralight">with us.</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-4">
            <p className="text-body text-stone/85 max-w-md mb-8">
              Send a brief and we'll respond with fabric options, costings and
              an indicative critical path within two working days.
            </p>
            <ButtonLink href="/contact" variant="ink">
              Brief the studio
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
