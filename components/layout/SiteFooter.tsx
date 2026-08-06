import Link from "next/link";
import { getBrandTokens } from "@/lib/cms";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { FooterContact } from "@/components/layout/FooterContact";
import { FooterSocial } from "@/components/layout/FooterSocial";
import { GridPattern } from "@/components/ui/GridPattern";
import { CopyrightYear } from "@/components/layout/CopyrightYear";

const NAV = [
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/products", label: "Products" },
      { href: "/capabilities", label: "Services" },
    ],
  },
  {
    heading: "Blog",
    links: [
      // { href: "/lookbook", label: "Lookbook '26" },
      { href: "/journal", label: "Newsletter" },
    ],
  },
];

function FooterNavColumn({ col }: { col: (typeof NAV)[number] }) {
  return (
    <div>
      <p className="text-eyebrow text-stone/60 mb-5">{col.heading}</p>
      <ul className="space-y-3">
        {col.links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
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
  );
}

export async function SiteFooter() {
  const brand = await getBrandTokens();

  return (
    <footer className="relative bg-ink text-stone overflow-hidden">
      <GridPattern
        className="absolute inset-0 opacity-[0.07] text-stone"
        disruption
      />

      <div className="shell relative pt-10 md:pt-12 pb-8">
        {/* Tagline — single line, smaller, italic accent matches the hero. */}
        <div className="border-y border-stone/15 py-8 mt-4 mb-8 md:mt-6 md:mb-10 text-center">
          <p className="text-footer-tagline">
            From Idea to
            <span className="italic font-extralight"> Execution</span>
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
              Intermoda Brands PVT Limited,
              <br />
              7.5 KM Main Raiwind Road,
              <br />
              Lahore, Pakistan.
            </p>
          </div>

          <div className="md:col-span-8">
            <div className="grid grid-cols-2 gap-8 md:hidden">
              <FooterNavColumn col={NAV[0]} />
              <div className="space-y-8">
                <FooterNavColumn col={NAV[1]} />
                <div className="space-y-8">
                  <FooterContact />
                  <FooterSocial />
                </div>
              </div>
            </div>

            <div className="hidden md:grid md:grid-cols-3 gap-8">
              <FooterNavColumn col={NAV[0]} />
              <FooterNavColumn col={NAV[1]} />
              <div className="space-y-8">
                <FooterContact />
                <FooterSocial />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 pb-6 md:pb-10 border-t border-stone/15 flex flex-col md:flex-row gap-4 justify-between text-label text-stone/60">
          <p>© <CopyrightYear /> Lineamode Apparel. All rights reserved.</p>
          <p>{brand.footerTagline}</p>
        </div>
      </div>
    </footer>
  );
}
