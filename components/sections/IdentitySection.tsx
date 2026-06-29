"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { easeBrand } from "@/lib/motion/easings";
import { CmsImage } from "@/components/ui/CmsImage";
import type { CmsImageValue } from "@/lib/cms/cms-image";

type IdentityCms = {
  eyebrow?: string;
  headline?: string;
  headlineItalic?: string;
  body?: string;
  image?: CmsImageValue;
};

export function IdentitySection({ cms }: { cms?: IdentityCms } = {}) {
  const eyebrow = cms?.eyebrow ?? "Our Identity";
  const headline = cms?.headline ?? "Decades in the studio,";
  const headlineItalic = cms?.headlineItalic ?? "one disciplined line.";
  const body =
    cms?.body ??
    "Lineamode Apparel is a design-led manufacturing partner shaped by years on the floor and in the field — from trend and textile to production and merchandising. We work with global fashion brands that need technical competence, operational agility, and a studio that treats every collection as a long-term collaboration.";
  const image = cms?.image ?? "/images/home/identity-office.jpg";

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      ref={ref}
      className="relative h-[88vh] min-h-[520px] overflow-hidden bg-ink text-stone"
    >
      <motion.div className="absolute inset-0 scale-105" style={{ y }}>
        <CmsImage
          value={image}
          alt="Lineamode studio office"
          className="absolute inset-0 h-full w-full object-cover opacity-75"
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/45 to-ink/30" />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-[-12%] left-[-8%] h-[88%] w-[92%] bg-gradient-to-tr from-ink/78 via-ink/34 to-transparent backdrop-blur-[4px] [mask-image:radial-gradient(ellipse_120%_90%_at_18%_88%,black_0%,transparent_74%)]" />
        <div className="absolute top-[-10%] right-[-6%] h-[72%] w-[88%] bg-gradient-to-bl from-ink/62 via-ink/24 to-transparent backdrop-blur-[5px] [mask-image:radial-gradient(ellipse_115%_85%_at_82%_14%,black_0%,transparent_76%)]" />
        <div className="absolute inset-x-[-10%] bottom-[-18%] h-[58%] bg-gradient-to-t from-ink/55 via-ink/18 to-transparent backdrop-blur-[2px] [mask-image:radial-gradient(ellipse_130%_80%_at_50%_100%,black_0%,transparent_78%)]" />
      </div>

      <div className="shell relative z-10 flex h-full flex-col justify-between py-20 md:py-24">
        <div className="grid w-full grid-cols-12 gap-8 md:gap-12">
          <div className="hidden md:block md:col-span-6 lg:col-span-5" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.9, ease: easeBrand, delay: 0.08 }}
            className="col-span-12 md:col-span-6 lg:col-span-7 md:col-start-7 md:justify-self-end md:text-right"
          >
            <h2 className="max-w-2xl font-mono font-medium tracking-[-0.02em] leading-[1.06] text-[clamp(2rem,3.6vw,3.7rem)] md:ml-auto">
              {headline}{" "}
              <span className="italic">{headlineItalic}</span>
            </h2>
          </motion.div>
        </div>

        <div className="flex w-full flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.9, ease: easeBrand }}
            className="max-w-xl"
          >
            <Eyebrow number="04" className="text-stone/70">
              {eyebrow}
            </Eyebrow>
            <p className="font-display font-normal text-[clamp(0.95rem,0.2vw+0.9rem,1.0625rem)] leading-[1.55] text-stone/80 max-w-xl mt-8">
              {body}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.9, ease: easeBrand, delay: 0.08 }}
            className="md:shrink-0 md:self-end"
          >
            <ButtonLink
              href="/about"
              variant="ink"
              size="sm"
              plain
              className="!text-ink bg-stone hover:bg-stone/90"
            >
              Learn more
            </ButtonLink>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
