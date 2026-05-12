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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <section className="relative min-h-[70vh] py-16 lg:py-24">
      <div className="shell max-w-2xl">
        <div className="rounded-3xl border border-[var(--hairline)] bg-stone/70 p-8 md:p-10 space-y-6">
          <header className="space-y-3">
            <p className="text-eyebrow text-ink/70">Admin</p>
            <h1 className="text-h1">Sign in</h1>
            <p className="text-body text-ink/80">
              Use your admin email and password. We can add 2FA in the next phase.
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

            {error && (
              <p className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 text-terracotta px-4 py-3 text-body">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" size="md" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
