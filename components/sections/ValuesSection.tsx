"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Marquee } from "@/components/ui/Marquee";
import { values } from "@/content/values";
import { easeBrand } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

export function ValuesSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative bg-stone text-ink py-32 md:py-44">
      <div className="shell">
        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-12 md:col-span-5">
            <Eyebrow number="06">Values</Eyebrow>
            <h2 className="text-h1 mt-6">
              Five principles
              <br />
              <span className="italic font-extralight">we operate by.</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Marquee strip */}
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

      <div className="shell">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-5 flex flex-col">
            {values.map((v, i) => (
              <button
                key={v.number}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                className={cn(
                  "group flex items-center justify-between text-left py-5 border-b border-ink/15 transition-colors",
                  active === i ? "text-ink" : "text-ink/55 hover:text-ink/85",
                )}
              >
                <span className="flex items-baseline gap-5">
                  <span className="text-label text-ink/40">/ {v.number}</span>
                  <span className="text-h2">{v.title}</span>
                </span>
                <motion.span
                  aria-hidden
                  className="size-2 rounded-full bg-current"
                  animate={{
                    scale: active === i ? 1.4 : 0.6,
                    opacity: active === i ? 1 : 0.4,
                  }}
                  transition={{ duration: 0.4, ease: easeBrand }}
                />
              </button>
            ))}
          </div>

          <div className="col-span-12 md:col-span-6 md:col-start-7 relative min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={values[active].number}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
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
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
