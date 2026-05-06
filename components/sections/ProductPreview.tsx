"use client";

import Link from "next/link";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { products } from "@/content/products";
import { easeBrand } from "@/lib/motion/easings";

/**
 * Editorial product grid (5 tiles).
 *
 * Layout rhythm — every row sums to 12 columns so nothing feels
 * stranded or off-grid:
 *   row 1   →  P0 (cols 1–7)  +  P1 (cols 8–12)         portrait
 *   row 2   →  P2 (cols 1–5)  +  P3 (cols 6–12)         portrait
 *   row 3   →  P4 (cols 1–12)                            cinematic
 */
const TILE_LAYOUT = [
  { cols: "col-span-12 md:col-span-7", aspect: "aspect-[4/5]" },
  { cols: "col-span-12 md:col-span-5", aspect: "aspect-[4/5]" },
  { cols: "col-span-12 md:col-span-5", aspect: "aspect-[4/5]" },
  { cols: "col-span-12 md:col-span-7", aspect: "aspect-[4/5]" },
  { cols: "col-span-12", aspect: "aspect-[21/9]" },
];

export function ProductPreview() {
  return (
    <section className="relative bg-[var(--color-chalk-sand)] text-ink py-32 md:py-44">
      <div className="shell">
        <div className="flex items-end justify-between gap-12 mb-16">
          <div className="max-w-2xl">
            <Eyebrow number="02">Products</Eyebrow>
            <h2 className="text-h1 mt-6">
              Knitwear <span className="italic font-extralight">at the centre.</span>
              <br />
              Built outwards from there.
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden md:inline-flex text-label items-center gap-2 hover:gap-3 transition-all"
          >
            All products →
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {products.map((p, i) => (
            <ProductTile key={p.slug} index={i} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductTile({
  product,
  index,
}: {
  product: (typeof products)[number];
  index: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const layout = TILE_LAYOUT[index] ?? TILE_LAYOUT[TILE_LAYOUT.length - 1];

  return (
    <Link
      href={`/products#${product.slug}`}
      ref={ref}
      className={`${layout.cols} group/tile relative overflow-hidden ring-1 ring-ink/15 ${layout.aspect}`}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08 }}
        animate={inView ? { scale: 1 } : { scale: 1.08 }}
        transition={{ duration: 1.6, ease: easeBrand }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.hero}
          alt={product.title}
          className="w-full h-full object-cover transition-opacity duration-700 group-hover/tile:opacity-0"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.detail}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover/tile:opacity-100"
        />
      </motion.div>

      <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between text-stone">
        <div className="flex justify-between text-label text-stone/85">
          <span>/ {String(index + 1).padStart(2, "0")}</span>
          <span>{product.tagline}</span>
        </div>
        <div>
          <h3 className="text-h2 leading-tight">{product.title}</h3>
          <p className="text-body text-stone/85 max-w-md mt-2 hidden md:block">
            {product.description.split(".")[0]}.
          </p>
        </div>
      </div>

      <span className="absolute left-6 right-6 bottom-4 h-px bg-stone/40 origin-left scale-x-50 group-hover/tile:scale-x-100 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" />
    </Link>
  );
}
