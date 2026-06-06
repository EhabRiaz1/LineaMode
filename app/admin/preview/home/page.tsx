import { Suspense } from "react";
import { connection } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/client";
import { parseHomeContent } from "@/lib/cms/home-schema";
import {
  parseProductsContent,
  resolveProductCatalog,
  getFeaturedProducts,
} from "@/lib/cms/products-schema";
import { Hero } from "@/components/sections/Hero";
import { WhatWeDoSection } from "@/components/sections/WhatWeDoSection";
import { HomeProductRail } from "@/components/sections/products/HomeProductRail";
import { IdentitySection } from "@/components/sections/IdentitySection";
import { JournalTeaser } from "@/components/sections/JournalTeaser";
import { listJournal } from "@/lib/cms";

async function HomePreviewContent() {
  await connection();

  const sb = getServiceRoleClient();
  const [
    { data: draftRow },
    { data: pubRow },
    { data: productsDraftRow },
    { data: productsPubRow },
  ] = await Promise.all([
    sb.from("cms_settings").select("value").eq("key", "home_content_draft").maybeSingle(),
    sb.from("cms_settings").select("value").eq("key", "home_content").maybeSingle(),
    sb.from("cms_settings").select("value").eq("key", "products_content_draft").maybeSingle(),
    sb.from("cms_settings").select("value").eq("key", "products_content").maybeSingle(),
  ]);

  const cms = parseHomeContent(draftRow?.value ?? pubRow?.value);
  const productsCms = parseProductsContent(
    productsDraftRow?.value ?? productsPubRow?.value,
  );
  const journalPosts = await listJournal();

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
        {cms.products.enabled && (
          <HomeProductRail products={getFeaturedProducts(resolveProductCatalog(productsCms.catalog))} />
        )}
        {cms.identity.enabled && <IdentitySection cms={cms.identity} />}
        {cms.journal.enabled && <JournalTeaser cms={cms.journal} articles={journalPosts} />}
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
