"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { capabilities } from "@/content/capabilities";

/**
 * Editorial photography per discipline. Each image is intentionally
 * brand-toned (warm neutrals or B&W) and is read through a dark scrim,
 * so it functions as atmosphere rather than a literal product shot.
 */
const CAPABILITY_IMAGES: Record<string, string> = {
  "design-support":
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80",
  "textile-sourcing":
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80",
  production:
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1400&q=80",
  merchandising:
    "https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=1400&q=80",
};

/**
 * Auto-bouncing horizontal carousel (last section before the footer).
 *
 *   — While the section is in view, a rAF loop drives `scrollLeft` on
 *     the wrapper; when we hit either edge we flip direction so the
 *     rail bounces back and forth.
 *   — Page scroll is never locked: the section sits inline.
 *   — User input (pointer down, touch, horizontal wheel/trackpad
 *     gesture) pauses the autoplay for a short cool-down so the user
 *     never fights the loop. Autoplay resumes after they stop.
 */
const PIXELS_PER_SECOND = 60;
const USER_COOLDOWN_MS = 20000;

type CapabilitiesCms = {
  headline?: string;
  headlineItalic?: string;
};

type CapabilityItem = { title: string; short: string; image?: string };

export function CapabilitiesRail({
  cms,
  items,
}: {
  cms?: CapabilitiesCms;
  items?: CapabilityItem[];
} = {}) {
  const headline = cms?.headline ?? "One studio.";
  const headlineItalic = cms?.headlineItalic ?? "Every step in motion.";

  const displayCapabilities = capabilities.map((c, i) => ({
    ...c,
    title: items?.[i]?.title ?? c.title,
    short: items?.[i]?.short ?? c.short,
    overrideImage: items?.[i]?.image || undefined,
  }));
  const [isAtEnd, setIsAtEnd] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const userPauseUntilRef = useRef(0);
  const inView = useInView(sectionRef, {
    margin: "0px 0px -10% 0px",
  });

  const pauseAutoScroll = useCallback(() => {
    userPauseUntilRef.current = performance.now() + USER_COOLDOWN_MS;
  }, []);

  const updateEdgeState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;
    setIsAtEnd(max > 0 && el.scrollLeft >= max - 8);
  }, []);

  const scrollNext = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    pauseAutoScroll();

    const track = el.firstElementChild as HTMLElement | null;
    const card = track?.firstElementChild as HTMLElement | null;
    const gap = track
      ? Number.parseFloat(window.getComputedStyle(track).columnGap || "0")
      : 0;
    const amount = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.8;
    const max = el.scrollWidth - el.clientWidth;
    const atEnd = el.scrollLeft >= max - 8;
    const next = atEnd ? 0 : Math.min(el.scrollLeft + amount, max);

    el.scrollTo({ left: next, behavior: "smooth" });
    setIsAtEnd(!atEnd && next >= max - 8);
  }, [pauseAutoScroll]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateEdgeState();
    el.addEventListener("scroll", updateEdgeState, { passive: true });
    window.addEventListener("resize", updateEdgeState, { passive: true });

    return () => {
      el.removeEventListener("scroll", updateEdgeState);
      window.removeEventListener("resize", updateEdgeState);
    };
  }, [updateEdgeState]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const el = scrollerRef.current;
    if (!el) return;

    let raf = 0;
    let last = performance.now();
    let direction = 1;
    const onWheel = (e: WheelEvent) => {
      // Only treat horizontal wheel/trackpad gestures as user input,
      // so vertical page scrolling over the rail doesn't kill autoplay.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) pauseAutoScroll();
    };

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      const max = el.scrollWidth - el.clientWidth;
      if (inView && max > 0 && now > userPauseUntilRef.current) {
        let next = el.scrollLeft + PIXELS_PER_SECOND * dt * direction;
        if (next >= max) {
          next = max;
          direction = -1;
        } else if (next <= 0) {
          next = 0;
          direction = 1;
        }
        el.scrollLeft = next;
      }

      raf = requestAnimationFrame(tick);
    };

    el.addEventListener("pointerdown", pauseAutoScroll, { passive: true });
    el.addEventListener("touchstart", pauseAutoScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: true });

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", pauseAutoScroll);
      el.removeEventListener("touchstart", pauseAutoScroll);
      el.removeEventListener("wheel", onWheel);
    };
  }, [inView, pauseAutoScroll]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-stone py-20 md:py-24 overflow-hidden"
    >
      <div className="shell flex items-end justify-between gap-12 mb-10 md:mb-14">
        <div className="max-w-2xl">
          <Eyebrow number="07">Capabilities</Eyebrow>
          <h2 className="text-h1 mt-6">
            {headline}
            <br />
            <span className="italic font-extralight">{headlineItalic}</span>
          </h2>
        </div>
        <p className="hidden md:block text-label text-ink/55">
          Scroll · 04 disciplines
        </p>
      </div>

      {/* Native horizontal scroll container. The auto-loop drives
          scrollLeft directly so the user can take over at any moment. */}
      <div className="relative">
        <div
          ref={scrollerRef}
          className="overflow-x-auto cursor-grab active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div
            className="flex gap-6 md:gap-10 px-[var(--shell-pad-x)] will-change-transform"
            style={{ width: "max-content" }}
          >
            {displayCapabilities.map((c) => {
              const image = c.overrideImage ?? CAPABILITY_IMAGES[c.slug];
              return (
                <article
                  key={c.slug}
                  className="relative shrink-0 w-[86vw] md:w-[58vw] lg:w-[40vw] h-[clamp(440px,68vh,580px)] md:h-[clamp(420px,58vh,560px)] overflow-hidden ring-1 ring-ink/15 text-stone"
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : null}

                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/55 to-ink/20"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 backdrop-blur-[2px] backdrop-saturate-110"
                  />

                  <div className="absolute inset-0 p-7 md:p-9 flex flex-col justify-between">
                    <div className="flex justify-between text-label text-stone/75">
                      <span>/ {c.number}</span>
                      <span>{c.slug}</span>
                    </div>

                    <div>
                      <h3 className="text-h2 mb-3 max-w-md">{c.title}</h3>
                      <p className="text-body text-stone/85 max-w-sm mb-5">
                        {c.short}
                      </p>
                      <ul className="grid grid-cols-1 gap-1.5 text-label text-stone/80">
                        {c.bullets.slice(0, 4).map((b) => (
                          <li key={b} className="flex gap-2">
                            <span className="text-stone/45">—</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-28 items-center justify-end bg-gradient-to-l from-stone/60 via-stone/20 to-transparent pr-4 backdrop-blur-md [mask-image:linear-gradient(to_left,black_0%,black_45%,transparent_100%)] md:flex lg:w-36 lg:pr-6">
          <button
            type="button"
            onClick={scrollNext}
            aria-label={isAtEnd ? "Return to first capability" : "Show next capability"}
            className="pointer-events-auto inline-flex size-12 items-center justify-center rounded-full bg-ink text-stone shadow-[0_16px_48px_rgba(32,28,29,0.22)] transition-all duration-500 hover:bg-ink/85 hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-stone"
          >
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className={`size-4 transition-transform duration-500 ${isAtEnd ? "rotate-180" : ""}`}
              fill="none"
            >
              <path
                d="M3 8h10m-4-4 4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
