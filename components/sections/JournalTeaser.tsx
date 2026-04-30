import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { JournalSummary } from "@/lib/cms";

export function JournalTeaser({ posts }: { posts: JournalSummary[] }) {
  return (
    <section className="relative bg-stone py-32 md:py-44">
      <div className="shell">
        <div className="flex items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <Eyebrow number="08">Journal</Eyebrow>
            <h2 className="text-h1 mt-6">
              Notes from the studio,
              <br />
              <span className="italic font-extralight">the floor and the field.</span>
            </h2>
          </div>
          <Link
            href="/journal"
            className="text-label hidden md:inline-flex items-center gap-2 hover:gap-3 transition-all"
          >
            All entries →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.slice(0, 3).map((p, i) => (
            <Link
              key={p.slug}
              href={`/journal/${p.slug}`}
              className="group/post border-t hairline pt-6 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between text-label text-ink/55">
                <span>/ {String(i + 1).padStart(2, "0")}</span>
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
  );
}
