import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE_ALT,
  LINK_PREVIEW_IMAGE_HEIGHT,
  LINK_PREVIEW_IMAGE_PATH,
  LINK_PREVIEW_IMAGE_WIDTH,
  SITE_NAME,
  SITE_OG_DESCRIPTION,
  SITE_TAGLINE,
  SITE_TWITTER_DESCRIPTION,
} from "@/lib/seo/site";

function previewImageForOrigin(siteOrigin: string) {
  const url = `${siteOrigin}${LINK_PREVIEW_IMAGE_PATH}`;
  return {
    url,
    secureUrl: url,
    width: LINK_PREVIEW_IMAGE_WIDTH,
    height: LINK_PREVIEW_IMAGE_HEIGHT,
    alt: DEFAULT_OG_IMAGE_ALT,
    type: "image/jpeg",
  } as const;
}

export function buildDefaultOpenGraph(siteOrigin: string): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    locale: "en_US",
    url: siteOrigin,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_OG_DESCRIPTION,
    images: [previewImageForOrigin(siteOrigin)],
  };
}

export function buildDefaultTwitter(siteOrigin: string): NonNullable<Metadata["twitter"]> {
  const imageUrl = `${siteOrigin}${LINK_PREVIEW_IMAGE_PATH}`;
  return {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_TWITTER_DESCRIPTION,
    images: [imageUrl],
  };
}

export function buildPageOpenGraph(
  siteOrigin: string,
  opts: { title: string; description: string; path: string },
): NonNullable<Metadata["openGraph"]> {
  const url = `${siteOrigin}${opts.path}`;
  return {
    title: opts.title,
    description: opts.description,
    url,
    type: "website",
    images: [previewImageForOrigin(siteOrigin)],
  };
}

export function buildPageTwitter(
  siteOrigin: string,
  opts: { title: string; description: string },
): NonNullable<Metadata["twitter"]> {
  const imageUrl = `${siteOrigin}${LINK_PREVIEW_IMAGE_PATH}`;
  return {
    card: "summary_large_image",
    title: opts.title,
    description: opts.description,
    images: [imageUrl],
  };
}

export const siteIcons: NonNullable<Metadata["icons"]> = {
  icon: [
    { url: "/favicon.ico" },
    { url: "/icon.svg", type: "image/svg+xml" },
  ],
  apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  shortcut: "/favicon.ico",
};
