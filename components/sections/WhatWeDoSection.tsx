"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { capabilities } from "@/content/capabilities";
import { easeBrand } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

const CYCLE_MS = 5000;

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

type WhatWeDoCms = {
  eyebrow?: string;
  headlineLine1?: string;
  headlineLine2?: string;
};

type CapabilityItem = { title: string; short: string; image?: string };

export function WhatWeDoSection({
  cms,
  capabilityItems,
}: {
  cms?: WhatWeDoCms;
  capabilityItems?: CapabilityItem[];
} = {}) {
  const eyebrow = cms?.eyebrow ?? "Services";
  const headlineLine1 = cms?.headlineLine1 ?? "What we can do";
  const headlineLine2 = cms?.headlineLine2 ?? "for your fashion brand";

  const displayCapabilities = capabilities.map((c, i) => ({
    ...c,
    title: capabilityItems?.[i]?.title ?? c.title,
    short: capabilityItems?.[i]?.short ?? c.short,
    image: capabilityItems?.[i]?.image || CAPABILITY_IMAGES[c.slug] || "",
  }));
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: "-15% 0px -15% 0px" });

  const [active, setActive] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);
  const [hasManualSelection, setHasManualSelection] = useState(false);

  useEffect(() => {
    if (!inView || hasManualSelection) return;
    const t = window.setTimeout(() => {
      setActive((i) => (i + 1) % displayCapabilities.length);
      setCycleKey((k) => k + 1);
    }, CYCLE_MS);
    return () => window.clearTimeout(t);
  }, [displayCapabilities.length, inView, cycleKey, active, hasManualSelection]);

  const onSelect = (i: number) => {
    setActive(i);
    setHasManualSelection(true);
    setCycleKey((k) => k + 1);
  };

  const item = displayCapabilities[active];

  return (
    <section
      ref={sectionRef}
      className="relative bg-stone text-ink py-32 md:py-44"
    >
      <div className="shell">
        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-12 md:col-span-5">
            <Eyebrow number="02">{eyebrow}</Eyebrow>
            <h2 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(2.25rem,4.5vw,4.75rem)] font-light leading-[1.02] tracking-[-0.02em]">
              <span className="block whitespace-nowrap">{headlineLine1}</span>
              <span className="block whitespace-nowrap italic font-extralight">
                {headlineLine2}
              </span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 md:gap-12 items-start">
            <ul className="col-span-12 md:col-span-6 flex flex-col">
              {displayCapabilities.map((c, i) => (
                <li key={c.slug} className="relative">
                  <button
                    type="button"
                    onClick={() => onSelect(i)}
                    className={cn(
                      "group flex items-center justify-between text-left w-full py-5 transition-colors",
                      active === i
                        ? "text-[#36454F]"
                        : "text-ink/50 hover:text-ink/85",
                    )}
                    aria-pressed={active === i}
                  >
                    <span className="flex items-baseline gap-5">
                      <span
                        className={cn(
                          "text-label transition-colors",
                          active === i ? "text-[#36454F]/70" : "text-ink/40",
                        )}
                      >
                        / {c.number}
                      </span>
                      <span className="text-h2 font-light">{c.title}</span>
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

                  {active === i ? (
                    <motion.div
                      key={`details-${c.slug}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, ease: easeBrand }}
                      className="pb-8"
                    >
                      <div className="md:hidden mb-6 aspect-square overflow-hidden bg-ink/5 ring-1 ring-ink/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.image}
                          alt={c.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="text-[clamp(1.45rem,1.55vw+0.95rem,2.2rem)] font-sans font-light leading-tight max-w-xl">
                        {c.short}
                      </p>
                    </motion.div>
                  ) : null}

                  <span
                    aria-hidden
                    className="absolute left-0 right-0 bottom-0 h-px bg-ink/15"
                  />
                  {active === i && !hasManualSelection ? (
                    <motion.span
                      aria-hidden
                      key={`bar-${cycleKey}-${i}`}
                      className="absolute left-0 bottom-0 h-px origin-left bg-[#36454F]"
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

            <div className="hidden md:block col-span-12 md:col-span-5 md:col-start-8 relative">
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: easeBrand }}
                className="md:sticky md:top-32"
              >
                <div className="aspect-square overflow-hidden bg-ink/5 ring-1 ring-ink/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
        </div>
      </div>
    </section>
  );
}
