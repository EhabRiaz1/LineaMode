"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const AboutGlobeScene = dynamic(
  () => import("./AboutGlobeScene").then((mod) => mod.AboutGlobeScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex w-full justify-center">
        <div
          className={cn(
            "aspect-square w-[80%] animate-pulse bg-ink/[0.03]",
          )}
          aria-hidden
        />
      </div>
    ),
  },
);

export function AboutGlobe({ className }: { className?: string }) {
  return <AboutGlobeScene className={className} />;
}
