import { Suspense } from "react";
import { connection } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/client";
import { parseProductsContent, resolveProductCatalog } from "@/lib/cms/products-schema";
import { ProductsHero } from "@/components/sections/products/ProductsHero";
import { ProductCatalog } from "@/components/sections/products/ProductCatalog";
import { ProductsCta } from "@/components/sections/products/ProductsCta";

async function ProductsPreviewContent() {
  await connection();
  const sb = getServiceRoleClient();
  const [{ data: draftRow }, { data: pubRow }] = await Promise.all([
    sb.from("cms_settings").select("value").eq("key", "products_content_draft").maybeSingle(),
    sb.from("cms_settings").select("value").eq("key", "products_content").maybeSingle(),
  ]);
  const cms = parseProductsContent(draftRow?.value ?? pubRow?.value);
  const catalog = resolveProductCatalog(cms.catalog);

  return (
    <>
      <div
        style={{ zIndex: 9999 }}
        className="fixed top-0 left-0 right-0 bg-yellow-400/95 backdrop-blur-sm text-ink text-center py-1.5 text-[11px] tracking-[0.18em] uppercase font-medium pointer-events-none"
      >
        Draft Preview · {draftRow ? "Unsaved draft" : "Published content"}
      </div>
      <div className="pt-9">
        <ProductsHero
          eyebrow={cms.intro.eyebrow}
          headline={cms.intro.headline}
          image={cms.intro.image}
        />
        <ProductCatalog catalog={catalog} />
        <ProductsCta
          headlineLine1={cms.cta.headlineLine1}
          headlineLine2={cms.cta.headlineLine2}
          body={cms.cta.body}
          contactCta={cms.cta.contactCta}
        />
      </div>
    </>
  );
}

export default function ProductsPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-stone">
          <p className="text-label text-ink/55">Loading preview…</p>
        </div>
      }
    >
      <ProductsPreviewContent />
    </Suspense>
  );
}
