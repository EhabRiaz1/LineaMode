"use client";

import { useRef, useLayoutEffect } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { capabilities } from "@/content/capabilities";

/**
 * Editorial photography per discipline. Each image is intentionally
 * brand-toned (warm neutrals or B&W) and is read through a dark scrim,
 * so it functions as atmosphere rather than a literal product shot.
 *   — design-support       → multi-garment rack (range / merchandised line)
 *   — product-development  → flatlay with fabric + garment in development
 *   — fabric-sourcing      → cable-knit rack — fabric texture is the subject
 *   — manufacturing        → single garment on hanger (production output)
 *   — merchandising        → B&W storefront grid (retail planning, mannequins)
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
 * Pinned horizontal scroll rail for the capability deck.
 *   — Desktop (md+): GSAP ScrollTrigger pins the section and translates
 *     the track horizontally as the user scrolls vertically.
 *   — Mobile: GSAP is skipped; the track lives inside a native
 *     `overflow-x-auto` scroller with CSS snap so every card is reachable.
 */
export function CapabilitiesRail() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let ctx: { revert: () => void } | null = null;
    let mounted = true;

    (async () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      if (isMobile) return;

      const gsapModule = await import("gsap");
      const stModule = await import("gsap/ScrollTrigger");
      if (!mounted) return;

      const gsap = gsapModule.default || gsapModule.gsap;
      const ScrollTrigger = stModule.ScrollTrigger || stModule.default;
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      ctx = gsap.context(() => {
        const distance = track.scrollWidth - window.innerWidth + 80;
        gsap.to(track, {
          x: -distance,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance + 40}`,
            scrub: 0.6,
            pin: true,
            /** Avoid reparenting pinned nodes outside React's tree (fixes removeChild errors on route change). */
            pinReparent: false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      }, section);
    })();

    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-stone py-20 md:py-24 overflow-hidden"
    >
      <div className="shell flex items-end justify-between gap-12 mb-10 md:mb-14">
        <div className="max-w-2xl">
          <Eyebrow number="03">Capabilities</Eyebrow>
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

      {/* Wrapper:
            mobile  → native horizontal scroller w/ CSS snap.
            desktop → unconstrained, GSAP transforms the inner track. */}
      <div className="overflow-x-auto md:overflow-visible scroll-smooth snap-x snap-mandatory md:snap-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          ref={trackRef}
          className="flex gap-6 md:gap-10 px-[var(--shell-pad-x)] will-change-transform"
          style={{ width: "max-content" }}
        >
          {capabilities.map((c) => {
            const image = CAPABILITY_IMAGES[c.slug];
            return (
              <article
                key={c.slug}
                className="relative shrink-0 snap-start w-[86vw] md:w-[58vw] lg:w-[40vw] h-[clamp(440px,68vh,580px)] md:h-[clamp(420px,58vh,560px)] overflow-hidden ring-1 ring-ink/15 text-stone"
              >
                {/* Background photograph */}
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

                {/* Scrim stack — bottom-weighted so titles and bullets sit on
                    the darkest area of the gradient. The faint blur keeps
                    rich photography from competing with the type. */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/55 to-ink/20"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 backdrop-blur-[2px] backdrop-saturate-110"
                />

                {/* Content */}
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
