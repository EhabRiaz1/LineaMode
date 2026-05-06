import { Hero } from "@/components/sections/Hero";
// Kept for re-use on other pages.
// import { ManifestoSection } from "@/components/sections/ManifestoSection";
// import { NetworkStats } from "@/components/sections/NetworkStats";
import { WhatWeDoSection } from "@/components/sections/WhatWeDoSection";
import { CapabilitiesRail } from "@/components/sections/CapabilitiesRail";
import { ProductPreview } from "@/components/sections/ProductPreview";
import { ValuesSection } from "@/components/sections/ValuesSection";
import { LookbookTeaser } from "@/components/sections/LookbookTeaser";
import { JournalTeaser } from "@/components/sections/JournalTeaser";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { listJournal } from "@/lib/cms";

export default async function HomePage() {
  const posts = await listJournal();

  return (
    <>
      <Hero />
      <WhatWeDoSection />
      <ProductPreview />
      <ValuesSection />
      <LookbookTeaser />
      <JournalTeaser posts={posts} />
      <ContactCTA />
      <CapabilitiesRail />
    </>
  );
}
