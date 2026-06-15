import { Suspense } from "react";
import { connection } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/client";
import { parseFoundersContent } from "@/lib/cms/founders-schema";
import { founders as staticFounders } from "@/content/founders";
import type { Founder } from "@/content/founders";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";
import { FounderCard } from "@/components/sections/FounderCard";
import { cmsImageSrc, type CmsImageValue } from "@/lib/cms/cms-image";

function cmsToFounder(f: { name: string; role: string; phone: string; email: string; website: string; address: string; bio: string[]; focus: string[]; pull: string; portrait: CmsImageValue }, _index: number): Founder {
  return {
    slug: f.name.toLowerCase().replace(/\s+/g, "-"),
    name: f.name, role: f.role, phone: f.phone,
    phoneHref: "tel:" + f.phone.replace(/\s/g, ""),
    email: f.email, website: f.website, address: f.address,
    bio: f.bio, focus: f.focus, pull: f.pull, portrait: cmsImageSrc(f.portrait),
  };
}

async function FoundersPreviewContent() {
  await connection();
  const sb = getServiceRoleClient();
  const [{ data: draftRow }, { data: pubRow }] = await Promise.all([
    sb.from("cms_settings").select("value").eq("key", "founders_content_draft").maybeSingle(),
    sb.from("cms_settings").select("value").eq("key", "founders_content").maybeSingle(),
  ]);
  const cms = parseFoundersContent(draftRow?.value ?? pubRow?.value);
  const displayFounders = cms.founders.length > 0
    ? [
        ...cms.founders.map(cmsToFounder),
        ...staticFounders.slice(cms.founders.length),
      ]
    : staticFounders;

  return (
    <>
      <div style={{ zIndex: 9999 }} className="fixed top-0 left-0 right-0 bg-yellow-400/95 backdrop-blur-sm text-ink text-center py-1.5 text-[11px] tracking-[0.18em] uppercase font-medium pointer-events-none">
        Draft Preview · {draftRow ? "Unsaved draft" : "Published content"}
      </div>
      <div className="pt-9">
        <section className="relative bg-[var(--color-chalk-sand)] text-ink pt-40 pb-32 overflow-hidden">
          <GridPattern className="absolute inset-0 text-ink opacity-[0.07]" density={28} disruption />
          <div className="shell relative grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 md:col-span-3">
              <Eyebrow number="00">{cms.intro.eyebrow}</Eyebrow>
            </div>
            <div className="col-span-12 md:col-span-9">
              <h1 className="text-display leading-[0.95]">
                <span className="block">
                  <SplitText by="word" stagger={0.05} duration={1}>{cms.intro.headlineLine1}</SplitText>
                </span>
                <span className="block italic font-extralight">
                  <SplitText by="word" stagger={0.05} duration={1} delay={0.2}>{cms.intro.headlineLine2}</SplitText>
                </span>
              </h1>
              <p className="text-body text-ink/70 max-w-md mt-10">{cms.intro.body}</p>
            </div>
          </div>
        </section>

        {displayFounders.map((f, i) => (
          <FounderCard key={f.slug} founder={f} index={i} reverse={i % 2 === 1} />
        ))}

        <section className="relative bg-[var(--color-terracotta)] text-stone py-32 md:py-44 overflow-hidden">
          <div className="shell relative grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-3">
              <Eyebrow number="03" className="text-stone/80">{cms.cta.eyebrow}</Eyebrow>
            </div>
            <div className="col-span-12 md:col-span-8 md:col-start-5">
              <h2 className="text-display leading-[0.95]">
                {cms.cta.headlineLine1}
                <br />
                <span className="italic font-extralight">{cms.cta.headlineLine2}</span>
              </h2>
              <p className="text-body text-stone/85 max-w-md mt-8">{cms.cta.body}</p>
              <div className="mt-12">
                <ButtonLink href={cms.cta.ctaHref} variant="ink">{cms.cta.ctaLabel}</ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default function FoundersPreviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-stone"><p className="text-label text-ink/55">Loading preview…</p></div>}>
      <FoundersPreviewContent />
    </Suspense>
  );
}
