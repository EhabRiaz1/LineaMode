import type { Metadata, Viewport } from "next";
import { Manrope, Fraunces, Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GrainOverlay } from "@/components/layout/GrainOverlay";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { PageTransitionGate } from "@/components/layout/PageTransitionGate";
import { MarketingChromeGate } from "@/components/layout/MarketingChromeGate";
import { buildOrganizationJsonLd } from "@/lib/seo/jsonld";
import { getPageVisibility } from "@/lib/cms";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  getDeploymentSiteOrigin,
} from "@/lib/seo/site";
import {
  buildDefaultOpenGraph,
  buildDefaultTwitter,
  siteIcons,
} from "@/lib/seo/social";

const deploymentOrigin = getDeploymentSiteOrigin();
const metadataBase = new URL(`${deploymentOrigin.replace(/\/$/, "")}/`);

// Manrope — body / UI (per brand guidelines)
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

// Fraunces — editorial display, free Google substitute for Larken.
// Replace with licensed Larken before launch.
const display = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

// Inter — utility / labels, free substitute for Neue Haas Grotesk.
// Replace with licensed Neue Haas Grotesk before launch.
const monoSans = Inter({
  variable: "--font-mono-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Lineamode",
    "apparel manufacturer",
    "knitwear manufacturer",
    "performance polyester",
    "B2B fashion partner",
    "low MOQ apparel",
    "Pakistan apparel manufacturer",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  icons: siteIcons,
  openGraph: buildDefaultOpenGraph(deploymentOrigin),
  twitter: buildDefaultTwitter(deploymentOrigin),
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#E1E1DC",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = buildOrganizationJsonLd(deploymentOrigin);

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const visibility = await getPageVisibility();

  return (
    <html
      lang="en"
      className={`${manrope.variable} ${display.variable} ${monoSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="bg-stone text-ink">
        <Suspense fallback={null}>
          <SmoothScroll />
        </Suspense>
        <GrainOverlay />
        <Suspense fallback={null}>
          <SiteHeader visibility={visibility} />
        </Suspense>
        <Suspense fallback={<main id="main" className="relative">{children}</main>}>
          <PageTransitionGate>
            <main id="main" className="relative">
              {children}
            </main>
          </PageTransitionGate>
        </Suspense>
        <Suspense fallback={null}>
          <MarketingChromeGate>
            <SiteFooter />
          </MarketingChromeGate>
        </Suspense>
      </body>
    </html>
  );
}
