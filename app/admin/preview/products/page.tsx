import { Suspense } from "react";
import { connection } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/client";
import { parseProductsContent } from "@/lib/cms/products-schema";
import { products as staticProducts } from "@/content/products";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";

async function ProductsPreviewContent() {
  await connection();
  const sb = getServiceRoleClient();
  const [{ data: draftRow }, { data: pubRow }] = await Promise.all([
    sb.from("cms_settings").select("value").eq("key", "products_content_draft").maybeSingle(),
    sb.from("cms_settings").select("value").eq("key", "products_content").maybeSingle(),
  ]);
  const cms = parseProductsContent(draftRow?.value ?? pubRow?.value);
  const displayProducts = cms.products.length > 0
    ? cms.products.map((p, i) => ({ ...p, slug: staticProducts[i]?.slug ?? `product-${i}` }))
    : staticProducts.map(p => ({ ...p, moq: "From 200 pcs", leadTime: "45–60 days" }));

  const cta = cms.cta;

  return (
    <>
      <div style={{ zIndex: 9999 }} className="fixed top-0 left-0 right-0 bg-yellow-400/95 backdrop-blur-sm text-ink text-center py-1.5 text-[11px] tracking-[0.18em] uppercase font-medium pointer-events-none">
        Draft Preview · {draftRow ? "Unsaved draft" : "Published content"}
      </div>
      <div className="pt-9">
        {/* Intro */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[var(--color-graphite-blue)] via-[var(--color-graphite-blue)] to-ink text-stone pt-40 pb-24">
          <GridPattern className="absolute inset-0 text-stone opacity-[0.08]" density={28} disruption />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-ink" />
          <div className="shell relative grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 md:col-span-3">
              <Eyebrow number="00" className="text-stone/80">{cms.intro.eyebrow}</Eyebrow>
            </div>
            <div className="col-span-12 md:col-span-9">
              <h1 className="text-display leading-[0.95]">
                <span className="block">
                  <SplitText by="word" stagger={0.05} duration={1}>{cms.intro.headline}</SplitText>
                </span>
              </h1>
            </div>
          </div>
        </section>

        {/* Three pillars */}
        <section className="bg-ink text-stone border-b border-stone/10">
          <div className="shell">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone/10">
              {displayProducts.map((p) => (
                <a key={p.slug} href={`#${p.slug}`} className="group flex items-center justify-center py-5 transition-colors duration-500 hover:bg-stone/[0.03] md:px-10 md:py-6">
                  <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.9rem,3vw,3.25rem)] italic font-extralight leading-none tracking-tight transition-colors duration-500 group-hover:text-terracotta">
                    {p.title}
                  </h2>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Category list */}
        <section className="border-t hairline">
          {displayProducts.map((p, i) => {
            const flip = i % 2 === 1;
            return (
              <article key={p.slug} id={p.slug} className="border-b hairline scroll-mt-32">
                <div className="shell grid grid-cols-12 gap-6 md:gap-12 py-20 md:py-28 items-center">
                  <div className={`col-span-12 md:col-span-7 ${flip ? "md:order-2" : ""}`}>
                    <div className="aspect-[4/5] md:aspect-[5/6] overflow-hidden ring-1 ring-ink/15 group/p relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.hero} alt={p.title} className="w-full h-full object-cover transition-opacity duration-700 group-hover/p:opacity-0" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.detail} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover/p:opacity-100" />
                    </div>
                  </div>
                  <div className={`col-span-12 md:col-span-5 ${flip ? "md:order-1" : ""}`}>
                    <div className="flex justify-between text-label text-ink/55 mb-6">
                      <span>/ {String(i + 1).padStart(2, "0")}</span>
                      <span>{p.tagline}</span>
                    </div>
                    <h2 className="text-h1 mb-6">{p.title}</h2>
                    <p className="text-body text-ink/80 max-w-md">{p.description}</p>
                    <div className="mt-10 flex flex-wrap gap-3">
                      {p.highlights.map((h) => (
                        <span key={h} className="inline-flex items-center gap-2 text-label text-ink/85 border border-ink/20 rounded-full px-4 py-2">
                          <span className="size-1 rounded-full bg-ink/60" />{h}
                        </span>
                      ))}
                    </div>
                    <div className="mt-10 grid grid-cols-2 gap-6 text-label text-ink/65 max-w-sm">
                      <div className="border-t hairline pt-4">
                        <p className="text-ink/45">MOQ</p>
                        <p className="text-ink mt-1 text-body">{p.moq}</p>
                      </div>
                      <div className="border-t hairline pt-4">
                        <p className="text-ink/45">Lead time</p>
                        <p className="text-ink mt-1 text-body">{p.leadTime}</p>
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
                {cta.headlineLine1}
                <br />
                <span className="italic font-extralight">{cta.headlineLine2}</span>
              </h2>
            </div>
            <div className="col-span-12 md:col-span-4">
              <p className="text-body text-stone/85 max-w-md mb-8">{cta.body}</p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href={cta.primaryCta.href} variant="ink">{cta.primaryCta.label}</ButtonLink>
                <ButtonLink href={cta.secondaryCta.href} variant="ghost" className="!text-stone ring-stone/45 hover:bg-stone/10">
                  {cta.secondaryCta.label}
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default function ProductsPreviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-stone"><p className="text-label text-ink/55">Loading preview…</p></div>}>
      <ProductsPreviewContent />
    </Suspense>
  );
}
