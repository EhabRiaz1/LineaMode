import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_URL,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_NAME,
  SITE_OG_DESCRIPTION,
  SITE_TAGLINE,
  SITE_TWITTER_DESCRIPTION,
  SITE_URL,
} from "@/lib/seo/site";

export const defaultOpenGraphImages = [
  {
    url: DEFAULT_OG_IMAGE_URL,
    secureUrl: DEFAULT_OG_IMAGE_URL,
    width: DEFAULT_OG_IMAGE_WIDTH,
    height: DEFAULT_OG_IMAGE_HEIGHT,
    alt: DEFAULT_OG_IMAGE_ALT,
    type: "image/jpeg",
  },
] as const;

export const defaultTwitterImages = [DEFAULT_OG_IMAGE_URL] as const;

export const siteIcons: NonNullable<Metadata["icons"]> = {
  icon: [
    { url: "/favicon.ico" },
    { url: "/icon.svg", type: "image/svg+xml" },
  ],
  apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  shortcut: "/favicon.ico",
};

export const defaultOpenGraph: NonNullable<Metadata["openGraph"]> = {
  type: "website",
  locale: "en_US",
  url: SITE_URL,
  siteName: SITE_NAME,
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description: SITE_OG_DESCRIPTION,
  images: [...defaultOpenGraphImages],
};

export const defaultTwitter: NonNullable<Metadata["twitter"]> = {
  card: "summary_large_image",
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description: SITE_TWITTER_DESCRIPTION,
  images: [...defaultTwitterImages],
};
