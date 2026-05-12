"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { cn } from "@/lib/utils";

type PageVisibility = {
  [key: string]: {
    navbar: boolean;
    homepage: boolean;
  };
};

const PAGES = [
  { key: "lookbook", label: "Lookbook", description: "Seasonal editorial and product photography" },
  { key: "journal", label: "Journal", description: "Studio notes and field essays" },
];

export function PageVisibilityEditor() {
  const { authHeaders, status } = useAdminSession();
  const [visibility, setVisibility] = useState<PageVisibility>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    const res = await adminFetch<{ visibility: PageVisibility }>(
      "/api/admin/settings/visibility",
      { authHeaders: authHeaders() }
    );
    if (res.ok) {
      setVisibility(res.data.visibility);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [authHeaders, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggle = async (pageKey: string, field: "navbar" | "homepage") => {
    const current = visibility[pageKey] ?? { navbar: true, homepage: true };
    const updated = {
      ...visibility,
      [pageKey]: {
        ...current,
        [field]: !current[field],
      },
    };
    
    setVisibility(updated);
    setSaving(true);
    setError(null);
    setSuccess(false);

    const res = await adminFetch<{ visibility: PageVisibility }>(
      "/api/admin/settings/visibility",
      {
        authHeaders: authHeaders(),
        method: "PUT",
        body: JSON.stringify({ visibility: updated }),
      }
    );

    setSaving(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } else {
      setError(res.error);
      setVisibility(visibility);
    }
  };

  if (loading) {
    return <p className="text-body text-ink/55">Loading visibility settings…</p>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-moss/30 bg-moss/10 px-4 py-3 text-body text-moss">
          Visibility settings saved successfully.
        </div>
      )}

      <div className="rounded-3xl border border-[var(--hairline)] bg-stone overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-ink/[0.03] text-eyebrow text-ink/55">
            <tr>
              <th className="px-6 py-4 font-normal">Page</th>
              <th className="px-6 py-4 font-normal text-center">Show in Navbar</th>
              <th className="px-6 py-4 font-normal text-center">Show on Homepage</th>
            </tr>
          </thead>
          <tbody>
            {PAGES.map((page) => {
              const settings = visibility[page.key] ?? { navbar: true, homepage: true };
              return (
                <tr key={page.key} className="border-t border-[var(--hairline)]">
                  <td className="px-6 py-5">
                    <p className="text-body text-ink">{page.label}</p>
                    <p className="text-label text-ink/55 mt-0.5">{page.description}</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <ToggleSwitch
                      checked={settings.navbar}
                      onChange={() => handleToggle(page.key, "navbar")}
                      disabled={saving}
                      label={`${page.label} in navbar`}
                    />
                  </td>
                  <td className="px-6 py-5 text-center">
                    <ToggleSwitch
                      checked={settings.homepage}
                      onChange={() => handleToggle(page.key, "homepage")}
                      disabled={saving}
                      label={`${page.label} on homepage`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-label text-ink/45">
        Changes take effect immediately on the customer site.
      </p>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-ink" : "bg-ink/20",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-stone transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
