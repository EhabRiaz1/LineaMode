"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CmsImage } from "@/components/ui/CmsImage";
import type { CmsImageValue } from "@/lib/cms/cms-image";
import { capabilities } from "@/content/capabilities";
import { easeBrand } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

const CYCLE_MS = 5000;
const COLLAPSED_PHOTO_MS = 3500;
const COLLAPSED_FADE_S = 3.5;

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

type CapabilityItem = { title: string; short: string; image?: CmsImageValue };

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
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inView = useInView(sectionRef, { margin: "-15% 0px -15% 0px" });

  const [active, setActive] = useState<number | null>(0);
  const [photoPullUp, setPhotoPullUp] = useState(0);
  const [collapsedPhotoIndex, setCollapsedPhotoIndex] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);
  const [hasManualSelection, setHasManualSelection] = useState(false);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    if (!inView || hasManualSelection || active === null) return;
    const t = window.setTimeout(() => {
      setActive((i) => ((i ?? 0) + 1) % displayCapabilities.length);
      setCycleKey((k) => k + 1);
    }, CYCLE_MS);
    return () => window.clearTimeout(t);
  }, [displayCapabilities.length, inView, cycleKey, active, hasManualSelection]);

  useLayoutEffect(() => {
    const updatePhotoPullUp = () => {
      if (activeRef.current !== null) return;
      if (!headlineRef.current || !listRef.current) return;
      const headlineTop = headlineRef.current.getBoundingClientRect().top;
      const listTop = listRef.current.getBoundingClientRect().top;
      const next = Math.max(0, listTop - headlineTop);
      setPhotoPullUp((prev) => (Math.abs(prev - next) < 0.5 ? prev : next));
    };

    updatePhotoPullUp();
    const observer = new ResizeObserver(updatePhotoPullUp);
    if (sectionRef.current) observer.observe(sectionRef.current);
    window.addEventListener("resize", updatePhotoPullUp);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePhotoPullUp);
    };
  }, []);

  useEffect(() => {
    if (!inView || active !== null) return;
    const t = window.setTimeout(() => {
      setCollapsedPhotoIndex((i) => (i + 1) % displayCapabilities.length);
    }, COLLAPSED_PHOTO_MS);
    return () => window.clearTimeout(t);
  }, [displayCapabilities.length, inView, active, collapsedPhotoIndex]);

  const onSelect = (i: number) => {
    setActive((current) => {
      if (current === i) {
        setCollapsedPhotoIndex(i);
        return null;
      }
      return i;
    });
    setHasManualSelection(true);
    setCycleKey((k) => k + 1);
  };

  const photoItem =
    active !== null
      ? displayCapabilities[active]
      : displayCapabilities[collapsedPhotoIndex];
  const isCollapsedSlideshow = active === null;

  return (
    <section
      ref={sectionRef}
      className="relative bg-stone text-ink py-28 md:pt-12 md:pb-20"
    >
      <div className="shell">
        <div className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-12 md:col-span-5">
            <Eyebrow number="02">{eyebrow}</Eyebrow>
            <h2
              ref={headlineRef}
              className="mt-5 font-sans text-[clamp(2rem,3.6vw,2.85rem)] leading-[1.08] tracking-[-0.015em]"
            >
              <span className="block whitespace-nowrap font-medium">{headlineLine1}</span>
              <span className="block whitespace-nowrap italic font-light">{headlineLine2}</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-7 md:gap-10 items-start">
            <ul ref={listRef} className="col-span-12 md:col-span-6 flex flex-col">
              {displayCapabilities.map((c, i) => (
                <li key={c.slug} className="relative">
                  <button
                    type="button"
                    onClick={() => onSelect(i)}
                    className={cn(
                      "group flex items-center justify-between gap-4 text-left w-full py-4 transition-colors",
                      active === i
                        ? "text-[#36454F]"
                        : "text-ink/50 hover:text-ink/85",
                    )}
                    aria-pressed={active === i}
                  >
                    <span
                      className={cn(
                        "font-sans text-[clamp(1.155rem,0.99vw+0.88rem,1.595rem)] leading-[1.08] tracking-[-0.015em]",
                        active === i ? "font-semibold" : "font-medium",
                      )}
                    >
                      {c.title}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "inline-block h-2 w-3.5 shrink-0 origin-center transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        "bg-current [mask-image:url('/images/icons/chevron-down.png')] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]",
                        "[-webkit-mask-image:url('/images/icons/chevron-down.png')] [-webkit-mask-size:contain] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center]",
                        active === i
                          ? "rotate-0 text-[#36454F]/55"
                          : "-rotate-90 text-ink/22 group-hover:text-ink/35",
                      )}
                    />
                  </button>

                  {active === i ? (
                    <motion.div
                      key={`details-${c.slug}`}
                      initial={hasManualSelection ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: hasManualSelection ? 0.22 : 0.45,
                        ease: easeBrand,
                      }}
                      className="pb-7"
                    >
                      <div className="md:hidden mx-auto mb-5 aspect-square w-full max-w-[264px] overflow-hidden bg-ink/5 ring-1 ring-ink/10">
                        <CmsImage
                          value={c.image}
                          alt={c.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="w-full font-[family-name:var(--font-display)] text-[clamp(0.77rem,0.83vw+0.51rem,1.18rem)] font-extralight leading-tight">
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

            <motion.div
              animate={{ marginTop: isCollapsedSlideshow ? -photoPullUp : 0 }}
              transition={{ duration: 0.55, ease: easeBrand }}
              className="hidden md:block col-span-12 md:col-span-5 md:col-start-8 relative"
            >
              <div className={cn(!isCollapsedSlideshow && "md:sticky md:top-32")}>
                <div className="relative aspect-square overflow-hidden bg-ink/5 ring-1 ring-ink/10">
                  <AnimatePresence mode="sync">
                    <motion.div
                      key={
                        isCollapsedSlideshow
                          ? `collapsed-${collapsedPhotoIndex}`
                          : photoItem.slug
                      }
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: isCollapsedSlideshow
                          ? COLLAPSED_FADE_S
                          : hasManualSelection
                            ? 0.22
                            : 0.6,
                        ease: easeBrand,
                      }}
                      className="absolute inset-0"
                    >
                      <CmsImage
                        value={photoItem.image}
                        alt={photoItem.title}
                        className="h-full w-full object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
        </div>
      </div>
    </section>
  );
}
