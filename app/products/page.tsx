import { ProductsHero } from "@/components/sections/products/ProductsHero";
import { ProductCatalog } from "@/components/sections/products/ProductCatalog";
import { ProductsCta } from "@/components/sections/products/ProductsCta";
import { pageMetadata } from "@/lib/seo/metadata";
import { getProductsContent } from "@/lib/cms";
import { resolveCategoryConfigs, resolveProductCatalog } from "@/lib/cms/products-schema";

export const metadata = pageMetadata({
  title: "Products",
  description:
    "Lifestyle, athleisure and sportswear — three focused product worlds engineered in one studio with a single discipline.",
  path: "/products",
});

export default async function ProductsPage() {
  const cms = await getProductsContent();
  const catalog = resolveProductCatalog(cms.catalog);
  const categories = resolveCategoryConfigs(cms);

  return (
    <>
      <ProductsHero
        eyebrow={cms.intro.eyebrow}
        headline={cms.intro.headline}
        image={cms.intro.image}
      />
      <ProductCatalog
        catalog={catalog}
        categories={categories}
        lookbookPdfHref={cms.lookbookCta.pdfHref}
        lookbookCtaLabel={cms.lookbookCta.label}
      />
      <ProductsCta
        headlineLine1={cms.cta.headlineLine1}
        headlineLine2={cms.cta.headlineLine2}
        body={cms.cta.body}
        contactCta={cms.cta.contactCta}
      />
    </>
  );
}
