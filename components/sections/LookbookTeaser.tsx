"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { easeBrand } from "@/lib/motion/easings";

export function LookbookTeaser() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={ref} className="relative h-[110vh] overflow-hidden bg-ink text-stone">
      <motion.div className="absolute inset-0" style={{ y }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2400&q=80"
          alt="Lookbook editorial preview"
          className="w-full h-full object-cover opacity-65"
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/30 to-ink/40" />

      <div className="shell relative z-10 h-full flex flex-col justify-between py-20">
        <div className="flex items-start justify-between gap-6">
          <Eyebrow number="07" className="text-stone/70">
            Lookbook '26
          </Eyebrow>
          <p className="text-label text-stone/70 hidden md:block">
            FW '26 · Performance Knit Edit
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.9, ease: easeBrand }}
          className="max-w-3xl"
        >
          <h2 className="text-display leading-[0.92]">
            The studio,
            <br />
            <span className="italic font-extralight">in season.</span>
          </h2>
          <p className="text-body text-stone/80 max-w-md mt-8">
            A curated edit of the studio's knitwear and performance polyester
            development for the '26 calendar — laid out as a long-form
            editorial.
          </p>

          <div className="mt-10 flex items-center gap-3">
            <ButtonLink href="/lookbook" variant="ink">
              Open the Lookbook
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
