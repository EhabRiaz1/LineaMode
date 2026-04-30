"use client";

import { motion } from "motion/react";
import { SplitText } from "@/components/ui/SplitText";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { GridPattern } from "@/components/ui/GridPattern";
import { easeBrand } from "@/lib/motion/easings";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex flex-col justify-end pt-32 pb-16 overflow-hidden">
      {/* Faint Linear Grid backdrop */}
      <GridPattern
        className="absolute inset-0 text-ink opacity-[0.06]"
        density={32}
        disruption
      />

      <div className="shell relative z-10 grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 md:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeBrand, delay: 0.1 }}
          >
            <Eyebrow number="01">Lineamode Apparel · Est. Islamabad</Eyebrow>
          </motion.div>

          <h1 className="text-display mt-8">
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
        </div>

        <div className="col-span-12 md:col-span-4 md:col-start-9 self-end">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easeBrand, delay: 0.7 }}
            className="flex flex-col gap-7"
          >
            <p className="text-body text-ink/75 max-w-sm">
              An end-to-end apparel partner for brands that move fast.
              Specialists in knitwear and performance polyesters — with a lean
              supply chain built for low MOQ, high-mix product calendars.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <ButtonLink href="/capabilities" variant="primary">
                What we do
              </ButtonLink>
              <ButtonLink href="/contact" variant="ghost">
                Start a project
              </ButtonLink>
            </div>
          </motion.div>
        </div>

        <div className="col-span-12 mt-20 flex items-end justify-between text-label text-ink/55">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            Design / Development / Manufacture
          </motion.span>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4, ease: easeBrand }}
            className="flex items-center gap-2"
            aria-hidden
          >
            <span>Scroll</span>
            <span className="block h-px w-12 bg-ink/40" />
          </motion.div>
        </div>
      </div>

      {/* Scrolling fabric-macro placeholder — uses imagery from Unsplash via next/image
          remotePatterns. Swap to brand video when available. */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: easeBrand, delay: 0.4 }}
        className="absolute right-0 bottom-0 -z-0 hidden lg:block w-[36vw] aspect-[3/4] overflow-hidden ring-1 ring-ink/15"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1600&q=80"
          alt="Performance knitwear fabric macro"
          className="w-full h-full object-cover"
        />
      </motion.div>
    </section>
  );
}
