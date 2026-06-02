import { Hero } from "@/components/sections/Hero";
import { WhatWeDoSection } from "@/components/sections/WhatWeDoSection";
import { HomeProductRail } from "@/components/sections/products/HomeProductRail";
import { IdentitySection } from "@/components/sections/IdentitySection";
import { JournalTeaser } from "@/components/sections/JournalTeaser";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { getHomeContent, getPageVisibility, getProductsContent } from "@/lib/cms";
import { getFeaturedProducts, resolveProductCatalog } from "@/lib/cms/products-schema";

export default async function HomePage() {
  const [cms, visibility, products] = await Promise.all([
    getHomeContent(),
    getPageVisibility(),
    getProductsContent(),
  ]);

  const featured = getFeaturedProducts(resolveProductCatalog(products.catalog));

  const showJournal =
    cms.journal.enabled && visibility.journal?.homepage !== false;

  return (
    <>
      <Hero cms={cms.hero} />
      {cms.whatWeDo.enabled && (
        <WhatWeDoSection cms={cms.whatWeDo} capabilityItems={cms.capabilities.items} />
      )}
      {cms.products.enabled && <HomeProductRail products={featured} />}
      {cms.identity.enabled && <IdentitySection cms={cms.identity} />}
      {showJournal && <JournalTeaser cms={cms.journal} />}
      {cms.contactCta.enabled && <ContactCTA cms={cms.contactCta} />}
    </>
  );
}
