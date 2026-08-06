"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { cn } from "@/lib/utils";

type DeliveryResponse = {
  recipients: string[];
  source: "cms" | "env" | "default";
  envFallback?: string | null;
  warnings: string[];
};

const SOURCE_LABEL: Record<DeliveryResponse["source"], string> = {
  cms: "Set here in the console.",
  env: "Currently inherited from the CONTACT_EMAIL_TO environment variable. Saving here takes over.",
  default: "No recipient configured anywhere — using the built-in default. Set one below.",
};

export function EmailRecipientsEditor() {
  const { authHeaders, status } = useAdminSession();

  const [recipients, setRecipients] = useState<string[]>([]);
  const [source, setSource] = useState<DeliveryResponse["source"]>("default");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // setState lives in the promise callback, not the effect body — see
  // EmailDeliveryLog for why.
  const load = useCallback(() => {
    if (status !== "authenticated") return () => {};
    let cancelled = false;
    adminFetch<DeliveryResponse>("/api/admin/settings/email/delivery", {
      authHeaders: authHeaders(),
    }).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setRecipients(res.data.recipients);
        setSource(res.data.source);
        setWarnings(res.data.warnings ?? []);
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

  const update = (index: number, value: string) => {
    setRecipients((prev) => prev.map((r, i) => (i === index ? value : r)));
    setDirty(true);
    setNotice(null);
  };

  const add = () => {
    setRecipients((prev) => [...prev, ""]);
    setDirty(true);
    setNotice(null);
  };

  const remove = (index: number) => {
    setRecipients((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
    setNotice(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);

    const cleaned = recipients.map((r) => r.trim().toLowerCase()).filter(Boolean);
    const res = await adminFetch<DeliveryResponse>(
      "/api/admin/settings/email/delivery",
      {
        authHeaders: authHeaders(),
        method: "PUT",
        body: JSON.stringify({ recipients: cleaned }),
      },
    );

    setSaving(false);
    if (res.ok) {
      setRecipients(res.data.recipients);
      setSource("cms");
      setWarnings(res.data.warnings ?? []);
      setDirty(false);
      setNotice("Saved. New briefs go to these addresses immediately.");
    } else {
      setError(res.error);
    }
  };

  if (loading) return <p className="text-body text-ink/55">Loading recipients…</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--hairline)] bg-ink/[0.02] px-4 py-3">
        <p className="text-label text-ink/70">{SOURCE_LABEL[source]}</p>
      </div>

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
      {warnings.length > 0 && (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          <p className="font-medium">Delivery warning</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4 rounded-3xl border border-[var(--hairline)] bg-stone p-6">
        <div className="flex items-baseline justify-between">
          <p className="text-label text-ink/55">Brief recipients</p>
          <button
            type="button"
            onClick={add}
            disabled={recipients.length >= 10}
            className="text-label text-ink/65 hover:text-ink hover:underline disabled:opacity-40"
          >
            + Add recipient
          </button>
        </div>

        {recipients.map((recipient, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              type="email"
              value={recipient}
              onChange={(e) => update(index, e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-3 py-2 text-body text-ink outline-none transition-colors focus:border-[var(--hairline-strong)]"
            />
            {index === 0 && (
              <span className="whitespace-nowrap text-label text-ink/45">Reply-To</span>
            )}
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={recipients.length <= 1}
              className={cn(
                "whitespace-nowrap text-label text-ink/50 hover:text-terracotta",
                recipients.length <= 1 && "cursor-not-allowed opacity-30 hover:text-ink/50",
              )}
            >
              Remove
            </button>
          </div>
        ))}

        <p className="text-label text-ink/45">
          Everyone listed receives each brief. The first address is also used as
          the Reply-To on auto-replies, since mail is sent from a studio@
          address rather than a monitored mailbox.
        </p>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving || !dirty}
        className="rounded-full bg-ink px-5 py-2.5 text-label text-stone transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {saving ? "Saving…" : dirty ? "Save recipients" : "No changes"}
      </button>
    </div>
  );
}
