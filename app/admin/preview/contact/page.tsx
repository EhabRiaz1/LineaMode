import { Suspense } from "react";
import { connection } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/client";
import { parseContactContent } from "@/lib/cms/contact-schema";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { GridPattern } from "@/components/ui/GridPattern";
import { ContactForm } from "@/components/sections/ContactForm";

async function ContactPreviewContent() {
  await connection();
  const sb = getServiceRoleClient();
  const [{ data: draftRow }, { data: pubRow }] = await Promise.all([
    sb.from("cms_settings").select("value").eq("key", "contact_content_draft").maybeSingle(),
    sb.from("cms_settings").select("value").eq("key", "contact_content").maybeSingle(),
  ]);
  const cms = parseContactContent(draftRow?.value ?? pubRow?.value);

  return (
    <>
      <div style={{ zIndex: 9999 }} className="fixed top-0 left-0 right-0 bg-yellow-400/95 backdrop-blur-sm text-ink text-center py-1.5 text-[11px] tracking-[0.18em] uppercase font-medium pointer-events-none">
        Draft Preview · {draftRow ? "Unsaved draft" : "Published content"}
      </div>
      <div className="pt-9">
        <section className="relative pt-40 pb-16 overflow-hidden">
          <GridPattern className="absolute inset-0 text-ink opacity-[0.05]" density={28} disruption />
          <div className="shell relative">
            <Eyebrow number="00">{cms.intro.eyebrow}</Eyebrow>
            <h1 className="text-contact-intro-headline mt-8 text-pretty">
                <span className="block">
                  <SplitText by="word" stagger={0.05} duration={1}>{cms.intro.headlineLine1}</SplitText>
                </span>
                <span className="block italic font-extralight">
                  <SplitText by="word" stagger={0.05} duration={1} delay={0.2}>{cms.intro.headlineLine2}</SplitText>
                </span>
              </h1>
          </div>
        </section>

        <section className="relative pb-32">
          <div className="shell grid grid-cols-12 gap-6 md:gap-12">
            <div className="col-span-12 md:col-span-4">
              <div className="md:sticky md:top-32 flex flex-col gap-10">
                <div>
                  <p className="text-eyebrow text-ink/55 mb-3">/ 01 Email</p>
                  <a href={`mailto:${cms.details.email}`} className="text-body leading-relaxed hover:underline underline-offset-4 break-all">
                    {cms.details.email}
                  </a>
                </div>
                <div>
                  <p className="text-eyebrow text-ink/55 mb-3">/ 02 Location</p>
                  <address className="not-italic text-body text-ink/85 leading-relaxed whitespace-pre-line">
                    {cms.details.address}
                  </address>
                </div>
                <div>
                  <p className="text-eyebrow text-ink/55 mb-3">/ 03 Hours</p>
                  <p className="text-body text-ink/85">{cms.details.hours}</p>
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-8">
              <p className="text-eyebrow text-ink/55 mb-6">/ {cms.details.formSectionLabel}</p>
              <ContactForm />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default function ContactPreviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-stone"><p className="text-label text-ink/55">Loading preview…</p></div>}>
      <ContactPreviewContent />
    </Suspense>
  );
}
