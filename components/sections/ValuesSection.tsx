"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Marquee } from "@/components/ui/Marquee";
import { values } from "@/content/values";
import { easeBrand } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

const CYCLE_MS = 5000;

/**
 * Values section.
 *
 * The marquee strip is intentionally kept in the source — wrapped in a
 * `false &&` short-circuit — so we can re-enable it later without
 * re-typing it. The visible UX is an auto-cycling tab pattern with a
 * thin progress bar under the active item. The cycle runs continuously
 * while the section is in view; clicking a tab restarts the timer from
 * that index.
 */
const SHOW_MARQUEE = false;

export function ValuesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: "-15% 0px -15% 0px" });

  const [active, setActive] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => {
      setActive((i) => (i + 1) % values.length);
      setCycleKey((k) => k + 1);
    }, CYCLE_MS);
    return () => window.clearTimeout(t);
  }, [inView, cycleKey, active]);

  const onSelect = (i: number) => {
    setActive(i);
    setCycleKey((k) => k + 1);
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-stone text-ink py-32 md:py-44"
    >
      <div className="shell">
        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-12 md:col-span-5">
            <Eyebrow number="04">Values</Eyebrow>
            <h2 className="text-h1 mt-6">
              Five principles
              <br />
              <span className="italic font-extralight">we operate by.</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Sliding headings — hidden for now, kept in source for re-use. */}
      {SHOW_MARQUEE && (
        <Marquee className="border-y border-ink/10 py-8 mb-16" gap="3rem">
          {values.map((v) => (
            <div
              key={v.number}
              className="flex items-baseline gap-4 text-ink/85 whitespace-nowrap"
            >
              <span className="text-eyebrow text-ink/40">/ {v.number}</span>
              <span className="text-h2 font-display italic font-extralight">
                {v.title}
              </span>
            </div>
          ))}
        </Marquee>
      )}

      <div className="shell">
        <div className="grid grid-cols-12 gap-4 md:gap-12">
          <ul className="col-span-12 md:col-span-5 flex flex-col">
            {values.map((v, i) => (
              <li key={v.number} className="relative">
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  className={cn(
                    "group flex items-center justify-between text-left w-full py-5 transition-colors",
                    active === i ? "text-ink" : "text-ink/50 hover:text-ink/85",
                  )}
                  aria-pressed={active === i}
                >
                  <span className="flex items-baseline gap-5">
                    <span className="text-label text-ink/40">/ {v.number}</span>
                    <span className="text-h2">{v.title}</span>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "text-label transition-opacity",
                      active === i ? "opacity-100" : "opacity-0",
                    )}
                  >
                    →
                  </span>
                </button>

                <span
                  aria-hidden
                  className="absolute left-0 right-0 bottom-0 h-px bg-ink/15"
                />
                {active === i ? (
                  <motion.span
                    aria-hidden
                    key={`bar-${cycleKey}-${i}`}
                    className="absolute left-0 bottom-0 h-px bg-ink origin-left"
                    initial={{ scaleX: 0 }}
                    animate={!inView ? { scaleX: 0 } : { scaleX: 1 }}
                    transition={{
                      duration: !inView ? 0 : CYCLE_MS / 1000,
                      ease: "linear",
                    }}
                    style={{ width: "100%" }}
                  />
                ) : null}
              </li>
            ))}
          </ul>

          <div className="col-span-12 md:col-span-6 md:col-start-7 relative min-h-[280px]">
            <motion.div
              key={values[active].number}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeBrand }}
              className="md:sticky md:top-32"
            >
              <p className="text-eyebrow text-ink/45 mb-6">
                Principle / {values[active].number}
              </p>
              <p className="text-h2 font-sans font-light leading-tight max-w-xl">
                {values[active].description}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
