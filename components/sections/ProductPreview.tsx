"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { homeProducts } from "@/content/home-products";
import { easeBrand } from "@/lib/motion/easings";
import { cn } from "@/lib/utils";

export function ProductPreview() {
  const [active, setActive] = useState(0);

  const onSelect = (index: number) => {
    setActive(index);
  };

  const activeProduct = homeProducts[active] ?? homeProducts[0];

  return (
    <section className="relative min-h-[48rem] bg-ink py-32 text-stone md:min-h-[min(94vh,940px)] md:py-44">
      <motion.div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div className="absolute inset-0">
        {homeProducts.map((product, index) => (
          <Image
            key={product.slug}
            src={product.poster}
            alt={index === active ? product.imageAlt : ""}
            fill
            priority={index === 0}
            sizes="100vw"
            className={cn(
              "object-cover transition-[opacity,transform] duration-1000 ease-out",
              index === active
                ? "scale-100 opacity-100"
                : "scale-[1.03] opacity-0",
            )}
          />
        ))}
        </motion.div>

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-ink/88 via-ink/48 to-ink/18"
        />
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-80 mix-blend-multiply transition-colors duration-700",
            activeProduct.accentClass,
          )}
        />
        <motion.div aria-hidden className="absolute inset-0 bg-ink/16" />
      </motion.div>

      <motion.div className="shell relative z-10 min-h-[32rem] md:flex md:min-h-[36rem] md:items-center">
        <motion.div className="w-full md:grid md:grid-cols-12 md:items-center md:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, ease: easeBrand }}
            className="w-full min-w-0 md:col-span-7 lg:col-span-7"
          >
            <Eyebrow number="03">Products</Eyebrow>
            <h2 className="mt-6 max-w-full font-[family-name:var(--font-display)] text-[clamp(2.35rem,4.4vw,4.9rem)] font-light leading-[1.02] tracking-[-0.045em] text-stone text-balance">
              We cover a full range of products
              <span className="block italic font-extralight">
                designed to meet performance and lifestyle needs
              </span>
            </h2>
            <p className="mt-7 max-w-full text-body leading-relaxed text-stone/78 text-pretty md:max-w-xl">
              From everyday essentials to performance-led ranges, we build
              product lines with the right fabric, fit, and finish for the
              market they need to serve.
            </p>
            {/* Mobile buttons: narrower, centered under the copy */}
            <div className="mt-8 flex flex-col items-center gap-3 md:hidden">
              {homeProducts.map((product, index) => {
                const isActive = index === active;
                return (
                  <button
                    key={`m-${product.slug}`}
                    type="button"
                    onClick={() => onSelect(index)}
                    aria-pressed={isActive}
                    className={cn(
                      "inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm transition-all duration-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
                      isActive
                        ? "border-stone bg-stone text-ink shadow-[0_18px_48px_rgba(0,0,0,0.18)]"
                        : "border-stone/35 bg-stone/8 text-stone backdrop-blur-md hover:border-stone/70 hover:bg-stone/16",
                    )}
                  >
                    <span className="font-[family-name:var(--font-display)] text-[1rem] font-light tracking-[-0.02em]">
                      {product.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div className="hidden md:col-span-5 md:block lg:col-start-10 lg:col-span-3">
            <div className="flex max-w-xs flex-col gap-3 md:ml-auto">
              {homeProducts.map((product, index) => {
                const isActive = index === active;

                return (
                  <button
                    key={product.slug}
                    type="button"
                    onClick={() => onSelect(index)}
                    aria-pressed={isActive}
                    className={cn(
                      "group relative overflow-hidden rounded-full border px-5 py-3 text-left transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone focus-visible:ring-offset-2 focus-visible:ring-offset-ink md:px-6 md:py-3.5",
                      isActive
                        ? "border-stone bg-stone text-ink shadow-[0_22px_70px_rgba(0,0,0,0.22)]"
                        : "border-stone/35 bg-stone/8 text-stone backdrop-blur-md hover:border-stone/70 hover:bg-stone/16",
                    )}
                  >
                    <span className="flex items-center justify-between gap-5">
                      <span className="font-[family-name:var(--font-display)] text-[clamp(1.05rem,1.35vw,1.35rem)] font-light leading-none tracking-[-0.02em]">
                        {product.title}
                      </span>
                      <span
                        className={cn(
                          "h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-300",
                          isActive ? "bg-terracotta" : "bg-stone/55",
                        )}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
