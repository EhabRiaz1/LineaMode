"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

const inputClass =
  "w-full rounded-2xl border border-[var(--hairline)] bg-stone px-4 py-3 text-body text-ink placeholder:text-ink/50 focus:outline-none focus:ring-2 focus:ring-ink/20";

export function AdminLoginForm() {
  const router = useRouter();
  const supabase = getBrowserSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        code: requiresTotp ? code : undefined,
      }),
    });
    const body = await res.json().catch(() => ({}));
    const data = body?.data ?? {};

    if (!res.ok) {
      setError(body?.error ?? "Unable to sign in");
      setLoading(false);
      return;
    }

    if (data.requiresTotp) {
      setRequiresTotp(true);
      setCode("");
      setLoading(false);
      return;
    }

    if (!data.session?.access_token || !data.session?.refresh_token) {
      setError("Sign-in did not return a session.");
      setLoading(false);
      return;
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    setLoading(false);

    if (sessionError) {
      setError(sessionError.message);
      return;
    }

    router.replace("/admin/dashboard");
  };

  return (
    <section className="relative min-h-[70vh] py-16 lg:py-24">
      <div className="shell max-w-2xl">
        <div className="rounded-3xl border border-[var(--hairline)] bg-stone/70 p-8 md:p-10 space-y-6">
          <header className="space-y-3">
            <p className="text-eyebrow text-ink/70">Admin</p>
            <h1 className="text-h1">Sign in</h1>
            <p className="text-body text-ink/80">
              Use your admin email and password. If two-factor authentication is enabled, you’ll be asked for your authenticator code next.
            </p>
          </header>

          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block space-y-2">
              <span className="text-label text-ink/80">Email</span>
              <input
                className={inputClass}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-label text-ink/80">Password</span>
              <input
                className={inputClass}
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {requiresTotp && (
              <label className="block space-y-2">
                <span className="text-label text-ink/80">Authenticator code</span>
                <input
                  className={`${inputClass} text-center font-mono text-2xl tracking-[0.45em]`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
              </label>
            )}

            {error && (
              <p className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 text-terracotta px-4 py-3 text-body">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading || (requiresTotp && code.length !== 6)}
            >
              {loading ? "Signing in…" : requiresTotp ? "Verify code" : "Continue"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
