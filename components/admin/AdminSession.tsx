"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type Status = "loading" | "authenticated" | "anonymous";

type AdminSessionValue = {
  status: Status;
  user: User | null;
  email: string | null;
  token: string | null;
  signOut: () => Promise<void>;
  authHeaders: () => Record<string, string>;
};

const AdminSessionContext = createContext<AdminSessionValue | null>(null);

export function useAdminSession() {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error("useAdminSession must be used inside <AdminSessionProvider>");
  return ctx;
}

/**
 * Wraps the admin console with a single Supabase auth gate. Children only
 * render once we know the user is signed in; otherwise we redirect to
 * /admin/login. Token + headers are exposed via context so child pages can
 * call protected admin APIs without repeating the auth boilerplate.
 */
export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = getBrowserSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setStatus(data.session ? "authenticated" : "anonymous");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next ?? null);
      setStatus(next ? "authenticated" : "anonymous");
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    if (status === "anonymous" && pathname && !pathname.startsWith("/admin/login")) {
      router.replace("/admin/login");
    }
  }, [status, pathname, router]);

  const value = useMemo<AdminSessionValue>(() => {
    return {
      status,
      user: session?.user ?? null,
      email: session?.user?.email ?? null,
      token: session?.access_token ?? null,
      signOut: async () => {
        await supabase.auth.signOut();
        router.replace("/admin/login");
      },
      authHeaders: (): Record<string, string> =>
        session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : ({} as Record<string, string>),
    };
  }, [router, session, status, supabase.auth]);

  const shouldRenderChildren = status === "authenticated" || pathname?.startsWith("/admin/login");

  return (
    <AdminSessionContext.Provider value={value}>
      {shouldRenderChildren ? children : <AdminAuthGate status={status} />}
    </AdminSessionContext.Provider>
  );
}

function AdminAuthGate({ status }: { status: Status }) {
  return (
    <div className="min-h-screen bg-stone text-ink flex items-center justify-center">
      <div className="rounded-2xl border border-[var(--hairline)] bg-stone px-5 py-4 text-label text-ink/55">
        {status === "anonymous" ? "Redirecting to sign in..." : "Checking admin session..."}
      </div>
    </div>
  );
}
