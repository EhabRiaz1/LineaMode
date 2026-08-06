"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import {
  BRAND_TOKEN_FIELDS,
  type BrandTokens,
} from "@/lib/cms/brand-schema";
import { cn } from "@/lib/utils";

type LoadResponse = {
  tokens: BrandTokens;
  usingDefaults: boolean;
  defaults: BrandTokens;
};

/** Google truncates around here; useful as a soft target, not a hard limit. */
const IDEAL_META_LENGTH = 160;

export function BrandTokensEditor() {
  const { authHeaders, status } = useAdminSession();

  const [tokens, setTokens] = useState<BrandTokens | null>(null);
  const [defaults, setDefaults] = useState<BrandTokens | null>(null);
  const [usingDefaults, setUsingDefaults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // setState lives in the promise callback, not the effect body.
  const load = useCallback(() => {
    if (status !== "authenticated") return () => {};
    let cancelled = false;
    adminFetch<LoadResponse>("/api/admin/settings/brand", {
      authHeaders: authHeaders(),
    }).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setTokens(res.data.tokens);
        setDefaults(res.data.defaults);
        setUsingDefaults(res.data.usingDefaults);
        setError(null);
      } else {
        setError(res.error);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [authHeaders, status]);

  useEffect(() => load(), [load]);

  const update = (key: keyof BrandTokens, value: string) => {
    setTokens((prev) => (prev ? { ...prev, [key]: value } : prev));
    setDirty(true);
    setNotice(null);
  };

  const save = async () => {
    if (!tokens) return;
    setSaving(true);
    setError(null);
    setNotice(null);

    const res = await adminFetch<{ tokens: BrandTokens }>(
      "/api/admin/settings/brand",
      {
        authHeaders: authHeaders(),
        method: "PUT",
        body: JSON.stringify({ tokens }),
      },
    );

    setSaving(false);
    if (res.ok) {
      setTokens(res.data.tokens);
      setUsingDefaults(false);
      setDirty(false);
      setNotice("Saved. The site picks these up immediately.");
    } else {
      setError(res.error);
    }
  };

  const resetToShipped = () => {
    if (!defaults) return;
    setTokens(defaults);
    setDirty(true);
    setNotice(null);
  };

  if (loading) return <p className="text-body text-ink/55">Loading brand tokens…</p>;

  if (!tokens) {
    return (
      <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
        {error ?? "Brand tokens are unavailable."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {usingDefaults && (
        <div className="rounded-2xl border border-[var(--hairline)] bg-ink/[0.02] px-4 py-3">
          <p className="text-label text-ink/70">
            Showing the copy shipped with the site. Saving takes over from it.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-2xl border border-moss/30 bg-moss/10 px-4 py-3 text-body text-moss">
          {notice}
        </div>
      )}

      <div className="space-y-5 rounded-3xl border border-[var(--hairline)] bg-stone p-6">
        {BRAND_TOKEN_FIELDS.map((field) => {
          const value = tokens[field.key] ?? "";
          const over = value.length > field.max;
          const longForSearch =
            field.key === "metaDescription" && value.length > IDEAL_META_LENGTH;

          return (
            <label key={field.key} className="block space-y-1.5">
              <span className="flex items-baseline justify-between gap-4">
                <span className="text-label text-ink/55">{field.label}</span>
                <span
                  className={cn(
                    "text-label tabular-nums",
                    over ? "text-terracotta" : "text-ink/40",
                  )}
                >
                  {value.length}/{field.max}
                </span>
              </span>

              {field.multiline ? (
                <textarea
                  value={value}
                  onChange={(e) => update(field.key, e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              ) : (
                <input
                  value={value}
                  onChange={(e) => update(field.key, e.target.value)}
                  className={inputClass}
                />
              )}

              <span className="block text-label text-ink/40">{field.hint}</span>
              {longForSearch && (
                <span className="block text-label text-terracotta">
                  Over {IDEAL_META_LENGTH} characters — search results will
                  likely truncate this.
                </span>
              )}
            </label>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="rounded-full bg-ink px-5 py-2.5 text-label text-stone transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {saving ? "Saving…" : dirty ? "Save brand tokens" : "No changes"}
        </button>
        <button
          type="button"
          onClick={resetToShipped}
          className="rounded-full border border-[var(--hairline)] px-5 py-2.5 text-label text-ink transition-colors hover:border-[var(--hairline-strong)]"
        >
          Reset to shipped copy
        </button>
      </div>

      <p className="text-label text-ink/45">
        These are site-wide defaults. Pages with their own SEO copy — products,
        about, contact and the rest — keep it and are unaffected.
      </p>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none transition-colors focus:border-[var(--hairline-strong)]";
