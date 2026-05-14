import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";

type JournalCms = {
  eyebrow?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function JournalTeaser({ cms }: { cms?: JournalCms } = {}) {
  const eyebrow = cms?.eyebrow ?? "Journal";
  const headlineLine1 = cms?.headlineLine1 ?? "Stay up to date with the latest news";
  const headlineLine2 = cms?.headlineLine2 ?? "and trends for global fashion and textile";
  const body =
    cms?.body ??
    "Field notes on materials, manufacturing, and the wider industry — written for brands that want context without the noise.";
  const ctaLabel = cms?.ctaLabel ?? "Read the journal";
  const ctaHref = cms?.ctaHref ?? "/journal";

  return (
    <section className="relative overflow-hidden bg-stone py-28 md:py-32">
      <div className="relative z-10 mx-auto max-w-2xl px-5 text-center">
        <Eyebrow number="05">{eyebrow}</Eyebrow>
        <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.05rem,6vw,2.75rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink/90">
          {headlineLine1}
          <span className="block italic font-extralight">{headlineLine2}</span>
        </h2>
        <p className="text-body text-ink/70 mt-6">{body}</p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href={ctaHref} variant="ink" size="sm">
            {ctaLabel}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
