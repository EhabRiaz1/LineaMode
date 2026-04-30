"use client";

import dynamic from "next/dynamic";

const IntroLoader = dynamic(() => import("@/components/layout/IntroLoader"), {
  ssr: false,
});

export function IntroLoaderGate() {
  return <IntroLoader />;
}
