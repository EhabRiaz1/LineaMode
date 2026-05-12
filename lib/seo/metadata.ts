import type { Metadata } from "next";
import { SITE_NAME, getDeploymentSiteOrigin } from "@/lib/seo/site";
import { buildPageOpenGraph, buildPageTwitter } from "@/lib/seo/social";

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const siteOrigin = getDeploymentSiteOrigin();
  const url = `${siteOrigin}${path}`;
  const pageTitle = `${title} · ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: buildPageOpenGraph(siteOrigin, {
      title: pageTitle,
      description,
      path,
    }),
    twitter: buildPageTwitter(siteOrigin, {
      title: pageTitle,
      description,
    }),
  };
}
