"use client";

import { motion } from "motion/react";
import { SplitText } from "@/components/ui/SplitText";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";
import { easeBrand } from "@/lib/motion/easings";
import { CONTACT_FORM_HREF, resolveContactHref } from "@/lib/navigation";
import type { CmsImageValue } from "@/lib/cms/cms-image";
import { HeroBackground } from "@/components/sections/HeroBackground";

const HERO_IMAGE_DEFAULT =
  "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=2400&q=85";

type HeroCms = {
  eyebrow?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  description?: string;
  bottomLabel?: string;
  image?: CmsImageValue;
  mediaMode?: "image" | "video";
  video?: CmsImageValue;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export function Hero({ cms }: { cms?: HeroCms } = {}) {
  const mediaMode = cms?.mediaMode ?? "image";
  const image =
    mediaMode === "video"
      ? (cms?.image ?? "")
      : (cms?.image ?? HERO_IMAGE_DEFAULT);
  const eyebrow = cms?.eyebrow ?? "Lineamode Apparel · Est. Islamabad";
  const headlineLine1 = cms?.headlineLine1 ?? "From Idea";
  const headlineLine2 = cms?.headlineLine2 ?? "to Execution.";
  const description = cms?.description ?? "Knitwear · Performance Polyester · Soft Wovens";
  const bottomLabel = cms?.bottomLabel ?? "Design / Development / Manufacture";
  const primaryCta = cms?.primaryCta ?? { label: "What we do", href: "/capabilities" };
  const secondaryCtaRaw =
    cms?.secondaryCta?.href === "/start"
      ? { label: "Start a project", href: CONTACT_FORM_HREF }
      : (cms?.secondaryCta ?? { label: "Start a project", href: CONTACT_FORM_HREF });
  const secondaryCta = {
    ...secondaryCtaRaw,
    href: resolveContactHref(secondaryCtaRaw.href),
  };
  return (
    <section className="relative h-[100svh] min-h-[640px] overflow-hidden text-stone">
      <HeroBackground
        image={image}
        video={cms?.video}
        mediaMode={mediaMode}
      />

      {/* Layered overlays for legibility (kept outside the filter so they
          don't ripple). The left-side scrim is what lets the white display
          type sit on top of a light editorial frame without losing contrast. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-ink/65 via-ink/15 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink/35 via-transparent to-ink/75"
      />
      {/* A faint Carbon-Ink wash that pulls everything onto the brand palette. */}
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-multiply bg-ink/[0.08]"
      />

      {/* Faint Linear Grid */}
      <GridPattern
        className="absolute inset-0 text-stone opacity-[0.06]"
        density={32}
        disruption
      />

      {/* Content */}
      <div className="shell relative z-10 flex h-full flex-col justify-between pt-28 pb-12 md:pt-32 md:pb-14">
        {/* Top row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeBrand, delay: 0.4 }}
          className="flex items-start justify-between gap-6 text-stone"
        >
          <Eyebrow number="01" className="text-stone/85">
            {eyebrow}
          </Eyebrow>
          <p className="hidden md:block text-label text-stone/65">
            {description}
          </p>
        </motion.div>

        {/* Title + CTAs — no card. The buttons sit directly in the hero
            and are styled explicitly for the dark backdrop so the text
            never inherits the section's stone-on-stone defaults. */}
        <div className="flex flex-col gap-8 md:gap-10">
          <h1 className="text-[clamp(2.35rem,5.5vw+0.65rem,6.75rem)] md:text-[clamp(1.058rem,calc((5.5vw+0.65rem)*0.45),3.038rem)] font-mono font-light tracking-[-0.02em] leading-[0.95] max-w-5xl">
            <span className="block">
              <SplitText by="word" stagger={0.06} duration={1.1}>
                {headlineLine1}
              </SplitText>
            </span>
            <span className="block font-extralight">
              <SplitText by="word" stagger={0.06} duration={1.1} delay={0.25}>
                {headlineLine2}
              </SplitText>
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeBrand, delay: 0.7 }}
            className="flex flex-wrap items-center gap-3 [&_a]:max-md:h-[calc(2.75rem*0.85)] [&_a]:max-md:px-[calc(1.25rem*0.85)] [&_a]:max-md:text-[calc(0.75rem*0.85)]"
          >
            {/* Primary CTA — solid stone pill, ink text, force-coloured
                with a literal class so it never inherits the section's
                `text-stone` default. */}
            <ButtonLink
              href={primaryCta.href}
              variant="ink"
              plain
              className="!text-ink bg-stone hover:bg-stone/90"
            >
              {primaryCta.label}
            </ButtonLink>

            {/* Secondary — outlined pill on stone hairline, stone text. */}
            <ButtonLink
              href={secondaryCta.href}
              variant="ghost"
              plain
              className="!text-stone ring-stone/45 hover:bg-stone/10"
            >
              {secondaryCta.label}
            </ButtonLink>
          </motion.div>
        </div>

        {/* Bottom row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeBrand, delay: 1.4 }}
          className="flex items-end justify-between text-label text-stone/65"
        >
          <span>{bottomLabel}</span>
        </motion.div>
      </div>
    </section>
  );
}
