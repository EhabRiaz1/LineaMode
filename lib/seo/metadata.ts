import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/seo/site";
import { defaultOpenGraphImages, defaultTwitterImages } from "@/lib/seo/social";

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const pageTitle = `${title} · ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: pageTitle,
      description,
      url,
      type: "website",
      images: [...defaultOpenGraphImages],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [...defaultTwitterImages],
    },
  };
}
