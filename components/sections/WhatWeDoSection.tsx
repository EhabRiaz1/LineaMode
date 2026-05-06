"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { capabilities } from "@/content/capabilities";
import { easeBrand } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

const CYCLE_MS = 5000;

export function WhatWeDoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: "-15% 0px -15% 0px" });

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    if (!inView || paused) return;
    const t = window.setTimeout(() => {
      setActive((i) => (i + 1) % capabilities.length);
      setCycleKey((k) => k + 1);
    }, CYCLE_MS);
    return () => window.clearTimeout(t);
  }, [inView, paused, cycleKey, active]);

  const onSelect = (i: number) => {
    setActive(i);
    setCycleKey((k) => k + 1);
  };

  const item = capabilities[active];

  return (
    <section
      ref={sectionRef}
      className="relative bg-stone text-ink py-32 md:py-44"
    >
      <div className="shell">
        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-12 md:col-span-5">
            <Eyebrow number="01">What we do</Eyebrow>
            <h2 className="text-h1 mt-6">
              One studio,
              <br />
              <span className="italic font-extralight">five disciplines.</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-12">
          {/* Tab list — hover handlers live here so vertical scrolling
              past the section never accidentally pauses the cycle. */}
          <ul
            className="col-span-12 md:col-span-5 flex flex-col"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            {capabilities.map((c, i) => (
              <li key={c.slug} className="relative">
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
                    <span className="text-label text-ink/40">/ {c.number}</span>
                    <span className="text-h2">{c.title}</span>
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

                {/* Hairline + progress fill */}
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
                    animate={
                      paused || !inView
                        ? { scaleX: 0 }
                        : { scaleX: 1 }
                    }
                    transition={{
                      duration: paused || !inView ? 0 : CYCLE_MS / 1000,
                      ease: "linear",
                    }}
                    style={{ width: "100%" }}
                  />
                ) : null}
              </li>
            ))}
          </ul>

          {/* Detail — sticky right column, mirrors ValuesSection's
              behaviour so the panel locks at top-32 once it reaches it. */}
          <div className="col-span-12 md:col-span-6 md:col-start-7 relative">
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeBrand }}
              className="md:sticky md:top-32"
            >
              <p className="text-eyebrow text-ink/45 mb-6">
                Discipline / {item.number}
              </p>
              <p className="text-h2 font-sans font-light leading-tight max-w-xl">
                {item.short}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
