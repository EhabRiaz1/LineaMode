"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Image from "next/image";
import { trackStart } from "@/lib/start/analytics";
import { PIPELINE_TYPES } from "@/lib/pipelines/types";
import { PIPELINE_LABELS } from "@/lib/start/schema";
import { easeBrand, dur } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

/**
 * /start — three full-viewport columns.
 *
 * Each tile carries its own display headline (what this door is for); labels at
 * the bottom. Click commits: expand, then letter phase (View Transitions when
 * supported).
 */

type Pipeline = (typeof PIPELINE_TYPES)[number];

type TileHeadline = {
  /** Primary line — what you’re choosing at a glance. */
  lead: string;
  /** Supporting line — clarifies scope before hover detail. */
  accent: string;
};

type TileDef = {
  id: Pipeline;
  index: string;
  title: string;
  headline: TileHeadline;
  caption: string;
  poster: string;
  accentClass: string;
};

const TILES: TileDef[] = [
  {
    id: "design_idea",
    index: "01",
    title: PIPELINE_LABELS.design_idea.title,
    headline: {
      lead: "Just the idea.",
      accent: "Pre-sketch.",
    },
    caption: "Direction first — then design.",
    poster:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2400&q=85",
    accentClass: "from-terracotta/25 via-stone/10 to-stone/30",
  },
  {
    id: "design_scratch",
    index: "02",
    title: PIPELINE_LABELS.design_scratch.title,
    headline: {
      lead: "Brief in hand.",
      accent: "We design it.",
    },
    caption: "Spec → sample → line.",
    poster:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2400&q=85",
    accentClass: "from-moss/25 via-stone/10 to-stone/30",
  },
  {
    id: "manufacture_existing",
    index: "03",
    title: PIPELINE_LABELS.manufacture_existing.title,
    headline: {
      lead: "CAD locked.",
      accent: "We run it.",
    },
    caption: "Quote · timing · floor.",
    poster:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=2400&q=85",
    accentClass: "from-graphite/30 via-stone/10 to-stone/30",
  },
];

const INTRO_TEXT_IN = dur.s * 0.95;
const INTRO_HOLD_MS = 340;
const INTRO_FADE_OUT = dur.m * 0.85;
const INTRO_FALLBACK_MS =
  Math.ceil(INTRO_TEXT_IN * 1000) + INTRO_HOLD_MS + Math.ceil(INTRO_FADE_OUT * 1000) + 500;

/** Expand animation before handing off to the letter flow (seconds). */
const COMMIT_EXPAND_DURATION = 0.74;
const COMMIT_FALLBACK_MS = Math.ceil(COMMIT_EXPAND_DURATION * 1000) + 120;

function startsViewTransition(callback: () => void): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => unknown;
  };
  if (typeof doc.startViewTransition !== "function") return false;
  doc.startViewTransition(callback);
  return true;
}

function tileFlexGrow(
  hovered: Pipeline | null,
  committing: Pipeline | null,
  id: Pipeline,
): number {
  if (committing) {
    return committing === id ? 48 : 0.015;
  }
  if (hovered === null) return 1;
  if (hovered === id) return 2.35;
  return 0.62;
}

export function LoomReel({ onPick }: { onPick: (pipeline: Pipeline) => void }) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<Pipeline | null>(null);
  const [committing, setCommitting] = useState<Pipeline | null>(null);
  const [introDone, setIntroDone] = useState(reduce === true);
  const introFinished = useRef(false);
  const introHoldScheduled = useRef(false);

  useEffect(() => {
    trackStart("landed", { surface: "loom_reel" });
  }, []);

  useLayoutEffect(() => {
    if (reduce || introDone) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [reduce, introDone]);

  useLayoutEffect(() => {
    if (reduce || introDone) return;
    const id = window.setTimeout(() => {
      if (introFinished.current) return;
      introFinished.current = true;
      setIntroDone(true);
    }, INTRO_FALLBACK_MS);
    return () => window.clearTimeout(id);
  }, [reduce, introDone]);

  const finishIntro = useCallback(() => {
    if (introFinished.current) return;
    introFinished.current = true;
    setIntroDone(true);
  }, []);

  const runPick = useCallback(
    (pipeline: Pipeline) => {
      trackStart("pipeline_chosen", { pipeline });
      if (!startsViewTransition(() => onPick(pipeline))) {
        onPick(pipeline);
      }
    },
    [onPick],
  );

  /** After expand animation, hand off to the letter phase (View Transition when supported). */
  useEffect(() => {
    if (!committing || reduce) return;
    const pipeline = committing;
    const id = window.setTimeout(() => runPick(pipeline), COMMIT_FALLBACK_MS);
    return () => window.clearTimeout(id);
  }, [committing, reduce, runPick]);

  const onTilePointerEnter = (id: Pipeline) => {
    if (committing) return;
    setHovered(id);
  };

  const onTilePointerLeave = () => {
    if (committing) return;
    setHovered(null);
  };

  const handleTileClick = (pipeline: Pipeline) => {
    if (committing) return;
    setHovered(null);
    if (reduce) {
      runPick(pipeline);
      return;
    }
    setCommitting(pipeline);
  };

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-ink text-stone">
      <AnimatePresence>
        {!introDone && !reduce && (
          <motion.div
            key="start-intro"
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="fixed inset-0 z-[130] flex items-center justify-center bg-ink"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: INTRO_FADE_OUT, ease: easeBrand },
            }}
            transition={{ duration: INTRO_TEXT_IN * 0.4, ease: easeBrand }}
          >
            <motion.p
              className="text-display text-center text-stone px-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: INTRO_TEXT_IN, ease: easeBrand, delay: 0.08 }}
              onAnimationComplete={() => {
                if (introHoldScheduled.current) return;
                introHoldScheduled.current = true;
                window.setTimeout(() => finishIntro(), INTRO_HOLD_MS);
              }}
            >
              Let&apos;s Begin
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex h-[100svh] w-full flex-col md:flex-row"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: introDone || reduce ? 1 : 0 }}
        transition={{ duration: dur.s, ease: easeBrand }}
      >
        {TILES.map((tile) => {
          const isHoverActive = hovered === tile.id && !committing;
          const grow = tileFlexGrow(hovered, committing, tile.id);
          const isCommitTarget = committing === tile.id;
          const isCommitFade = Boolean(committing && committing !== tile.id);

          return (
            <motion.button
              key={tile.id}
              type="button"
              layout={false}
              initial={{ flexGrow: 1, opacity: 1 }}
              animate={{
                flexGrow: grow,
                opacity: isCommitFade ? 0 : 1,
                scale: isCommitTarget ? 1.02 : 1,
              }}
              transition={{
                duration: committing ? COMMIT_EXPAND_DURATION : 0.65,
                ease: easeBrand,
              }}
              className={cn(
                "group relative min-h-[33.4vh] min-w-0 flex-1 basis-0 overflow-hidden border-stone/25 text-left md:min-h-0",
                "border-b md:border-b-0 md:border-r last:border-b-0 md:last:border-r-0",
                "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
                committing && isCommitTarget && "z-30",
                committing && isCommitFade && "pointer-events-none min-w-0",
              )}
              style={{ zIndex: isCommitTarget ? 30 : isCommitFade ? 0 : 1 }}
              onMouseEnter={() => onTilePointerEnter(tile.id)}
              onMouseLeave={onTilePointerLeave}
              onFocus={() => onTilePointerEnter(tile.id)}
              onBlur={onTilePointerLeave}
              onClick={() => handleTileClick(tile.id)}
              aria-label={`${tile.title}. ${tile.headline.lead} ${tile.headline.accent}`}
              disabled={Boolean(committing)}
            >
              <span aria-hidden className="absolute inset-0 -z-20 bg-stone/90" />
              <Image
                src={tile.poster}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 34vw"
                className="-z-10 object-cover opacity-[0.42] saturate-[0.9] transition-opacity duration-700 group-hover:opacity-[0.55]"
                aria-hidden
                priority
              />
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 -z-[5] bg-gradient-to-b opacity-95",
                  tile.accentClass,
                )}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-[4] bg-gradient-to-t from-ink/85 via-ink/38 to-ink/58"
              />

              <div className="relative flex h-full min-h-0 flex-col justify-between gap-6 p-6 sm:gap-8 sm:p-8 lg:p-10">
                <div className="flex min-h-0 flex-1 flex-col justify-center">
                  <p className="font-[family-name:var(--font-display)] font-light tracking-[-0.025em] leading-[0.92] text-[clamp(1.35rem,min(4.2vw,5vh),4.25rem)] text-stone">
                    {tile.headline.lead}
                    <br />
                    <span className="italic font-extralight">{tile.headline.accent}</span>
                  </p>

                  <motion.div
                    initial={false}
                    animate={{
                      opacity: isHoverActive ? 1 : 0,
                      y: isHoverActive ? 0 : 10,
                    }}
                    transition={{ duration: 0.45, ease: easeBrand }}
                    className={cn(
                      "mt-6 hidden max-w-md text-body text-stone/85 md:block",
                      !isHoverActive && "pointer-events-none",
                    )}
                    aria-hidden={!isHoverActive}
                  >
                    <p>{tile.caption}</p>
                    <p className="mt-6 text-label text-stone/60">
                      Open the letter →
                    </p>
                  </motion.div>
                </div>

                <div className="shrink-0 space-y-4">
                  <p className="text-body text-stone/75 md:hidden">{tile.caption}</p>

                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-stone/20 pt-4 text-stone/65 md:border-t md:pt-5">
                    <span className="font-mono text-eyebrow text-stone/55">
                      / {tile.index}
                    </span>
                    <span className="text-eyebrow tracking-[0.2em]">{tile.title}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
}
