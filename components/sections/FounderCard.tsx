"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import Link from "next/link";
import type { Founder } from "@/content/founders";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * FounderCard — scroll-driven flipping business card.
 *
 *   — A 3D flip is mapped to scroll progress through the section. The
 *     card travels a hair up-and-to-the-left as it flips, so the motion
 *     never feels mechanically locked to a single point.
 *   — Front face: cream/grey panel carrying the LINEAMODE wordmark
 *     (modelled on the supplied business card photograph).
 *   — Back face: ink-black panel with the founder's name, role and
 *     direct contact details.
 *   — Layout alternates left/right per founder via the `reverse` flag.
 *   — Reduced motion: skip rotateY, render the back face statically
 *     so all the contact info is visible without needing to scroll.
 */
export function FounderCard({
  founder,
  index,
  reverse = false,
}: {
  founder: Founder;
  index: number;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Flip is mapped to the *first half* of the section's scroll life
  // so the card is fully revealed while it's still sitting comfortably
  // in the viewport (it would otherwise be exiting at the top before
  // the user ever sees the back face). The drift in x/y uses the same
  // range so the card lands at its final offset alongside the flip.
  const rotateY = useTransform(scrollYProgress, [0.12, 0.45], [0, 180]);
  const x = useTransform(scrollYProgress, [0.12, 0.45], [0, -28]);
  const y = useTransform(scrollYProgress, [0.12, 0.45], [0, -32]);

  return (
    <section
      ref={ref}
      className="relative bg-stone py-32 md:py-44 min-h-[120vh] overflow-hidden border-t hairline"
    >
      <div className="shell grid grid-cols-12 gap-6 md:gap-12 items-start">
        {/* Card column — sticky so the flip plays through scroll */}
        <div
          className={`col-span-12 md:col-span-6 ${
            reverse ? "md:order-2 md:col-start-7" : ""
          }`}
        >
          <div className="md:sticky md:top-32 [perspective:2000px] py-12">
            <motion.div
              className="relative aspect-[1.7/1] w-full max-w-[560px] mx-auto"
              style={
                reduce
                  ? undefined
                  : { rotateY, x, y, transformStyle: "preserve-3d" }
              }
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.8 }}
            >
              {/* Front face — LINEAMODE wordmark on cream/grey */}
              <div
                className="absolute inset-0 rounded-[2px] bg-[#dcdcd8] shadow-[0_30px_60px_-30px_rgba(15,15,12,0.45)] flex items-center justify-center p-10"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                {/* Soft inner panel for depth */}
                <span
                  aria-hidden
                  className="absolute inset-3 rounded-[1px] ring-1 ring-ink/10"
                />
                <div className="relative flex flex-col items-center gap-2">
                  <Image
                    src="/brand/lineamode-wordmark.png"
                    alt="Lineamode"
                    width={1253}
                    height={199}
                    sizes="(min-width: 768px) 320px, 220px"
                    className="w-[220px] md:w-[300px] h-auto brightness-0 opacity-90"
                  />
                  <span className="text-[10px] md:text-xs tracking-[0.42em] text-ink/60 uppercase">
                    Apparel
                  </span>
                </div>

                {/* Card index — discreet bottom-left tag */}
                <span className="absolute left-5 bottom-4 text-label text-ink/45 font-mono">
                  / {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Back face — ink black with founder details */}
              <div
                className="absolute inset-0 rounded-[2px] bg-ink text-stone shadow-[0_30px_60px_-30px_rgba(15,15,12,0.65)] p-8 md:p-10 flex flex-col justify-between"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div>
                  <p className="text-h2 font-sans font-semibold leading-[0.95]">
                    {founder.name}
                  </p>
                  <p className="text-h3 font-sans font-semibold leading-[1] mt-0.5">
                    {founder.role}
                  </p>

                  <div className="mt-6 space-y-1 text-label text-stone/85">
                    <p>
                      <span className="text-stone/55">M:</span> {founder.phone}
                    </p>
                    <p>
                      <Link
                        href={`mailto:${founder.email}`}
                        className="hover:underline underline-offset-4"
                      >
                        {founder.email}
                      </Link>
                    </p>
                    <p className="text-stone/85">{founder.website}</p>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-end gap-4">
                  <p className="text-label text-stone/70 max-w-[28ch] leading-relaxed">
                    <span className="text-stone font-semibold">Address: </span>
                    {founder.address}
                  </p>
                  <span aria-hidden className="flex flex-col gap-1.5">
                    <span className="block h-px w-8 bg-stone/70" />
                    <span className="block h-px w-8 bg-stone/70" />
                    <span className="block h-px w-8 bg-stone/70" />
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Detail column */}
        <div
          className={`col-span-12 md:col-span-6 ${
            reverse ? "md:order-1 md:col-start-1 md:row-start-1" : "md:col-start-7"
          }`}
        >
          <div className="md:sticky md:top-32">
            <Eyebrow number={String(index + 1).padStart(2, "0")}>
              Founder
            </Eyebrow>
            <h2 className="text-display leading-[0.95] mt-6">
              {founder.name.split(" ")[0]},
              <br />
              <span className="italic font-extralight">
                {founder.name.split(" ").slice(1).join(" ")}.
              </span>
            </h2>

            <div className="mt-10 space-y-5 max-w-md">
              {founder.bio.map((p, i) => (
                <p key={i} className="text-body text-ink/80">
                  {p}
                </p>
              ))}
            </div>

            <p className="mt-10 text-h2 italic font-extralight font-display max-w-lg border-l border-ink/30 pl-6">
              "{founder.pull}"
            </p>

            <ul className="mt-10 grid grid-cols-1 gap-3 max-w-md">
              {founder.focus.map((f) => (
                <li
                  key={f}
                  className="flex gap-3 text-body text-ink/80 border-t hairline pt-3 first:border-t-0 first:pt-0"
                >
                  <span className="text-ink/40">—</span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-10 grid grid-cols-2 gap-6 max-w-md text-body">
              <Link
                href={`mailto:${founder.email}`}
                className="block group/c"
              >
                <p className="text-eyebrow text-ink/55 mb-2">Email</p>
                <p className="text-body group-hover/c:underline underline-offset-4">
                  {founder.email}
                </p>
              </Link>
              <Link href={founder.phoneHref} className="block group/c">
                <p className="text-eyebrow text-ink/55 mb-2">Phone</p>
                <p className="text-body group-hover/c:underline underline-offset-4">
                  {founder.phone}
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
