import type { Metadata, Viewport } from "next";
import { Manrope, Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { IntroLoaderGate } from "@/components/layout/IntroLoaderGate";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GrainOverlay } from "@/components/layout/GrainOverlay";
import { Cursor } from "@/components/layout/Cursor";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { PageTransitionGate } from "@/components/layout/PageTransitionGate";
import { MarketingChromeGate } from "@/components/layout/MarketingChromeGate";
import { organizationJsonLd } from "@/lib/seo/jsonld";
import { getPageVisibility } from "@/lib/cms";

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
});

const SITE_URL = "https://www.lineamode.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lineamode Apparel — From Idea to Execution",
    template: "%s · Lineamode Apparel",
  },
  description:
    "Lineamode Apparel is an end-to-end clothing manufacturer with specializations in knitwear garments made of performance polyesters. Design support, product development, and agile manufacturing for global fashion brands.",
  keywords: [
    "Lineamode",
    "apparel manufacturer",
    "knitwear manufacturer",
    "performance polyester",
    "B2B fashion partner",
    "low MOQ apparel",
    "Pakistan apparel manufacturer",
  ],
  authors: [{ name: "Lineamode Apparel" }],
  creator: "Lineamode Apparel",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Lineamode Apparel",
    title: "Lineamode Apparel — From Idea to Execution",
    description:
      "End-to-end clothing manufacturer specializing in knitwear and performance polyesters. Design support, prototyping, and agile production for global fashion brands.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lineamode Apparel — From Idea to Execution",
    description:
      "End-to-end clothing manufacturer specializing in knitwear and performance polyesters.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#E1E1DC",
  width: "device-width",
  initialScale: 1,
};

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
        <IntroLoaderGate />
        <SmoothScroll />
        <GrainOverlay />
        <Cursor />
        <SiteHeader visibility={visibility} />
        <PageTransitionGate>
          <main id="main" className="relative">
            {children}
          </main>
        </PageTransitionGate>
        <MarketingChromeGate>
          <SiteFooter />
        </MarketingChromeGate>
      </body>
    </html>
  );
}
