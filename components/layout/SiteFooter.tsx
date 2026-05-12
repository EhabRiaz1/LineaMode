import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { GridPattern } from "@/components/ui/GridPattern";
import { CopyrightYear } from "@/components/layout/CopyrightYear";

const NAV = [
  {
    heading: "Studio",
    links: [
      { href: "/about", label: "About" },
      { href: "/capabilities", label: "Capabilities" },
      { href: "/design", label: "Design" },
      { href: "/products", label: "Products" },
      { href: "/sustainability", label: "Sustainability" },
    ],
  },
  {
    heading: "Library",
    links: [
      // { href: "/lookbook", label: "Lookbook '26" },
      { href: "/journal", label: "Journal" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { href: "mailto:saif@lineamode.com", label: "saif@lineamode.com" },
      { href: "tel:+923001234567", label: "+92 300 1234567" },
      { href: "https://www.linkedin.com/company/lineamode-apparel", label: "LinkedIn" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative bg-ink text-stone overflow-hidden">
      <GridPattern
        className="absolute inset-0 opacity-[0.07] text-stone"
        disruption
      />

      <div className="shell relative pt-28 pb-8">
        {/* Tagline — single line, smaller, italic accent matches the hero. */}
        <div className="border-y border-stone/15 py-12 my-12 text-center">
          <p className="text-eyebrow text-stone/60 mb-6">Lineamode 2026</p>
          <p className="text-h1 leading-[0.95]">
            From Idea
            <span className="italic font-extralight"> to Execution.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <BrandLogo context="dark" className="h-6 max-w-[min(100%,280px)]" />
            <p className="mt-6 max-w-xs text-body text-stone/70">
              An end-to-end apparel partner for brands that move fast.
              Design, product development and manufacturing in one studio.
            </p>
            <p className="mt-6 text-label text-stone/60">
              1st Floor, NESPAK House,
              <br />
              G-5/2, Attaturk Avenue,
              <br />
              Islamabad, Pakistan.
            </p>
          </div>

          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {NAV.map((col) => (
              <div key={col.heading}>
                <p className="text-eyebrow text-stone/60 mb-5">{col.heading}</p>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-body text-stone/85 hover:text-stone transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-stone/15 flex flex-col md:flex-row gap-4 justify-between text-label text-stone/60">
          <p>© <CopyrightYear /> Lineamode Apparel. All rights reserved.</p>
          <p>Design-led apparel manufacturing · Islamabad, Pakistan</p>
        </div>
      </div>

      {/* Sitewide wordmark — sits inside the shell so it lines up with
          the same left/right margins as the dividers and nav columns
          above it (rather than running edge-to-edge of the viewport). */}
      <div className="shell relative pb-6 md:pb-10">
        <Image
          src="/brand/lineamode-wordmark.png"
          alt="Lineamode"
          width={1253}
          height={199}
          sizes="(min-width: 1440px) 1440px, 100vw"
          className="block w-full h-auto object-contain object-center brightness-0 invert"
        />
      </div>
    </footer>
  );
}
