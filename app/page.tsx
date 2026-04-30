import { Hero } from "@/components/sections/Hero";
import { ManifestoSection } from "@/components/sections/ManifestoSection";
import { CapabilitiesRail } from "@/components/sections/CapabilitiesRail";
import { ProductPreview } from "@/components/sections/ProductPreview";
import { NetworkStats } from "@/components/sections/NetworkStats";
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
      <ManifestoSection />
      <CapabilitiesRail />
      <ProductPreview />
      <NetworkStats />
      <ValuesSection />
      <LookbookTeaser />
      <JournalTeaser posts={posts} />
      <ContactCTA />
    </>
  );
}
