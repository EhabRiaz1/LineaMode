import type { Metadata } from "next";
import { Suspense } from "react";
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

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AdminLayoutFallback />}>
      <AdminSessionProvider>
        <div className="min-h-screen bg-stone text-ink">
          <ConsoleShell>{children}</ConsoleShell>
        </div>
      </AdminSessionProvider>
    </Suspense>
  );
}
