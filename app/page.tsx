import { Hero } from "@/components/sections/Hero";
import { WhatWeDoSection } from "@/components/sections/WhatWeDoSection";
import { HomeProductRail } from "@/components/sections/products/HomeProductRail";
import { IdentitySection } from "@/components/sections/IdentitySection";
import { JournalTeaser } from "@/components/sections/JournalTeaser";
import { getHomeContent, getPageVisibility, getProductsContent, listJournal } from "@/lib/cms";
import { getHomeCategoryTiles } from "@/lib/cms/products-schema";

export default async function HomePage() {
  const [cms, visibility, products, journalPosts] = await Promise.all([
    getHomeContent(),
    getPageVisibility(),
    getProductsContent(),
    listJournal(),
  ]);

  const categoryTiles = getHomeCategoryTiles(products);

  const showJournal =
    cms.journal.enabled && visibility.journal?.homepage !== false;

  return (
    <>
      <Hero cms={cms.hero} />
      {cms.whatWeDo.enabled && (
        <WhatWeDoSection cms={cms.whatWeDo} capabilityItems={cms.capabilities.items} />
      )}
      {cms.products.enabled && <HomeProductRail categories={categoryTiles} />}
      {cms.identity.enabled && <IdentitySection cms={cms.identity} />}
      {showJournal && <JournalTeaser cms={cms.journal} articles={journalPosts} />}
    </>
  );
}
