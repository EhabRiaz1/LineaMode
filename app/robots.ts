import type { MetadataRoute } from "next";
import { getDeploymentSiteOrigin } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const origin = getDeploymentSiteOrigin();
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
