import { Hero } from "@/components/sections/Hero";
import { WhatWeDoSection } from "@/components/sections/WhatWeDoSection";
import { CapabilitiesRail } from "@/components/sections/CapabilitiesRail";
import { ProductPreview } from "@/components/sections/ProductPreview";
import { IdentitySection } from "@/components/sections/IdentitySection";
// import { LookbookTeaser } from "@/components/sections/LookbookTeaser";
import { JournalTeaser } from "@/components/sections/JournalTeaser";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { BlockRenderer } from "@/components/sections/BlockRenderer";
import { getPage, getPageVisibility } from "@/lib/cms";

export default async function HomePage() {
  // CMS-first: if /admin/content has populated the home page with blocks,
  // render those. Otherwise fall through to the bespoke editorial layout
  // below. Both reads are independent and fully cached, so we resolve them
  // in parallel and let the renderer pick the path.
  const [page, visibility] = await Promise.all([
    getPage("home"),
    getPageVisibility(),
  ]);

  if (page && page.blocks.length > 0) {
    return (
      <>
        {page.blocks.map((block, index) => (
          <BlockRenderer key={index} block={block} />
        ))}
      </>
    );
  }

  // Lookbook stays available at /lookbook, but is hidden from the bespoke home for now.
  // const showLookbook = visibility.lookbook?.homepage !== false;
  const showJournal = visibility.journal?.homepage !== false;

  return (
    <>
      <Hero />
      <WhatWeDoSection />
      <ProductPreview />
      <IdentitySection />
      {/* {showLookbook && <LookbookTeaser />} */}
      {showJournal && <JournalTeaser />}
      <ContactCTA />
      <CapabilitiesRail />
    </>
  );
}
