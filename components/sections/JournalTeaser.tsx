import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import type { JournalSummary } from "@/lib/cms";

type JournalCms = {
  eyebrow?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

function formatJournalDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export function JournalTeaser({
  cms,
  articles = [],
}: {
  cms?: JournalCms;
  articles?: JournalSummary[];
} = {}) {
  const eyebrow = cms?.eyebrow ?? "Journal";
  const headlineLine1 = cms?.headlineLine1 ?? "Stay up to date with the latest news";
  const headlineLine2 = cms?.headlineLine2 ?? "and trends for global fashion and textile";
  const body =
    cms?.body ??
    "Field notes on materials, manufacturing, and the wider industry — written for brands that want context without the noise.";
  const ctaLabel = cms?.ctaLabel ?? "Read the journal";
  const ctaHref = cms?.ctaHref ?? "/journal";

  const recent = articles.slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-stone py-20 md:py-32">
      <div className="shell">
        <div className="grid grid-cols-12 items-start gap-8 md:gap-10">
          <div className="col-span-12 md:col-span-5 lg:col-span-4">
            <Eyebrow number="05">{eyebrow}</Eyebrow>
            <h2 className="mt-5 text-balance font-[family-name:var(--font-display)] text-[clamp(1.85rem,5.5vw,2.75rem)] font-light leading-[1.08] tracking-[-0.02em] text-ink/90">
              {headlineLine1}
              <span className="block italic font-extralight">{headlineLine2}</span>
            </h2>
            <p className="text-body mt-5 max-w-xl text-ink/70 md:mt-6">{body}</p>
            <div className="mt-7 md:mt-8">
              <ButtonLink href={ctaHref} variant="ink" size="sm" plain>
                {ctaLabel}
              </ButtonLink>
            </div>
          </div>

          {recent.length > 0 ? (
            <div className="col-span-12 md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-7">
              <p className="text-eyebrow mb-4 text-ink/45 md:mb-5">/ Recent entries</p>
              <nav aria-label="Recent journal articles">
                <ul className="border-y border-ink/12">
                  {recent.map((article) => (
                    <li key={article.slug} className="border-b border-ink/12 last:border-b-0">
                      <Link
                        href={`/journal/${article.slug}`}
                        className="group grid grid-cols-[1fr_auto] items-start gap-3 py-3.5 transition-colors hover:bg-ink/[0.02] md:grid-cols-[3.25rem_1fr_auto] md:gap-3.5 md:py-4"
                      >
                        <div className="hidden aspect-[4/5] w-[3.25rem] overflow-hidden bg-ink/5 ring-1 ring-ink/10 md:block">
                          {article.cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={article.cover}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-end bg-ink/8 p-2">
                              <span className="text-[0.625rem] uppercase tracking-[0.12em] text-ink/35">
                                {article.category}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-label text-ink/45">
                            <span>{article.category}</span>
                            <span aria-hidden className="text-ink/25">
                              ·
                            </span>
                            <time dateTime={article.date}>{formatJournalDate(article.date)}</time>
                          </div>
                          <h3 className="mt-1 font-sans text-[0.98rem] font-light leading-snug tracking-[-0.015em] text-ink/85 transition-colors group-hover:text-ink md:text-[clamp(0.95rem,0.95vw,1.05rem)]">
                            {article.title}
                          </h3>
                          {article.excerpt ? (
                            <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-ink/50 transition-colors group-hover:text-ink/65">
                              {article.excerpt}
                            </p>
                          ) : null}
                        </div>

                        <span
                          aria-hidden
                          className="mt-1 text-label text-ink/25 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-ink/55"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
