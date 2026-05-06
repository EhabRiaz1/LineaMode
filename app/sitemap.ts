import type { MetadataRoute } from "next";
import { listJournal } from "@/lib/cms";

const BASE = "https://www.lineamode.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const journal = await listJournal();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/capabilities",
    "/design",
    "/products",
    "/sustainability",
    "/lookbook",
    "/journal",
    "/founders",
    "/contact",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  const journalRoutes: MetadataRoute.Sitemap = journal.map((p) => ({
    url: `${BASE}/journal/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...journalRoutes];
}
