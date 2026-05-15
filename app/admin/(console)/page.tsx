"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConsoleIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return <p className="text-body text-ink/55">Opening dashboard...</p>;
}
