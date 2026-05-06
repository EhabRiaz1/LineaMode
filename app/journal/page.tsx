import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitText } from "@/components/ui/SplitText";
import { GridPattern } from "@/components/ui/GridPattern";
import { listJournal } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Journal",
  description:
    "Notes from the studio, the floor, and the field. Field essays on knit, performance polyester, MOQ discipline and the long game of apparel manufacturing.",
  path: "/journal",
});

export default async function JournalPage() {
  const posts = await listJournal();
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      {/* Intro */}
      <section className="relative bg-ink text-stone pt-40 pb-24 overflow-hidden">
        <GridPattern
          className="absolute inset-0 text-stone opacity-[0.08]"
          density={28}
          disruption
        />
        <div className="shell relative grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-3">
            <Eyebrow number="00" className="text-stone/80">Journal</Eyebrow>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h1 className="text-display leading-[0.95]">
              <span className="block">
                <SplitText by="word" stagger={0.05} duration={1}>
                  Notes from
                </SplitText>
              </span>
              <span className="block italic font-extralight">
                <SplitText by="word" stagger={0.05} duration={1} delay={0.2}>
                  the studio.
                </SplitText>
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="relative pb-24 border-b hairline">
          <Link
            href={`/journal/${featured.slug}`}
            className="shell grid grid-cols-12 gap-6 md:gap-12 items-end group/featured"
          >
            <div className="col-span-12 md:col-span-7">
              <div className="aspect-[16/10] overflow-hidden ring-1 ring-ink/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.cover}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/featured:scale-105"
                />
              </div>
            </div>
            <div className="col-span-12 md:col-span-5">
              <div className="flex items-center justify-between text-label text-ink/55 mb-6">
                <span>/ Featured</span>
                <span>{featured.category}</span>
              </div>
              <h2 className="text-h1 leading-tight">{featured.title}</h2>
              <p className="text-body text-ink/70 max-w-md mt-6">
                {featured.excerpt}
              </p>
              <p className="text-label text-ink/55 mt-8">{featured.date}</p>
            </div>
          </Link>
        </section>
      )}

      {/* Grid */}
      <section className="py-32">
        <div className="shell">
          <p className="text-eyebrow text-ink/55 mb-12">/ All Entries</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-16">
            {rest.map((p, i) => (
              <Link
                key={p.slug}
                href={`/journal/${p.slug}`}
                className="group/post border-t hairline pt-6 flex flex-col gap-5"
              >
                <div className="flex items-center justify-between text-label text-ink/55">
                  <span>/ {String(i + 2).padStart(2, "0")}</span>
                  <span>{p.category}</span>
                </div>
                <div className="aspect-[5/4] overflow-hidden ring-1 ring-ink/10 bg-ink/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.cover}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/post:scale-105"
                  />
                </div>
                <h3 className="text-h2 leading-snug max-w-[24ch]">{p.title}</h3>
                <p className="text-body text-ink/70 max-w-md">{p.excerpt}</p>
                <p className="text-label text-ink/55 mt-auto">{p.date}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
