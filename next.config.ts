import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import path from "node:path";

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const SUPABASE_HOST = (() => {
  const url = process.env.SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  turbopack: {
    root: path.resolve(__dirname),
  },
  // cacheComponents enables 'use cache' / cacheTag / revalidateTag('tag', 'max').
  // Customer-facing pages read CMS content through cached fns and admin
  // server actions invalidate by tag — see lib/cms/supabase.ts.
  cacheComponents: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      ...(SUPABASE_HOST
        ? [{ protocol: "https" as const, hostname: SUPABASE_HOST }]
        : []),
    ],
  },
  experimental: {
    optimizePackageImports: ["motion"],
  },
};

export default withMDX(nextConfig);
