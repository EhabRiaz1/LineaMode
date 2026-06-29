import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/client";
import { parseJournalIntro } from "@/lib/cms/journal-intro-schema";
import { listJournal } from "@/lib/cms";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { GridPattern } from "@/components/ui/GridPattern";

async function JournalPreviewContent() {
  await connection();

  const sb = getServiceRoleClient();
  const [{ data: draftRow }, { data: pubRow }, posts] = await Promise.all([
    sb.from("cms_settings").select("value").eq("key", "journal_intro_draft").maybeSingle(),
    sb.from("cms_settings").select("value").eq("key", "journal_intro").maybeSingle(),
    listJournal(),
  ]);

  const intro = parseJournalIntro(draftRow?.value ?? pubRow?.value);
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      <div
        style={{ zIndex: 9999 }}
        className="fixed top-0 left-0 right-0 bg-yellow-400/95 backdrop-blur-sm text-ink text-center py-1.5 text-[11px] tracking-[0.18em] uppercase font-medium pointer-events-none"
      >
        Draft Preview · {draftRow ? "Unsaved draft" : "Published content"}
      </div>
      <div className="pt-9">
        <section className="relative bg-ink text-stone pt-40 pb-24 overflow-hidden">
          <GridPattern className="absolute inset-0 text-stone opacity-[0.08]" density={28} disruption />
          <div className="shell relative grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 md:col-span-3">
              <Eyebrow number="00" className="text-stone/80">{intro.eyebrow}</Eyebrow>
            </div>
            <div className="col-span-12 md:col-span-9">
              <h1 className="text-journal-intro-headline">
                <span className="block">
                  <SplitText by="word" stagger={0.05} duration={1}>{intro.headlineLine1}</SplitText>
                </span>
                <span className="block font-extralight">
                  <SplitText by="word" stagger={0.05} duration={1} delay={0.2}>{intro.headlineLine2}</SplitText>
                </span>
              </h1>
            </div>
          </div>
        </section>

        {featured && (
          <section className="relative pt-24 md:pt-32 pb-24 border-b hairline">
            <Link href={`/journal/${featured.slug}`} className="shell grid grid-cols-12 gap-6 md:gap-12 items-end group/featured">
              <div className="col-span-12 md:col-span-7">
                <div className="aspect-[16/10] overflow-hidden ring-1 ring-ink/10 bg-ink/5">
                  {featured.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={featured.cover} alt={featured.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-ink/8 flex items-end p-8">
                      <p className="text-body text-ink/40 max-w-xs">{featured.title}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-12 md:col-span-5">
                <div className="flex items-center justify-between text-label text-ink/55 mb-6">
                  <span>/ Featured</span><span>{featured.category}</span>
                </div>
                <h2 className="text-h1 leading-tight transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/featured:text-linen">{featured.title}</h2>
                <p className="text-body text-ink/70 max-w-md mt-6">{featured.excerpt}</p>
                <p className="text-label text-ink/55 mt-8">{featured.date}</p>
              </div>
            </Link>
          </section>
        )}

        {rest.length > 0 && (
          <section className="py-32">
            <div className="shell">
              <p className="text-eyebrow text-ink/55 mb-12">/ All Entries</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-16">
                {rest.map((p, i) => (
                  <Link key={p.slug} href={`/journal/${p.slug}`} className="group/post border-t hairline pt-6 flex flex-col gap-5">
                    <div className="flex items-center justify-between text-label text-ink/55">
                      <span>/ {String(i + 2).padStart(2, "0")}</span><span>{p.category}</span>
                    </div>
                    <div className="aspect-[5/4] overflow-hidden ring-1 ring-ink/10 bg-ink/5">
                      {p.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.cover} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-ink/8 flex items-end p-5">
                          <p className="text-label text-ink/40 line-clamp-2">{p.title}</p>
                        </div>
                      )}
                    </div>
                    <h3 className="text-h2 leading-snug max-w-[24ch] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/post:text-linen">
                      {p.title}
                    </h3>
                    <p className="text-body text-ink/70 max-w-md">{p.excerpt}</p>
                    <p className="text-label text-ink/55 mt-auto">{p.date}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default function JournalPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-stone">
          <p className="text-label text-ink/55">Loading preview…</p>
        </div>
      }
    >
      <JournalPreviewContent />
    </Suspense>
  );
}
