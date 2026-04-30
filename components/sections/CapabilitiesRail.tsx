"use client";

import { useRef, useEffect } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { capabilities } from "@/content/capabilities";

/**
 * Pinned horizontal scroll rail for the capability deck.
 * Uses GSAP's ScrollTrigger via dynamic import so it stays out of the
 * server bundle.
 */
export function CapabilitiesRail() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    <section ref={sectionRef} className="relative bg-stone py-32 overflow-hidden">
      <div className="shell flex items-end justify-between gap-12 mb-16">
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

      <div
        ref={trackRef}
        className="flex gap-6 md:gap-10 px-[var(--shell-pad-x)] will-change-transform"
        style={{ width: "max-content" }}
      >
        {capabilities.map((c) => (
          <article
            key={c.slug}
            className="relative shrink-0 w-[88vw] md:w-[44vw] lg:w-[36vw] aspect-[3/4] overflow-hidden ring-1 ring-ink/15 bg-ink/[0.02]"
          >
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between">
              <div className="flex justify-between text-label text-ink/60">
                <span>/ {c.number}</span>
                <span>{c.slug}</span>
              </div>

              <div>
                <h3 className="text-h2 mb-4 max-w-md">{c.title}</h3>
                <p className="text-body text-ink/70 max-w-sm">{c.short}</p>
                <ul className="mt-8 grid grid-cols-1 gap-1.5 text-label text-ink/65">
                  {c.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="text-ink/40">—</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
