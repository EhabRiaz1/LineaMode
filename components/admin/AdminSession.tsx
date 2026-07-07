"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
  refreshSession: () => Promise<Session | null>;
  authHeaders: () => Record<string, string>;
};

const AdminSessionContext = createContext<AdminSessionValue | null>(null);

export function useAdminSession() {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error("useAdminSession must be used inside <AdminSessionProvider>");
  return ctx;
}

function isExpired(session: Session): boolean {
  return !!session.expires_at && session.expires_at <= Math.floor(Date.now() / 1000);
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

  const validateUser = useCallback(
    async (accessToken: string, retries = 1) => {
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (!error && data.user) return data.user;

      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return validateUser(accessToken, retries - 1);
      }
      return null;
    },
    [supabase.auth],
  );

  const applySession = useCallback(
    async (next: Session | null) => {
      if (!next?.access_token) {
        setSession(null);
        setStatus("anonymous");
        return;
      }

      let active = next;

      if (isExpired(active)) {
        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshed.session?.access_token) {
          setSession(null);
          setStatus("anonymous");
          return;
        }
        active = refreshed.session;
      }

      const user = await validateUser(active.access_token);
      if (!user) {
        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError && refreshed.session?.access_token) {
          const retryUser = await validateUser(refreshed.session.access_token, 0);
          if (retryUser) {
            setSession(refreshed.session);
            setStatus("authenticated");
            return;
          }
        }
        setSession(null);
        setStatus("anonymous");
        await supabase.auth.signOut();
        return;
      }

      setSession(active);
      setStatus("authenticated");
    },
    [supabase.auth, validateUser],
  );

  const refreshSession = useCallback(async (): Promise<Session | null> => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session?.access_token) return null;
    await applySession(data.session);
    return data.session;
  }, [applySession, supabase.auth]);

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      void applySession(data.session ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      void applySession(next ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [applySession, supabase.auth]);

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
      refreshSession,
      authHeaders: (): Record<string, string> =>
        session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : ({} as Record<string, string>),
    };
  }, [refreshSession, router, session, status, supabase.auth]);

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
