import type { Metadata } from "next";
import { AdminSessionProvider } from "@/components/admin/AdminSession";
import { ConsoleShell } from "@/components/admin/ConsoleShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSessionProvider>
      <div className="min-h-screen bg-stone text-ink">
        <ConsoleShell>{children}</ConsoleShell>
      </div>
    </AdminSessionProvider>
  );
}
