"use client";

import {
  motion,
  useScroll,
  useTransform,
  useVelocity,
  useSpring,
  useReducedMotion,
} from "motion/react";
import { useId } from "react";
import { SplitText } from "@/components/ui/SplitText";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";
import { easeBrand } from "@/lib/motion/easings";

/**
 * Hero photo. Lineamode is a B2B partner to luxury fashion houses, so the
 * hero must read as "design-led" rather than industrial. This frame:
 *   — sits exactly on the brand palette (Chalk Sand cream, Carbon Ink, a
 *     single touch of Terracotta on the rose),
 *   — leaves headroom on the top-left for the display type and on the
 *     right for the glass card,
 *   — and the lone red detail mirrors the deck's "controlled disruption"
 *     principle: a precise framework, one intentional break.
 *
 * Easy to swap — see IMAGE_NOTES.md.
 */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=2400&q=85";

export function Hero() {
  const reduce = useReducedMotion();

  // Scroll-velocity-driven ripple. The displacement filter is always
  // applied with a tiny baseline (gives the image a subtle glassiness),
  // and the magnitude scales with how fast the user is scrolling.
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, {
    damping: 28,
    stiffness: 220,
    mass: 0.5,
  });
  const rippleScale = useTransform(smooth, (v) =>
    reduce ? 0 : Math.min(58, Math.abs(v) / 60) + 3,
  );

  // Unique filter id so multiple Hero instances (or dev HMR) don't collide.
  const filterId = `hero-ripple-${useId().replace(/[:]/g, "")}`;

  return (
    <section className="relative h-[100svh] min-h-[640px] overflow-hidden text-stone">
      {/* Off-screen SVG defining the ripple filter */}
      <svg
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        aria-hidden
      >
        <defs>
          <filter
            id={filterId}
            x="-5%"
            y="-5%"
            width="110%"
            height="110%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.011 0.018"
              numOctaves="2"
              seed="3"
              stitchTiles="stitch"
            />
            <motion.feDisplacementMap
              in="SourceGraphic"
              scale={rippleScale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Background image, ripple-distorted */}
      <motion.div
        className="absolute inset-0"
        style={{
          filter: `url(#${filterId})`,
          willChange: "filter",
        }}
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: easeBrand, delay: 0.2 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt="Editorial garment study — Lineamode Apparel"
          className="h-full w-full object-cover object-[center_25%]"
          draggable={false}
        />
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
            Lineamode Apparel · Est. Islamabad
          </Eyebrow>
          <p className="hidden md:block text-label text-stone/65">
            Knitwear · Performance Polyester · Soft Wovens
          </p>
        </motion.div>

        {/* Title + CTAs — no card. The buttons sit directly in the hero
            and are styled explicitly for the dark backdrop so the text
            never inherits the section's stone-on-stone defaults. */}
        <div className="flex flex-col gap-8 md:gap-10">
          <h1 className="text-display leading-[0.92] max-w-5xl">
            <span className="block">
              <SplitText by="word" stagger={0.06} duration={1.1}>
                From Idea
              </SplitText>
            </span>
            <span className="block italic font-extralight">
              <SplitText by="word" stagger={0.06} duration={1.1} delay={0.25}>
                to Execution.
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
              href="/capabilities"
              variant="ink"
              className="!text-ink bg-stone hover:bg-stone/90"
            >
              What we do
            </ButtonLink>

            {/* Secondary — outlined pill on stone hairline, stone text. */}
            <ButtonLink
              href="/contact"
              variant="ghost"
              className="!text-stone ring-stone/45 hover:bg-stone/10"
            >
              Start a project
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
          <span>Design / Development / Manufacture</span>
          <span className="hidden md:flex items-center gap-2">
            Scroll
            <span className="block h-px w-12 bg-stone/40" />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
