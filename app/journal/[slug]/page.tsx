import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { getJournalEntry, listJournal } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateStaticParams() {
  const posts = await listJournal();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalEntry(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/journal/${post.slug}`,
  });
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getJournalEntry(slug);
  if (!post) return notFound();

  const all = await listJournal();
  const idx = all.findIndex((p) => p.slug === slug);
  const next = all[(idx + 1) % all.length];

  return (
    <article className="bg-stone text-ink">
      <header className="relative pt-40 pb-24">
        <div className="shell">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-label text-ink/55 hover:text-ink transition-colors mb-12"
          >
            ← Back to Journal
          </Link>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-8">
              <Eyebrow number={post.category}>{post.date}</Eyebrow>
              <h1 className="text-h1 mt-8 leading-tight max-w-3xl">
                {post.title}
              </h1>
              <p className="text-body text-ink/70 max-w-2xl mt-8">
                {post.excerpt}
              </p>
              <p className="text-label text-ink/55 mt-6">{post.readTime}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="shell pb-24">
        <div className="aspect-[16/9] overflow-hidden ring-1 ring-ink/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="shell pb-32">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-8 md:col-start-3">
            <div className="prose-editorial">
              {post.body.split("\n\n").map((p, i) => (
                <p
                  key={i}
                  className="text-h3 leading-relaxed font-display font-light text-ink/90 mb-7"
                  style={{ fontSize: "clamp(1.125rem, 0.4vw + 1rem, 1.375rem)" }}
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Next entry */}
      <section className="border-t hairline bg-ink text-stone py-32">
        <div className="shell">
          <div className="flex items-center justify-between text-label text-stone/55 mb-10">
            <span>/ Next entry</span>
            <span>{next.category}</span>
          </div>
          <Link href={`/journal/${next.slug}`} className="block group/next">
            <h2 className="text-display leading-[0.95]">
              {next.title.split(" ").slice(0, 4).join(" ")}
              <br />
              <span className="italic font-extralight">
                {next.title.split(" ").slice(4).join(" ")}
              </span>
            </h2>
            <p className="text-body text-stone/70 max-w-md mt-8">
              {next.excerpt}
            </p>
            <div className="mt-12">
              <ButtonLink href={`/journal/${next.slug}`} variant="ink">
                Read entry
              </ButtonLink>
            </div>
          </Link>
        </div>
      </section>
    </article>
  );
}
