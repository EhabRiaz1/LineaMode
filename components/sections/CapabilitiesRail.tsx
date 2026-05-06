"use client";

import { useEffect, useRef } from "react";
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
  "product-development":
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1400&q=80",
  "fabric-sourcing":
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80",
  "manufacturing":
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1400&q=80",
  "merchandising":
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
const USER_COOLDOWN_MS = 2000;

export function CapabilitiesRail() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, {
    margin: "0px 0px -10% 0px",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const el = scrollerRef.current;
    if (!el) return;

    let raf = 0;
    let last = performance.now();
    let direction = 1;
    let userPauseUntil = 0;

    const flagUser = () => {
      userPauseUntil = performance.now() + USER_COOLDOWN_MS;
    };
    const onWheel = (e: WheelEvent) => {
      // Only treat horizontal wheel/trackpad gestures as user input,
      // so vertical page scrolling over the rail doesn't kill autoplay.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) flagUser();
    };

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      const max = el.scrollWidth - el.clientWidth;
      if (inView && max > 0 && now > userPauseUntil) {
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

    el.addEventListener("pointerdown", flagUser, { passive: true });
    el.addEventListener("touchstart", flagUser, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: true });

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", flagUser);
      el.removeEventListener("touchstart", flagUser);
      el.removeEventListener("wheel", onWheel);
    };
  }, [inView]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-stone py-20 md:py-24 overflow-hidden"
    >
      <div className="shell flex items-end justify-between gap-12 mb-10 md:mb-14">
        <div className="max-w-2xl">
          <Eyebrow number="08">Capabilities</Eyebrow>
          <h2 className="text-h1 mt-6">
            One studio.
            <br />
            <span className="italic font-extralight">Every step in motion.</span>
          </h2>
        </div>
        <p className="hidden md:block text-label text-ink/55">
          Drag · Scroll · 05 disciplines
        </p>
      </div>

      {/* Native horizontal scroll container. The auto-loop drives
          scrollLeft directly so the user can take over at any moment. */}
      <div
        ref={scrollerRef}
        className="overflow-x-auto cursor-grab active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          className="flex gap-6 md:gap-10 px-[var(--shell-pad-x)] will-change-transform"
          style={{ width: "max-content" }}
        >
          {capabilities.map((c) => {
            const image = CAPABILITY_IMAGES[c.slug];
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
    </section>
  );
}
