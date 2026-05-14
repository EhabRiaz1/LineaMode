import { Suspense } from "react";
import { connection } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/client";
import { parseHomeContent } from "@/lib/cms/home-schema";
import { Hero } from "@/components/sections/Hero";
import { WhatWeDoSection } from "@/components/sections/WhatWeDoSection";
import { ProductPreview } from "@/components/sections/ProductPreview";
import { IdentitySection } from "@/components/sections/IdentitySection";
import { JournalTeaser } from "@/components/sections/JournalTeaser";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { CapabilitiesRail } from "@/components/sections/CapabilitiesRail";

async function HomePreviewContent() {
  await connection();

  const sb = getServiceRoleClient();
  const [{ data: draftRow }, { data: pubRow }] = await Promise.all([
    sb.from("cms_settings").select("value").eq("key", "home_content_draft").maybeSingle(),
    sb.from("cms_settings").select("value").eq("key", "home_content").maybeSingle(),
  ]);

  const cms = parseHomeContent(draftRow?.value ?? pubRow?.value);

  return (
    <>
      <div
        style={{ zIndex: 9999 }}
        className="fixed top-0 left-0 right-0 bg-yellow-400/95 backdrop-blur-sm text-ink text-center py-1.5 text-[11px] tracking-[0.18em] uppercase font-medium pointer-events-none"
      >
        Draft Preview · {draftRow ? "Unsaved draft" : "Published content"}
      </div>
      <div className="pt-9">
        <Hero cms={cms.hero} />
        {cms.whatWeDo.enabled && (
          <WhatWeDoSection cms={cms.whatWeDo} capabilityItems={cms.capabilities.items} />
        )}
        {cms.products.enabled && <ProductPreview cms={cms.products} />}
        {cms.identity.enabled && <IdentitySection cms={cms.identity} />}
        {cms.journal.enabled && <JournalTeaser cms={cms.journal} />}
        {cms.contactCta.enabled && <ContactCTA cms={cms.contactCta} />}
        {cms.capabilities.enabled && (
          <CapabilitiesRail cms={cms.capabilities} items={cms.capabilities.items} />
        )}
      </div>
    </>
  );
}

export default function HomePreviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-stone"><p className="text-label text-ink/55">Loading preview…</p></div>}>
      <HomePreviewContent />
    </Suspense>
  );
}
