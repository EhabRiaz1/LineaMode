import { Hero } from "@/components/sections/Hero";
import { WhatWeDoSection } from "@/components/sections/WhatWeDoSection";
import { CapabilitiesRail } from "@/components/sections/CapabilitiesRail";
import { ProductPreview } from "@/components/sections/ProductPreview";
import { IdentitySection } from "@/components/sections/IdentitySection";
import { JournalTeaser } from "@/components/sections/JournalTeaser";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { getHomeContent, getPageVisibility } from "@/lib/cms";

export default async function HomePage() {
  const [cms, visibility] = await Promise.all([getHomeContent(), getPageVisibility()]);

  const showJournal =
    cms.journal.enabled && visibility.journal?.homepage !== false;

  return (
    <>
      <Hero cms={cms.hero} />
      {cms.whatWeDo.enabled && (
        <WhatWeDoSection cms={cms.whatWeDo} capabilityItems={cms.capabilities.items} />
      )}
      {cms.products.enabled && <ProductPreview cms={cms.products} />}
      {cms.identity.enabled && <IdentitySection cms={cms.identity} />}
      {showJournal && <JournalTeaser cms={cms.journal} />}
      {cms.contactCta.enabled && <ContactCTA cms={cms.contactCta} />}
      {cms.capabilities.enabled && (
        <CapabilitiesRail cms={cms.capabilities} items={cms.capabilities.items} />
      )}
    </>
  );
}
