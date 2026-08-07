import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { AdminSessionProvider } from "@/components/admin/AdminSession";
import { ConsoleShell } from "@/components/admin/ConsoleShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function AdminLayoutFallback() {
  return (
    <div className="min-h-screen bg-stone text-ink flex items-center justify-center">
      <div className="animate-pulse text-ink/50">Loading...</div>
    </div>
  );
}

/**
 * The whole console renders at request time.
 *
 * `cacheComponents` gives every route a default 15-minute cache profile, so
 * the admin routes were being prerendered and ISR-revalidated like marketing
 * pages. For a dynamic route that means a fallback shell built against the
 * literal segment (`fallbackRevalidate: 900`), which is what poisoned the CMS
 * editors: a fresh deploy rendered on demand with the real slug and worked,
 * then 15 minutes later the entry went stale, regenerated from the fallback,
 * and every visitor got `"slug":"%5Bslug%5D"` until the next deploy.
 *
 * Nothing behind an auth wall should be prerendered or shared between users
 * anyway, so opting the entire subtree out here is both the fix and the
 * correct caching posture — rather than patching route by route.
 */
/**
 * `connection()` lives inside the Suspense boundary, not above it. Awaiting it
 * in the layout body makes the whole route block on request data before
 * anything can render, which Cache Components rejects at build time with
 * "Uncached data was accessed outside of <Suspense>".
 */
async function ConsoleBody({ children }: { children: React.ReactNode }) {
  await connection();

  return (
    <AdminSessionProvider>
      <div className="min-h-screen bg-stone text-ink">
        <ConsoleShell>{children}</ConsoleShell>
      </div>
    </AdminSessionProvider>
  );
}

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AdminLayoutFallback />}>
      <ConsoleBody>{children}</ConsoleBody>
    </Suspense>
  );
}
