"use client";

import {
  motion,
  useScroll,
  useTransform,
  useVelocity,
  useSpring,
  useReducedMotion,
  useMotionTemplate,
  useInView,
} from "motion/react";
import { useRef } from "react";
import { SplitText } from "@/components/ui/SplitText";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";
import { easeBrand } from "@/lib/motion/easings";

const HERO_IMAGE_DEFAULT =
  "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=2400&q=85";

type HeroCms = {
  eyebrow?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  description?: string;
  bottomLabel?: string;
  image?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export function Hero({ cms }: { cms?: HeroCms } = {}) {
  const image = cms?.image || HERO_IMAGE_DEFAULT;
  const eyebrow = cms?.eyebrow ?? "Lineamode Apparel · Est. Islamabad";
  const headlineLine1 = cms?.headlineLine1 ?? "From Idea";
  const headlineLine2 = cms?.headlineLine2 ?? "to Execution.";
  const description = cms?.description ?? "Knitwear · Performance Polyester · Soft Wovens";
  const bottomLabel = cms?.bottomLabel ?? "Design / Development / Manufacture";
  const primaryCta = cms?.primaryCta ?? { label: "What we do", href: "/capabilities" };
  const secondaryCta =
    cms?.secondaryCta?.href === "/start"
      ? { label: "Contact Us", href: "/contact" }
      : (cms?.secondaryCta ?? { label: "Contact Us", href: "/contact" });
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Visibility gate. Once the hero leaves the viewport we let the entire
  // filter pipeline collapse to a no-op so:
  //   — Safari stops paying for an off-screen filter graph (fixes the
  //     "laggy when scrolling past hero" report).
  //   — Chrome / any other compositor doesn't carry will-change: filter on
  //     a layer that's no longer painted.
  const inView = useInView(sectionRef, { margin: "0px 0px 0px 0px" });

  // Scroll-velocity-driven glass distortion. We use plain CSS filters
  // (blur + saturate) and a tiny scale wobble — all of which are pure
  // compositor operations on every modern engine, so the result is
  // identical in Chrome and Safari and gets GPU-accelerated for free.
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, {
    damping: 28,
    stiffness: 220,
    mass: 0.5,
  });

  // Magnitude of the effect, derived from |scroll velocity|. Capped so a
  // fast flick can't blur the image into a soup.
  const blurPx = useTransform(smooth, (v) =>
    !inView || reduce ? 0 : Math.min(8, Math.abs(v) / 240),
  );
  const saturate = useTransform(smooth, (v) =>
    !inView || reduce ? 1 : 1 + Math.min(0.18, Math.abs(v) / 6000),
  );
  const wobble = useTransform(smooth, (v) =>
    !inView || reduce ? 1 : 1 + Math.min(0.012, Math.abs(v) / 90000),
  );

  // Compose the CSS filter shorthand. useMotionTemplate keeps this on the
  // motion thread, so the value is written straight to the layer without
  // going through React render.
  const filter = useMotionTemplate`blur(${blurPx}px) saturate(${saturate})`;

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] min-h-[640px] overflow-hidden text-stone"
    >
      {/* Background image stack.
            Outer wrapper  → handles the one-shot intro reveal (opacity + zoom).
            Inner wrapper  → carries the continuous, scroll-velocity driven
                              CSS filter and a faint scale wobble.
          Splitting them avoids two animations fighting over the same `scale`
          on a single node, and keeps both layers on their own GPU surface. */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: easeBrand, delay: 0.2 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            filter,
            scale: wobble,
            willChange: "filter, transform",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt="Editorial garment study — Lineamode Apparel"
            className="h-full w-full object-cover object-[center_25%]"
            draggable={false}
          />
        </motion.div>
      </motion.div>

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
          <h1 className="text-display leading-[0.92] max-w-5xl">
            <span className="block">
              <SplitText by="word" stagger={0.06} duration={1.1}>
                {headlineLine1}
              </SplitText>
            </span>
            <span className="block italic font-extralight">
              <SplitText by="word" stagger={0.06} duration={1.1} delay={0.25}>
                {headlineLine2}
              </SplitText>
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeBrand, delay: 0.7 }}
            className="flex flex-wrap items-center gap-3"
          >
            {/* Primary CTA — solid stone pill, ink text, force-coloured
                with a literal class so it never inherits the section's
                `text-stone` default. */}
            <ButtonLink
              href={primaryCta.href}
              variant="ink"
              className="!text-ink bg-stone hover:bg-stone/90"
            >
              {primaryCta.label}
            </ButtonLink>

            {/* Secondary — outlined pill on stone hairline, stone text. */}
            <ButtonLink
              href={secondaryCta.href}
              variant="ghost"
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
