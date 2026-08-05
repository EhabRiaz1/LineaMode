"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { cn } from "@/lib/utils";

type LogEntry = {
  id: string;
  to: string[];
  from: string;
  subject: string;
  createdAt: string;
  status: string;
};

type LogResponse = {
  configured: boolean;
  hasMore: boolean;
  emails: LogEntry[];
};

/** Resend's event vocabulary, mapped to the console's palette. */
const STATUS_TONE: Record<string, string> = {
  delivered: "text-moss",
  opened: "text-moss",
  clicked: "text-moss",
  sent: "text-ink/70",
  queued: "text-ink/50",
  scheduled: "text-ink/50",
  delivery_delayed: "text-terracotta",
  bounced: "text-terracotta",
  complained: "text-terracotta",
  failed: "text-terracotta",
};

function formatTimestamp(value: string): string {
  const parsed = new Date(value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function EmailDeliveryLog() {
  const { authHeaders, status } = useAdminSession();
  const [data, setData] = useState<LogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State is set inside the promise callback rather than in the effect body,
  // which is the pattern react-hooks/set-state-in-effect asks for: the effect
  // subscribes to an external system and updates state when it answers.
  const load = useCallback(
    (onSettled?: () => void) => {
      if (status !== "authenticated") return () => {};
      let cancelled = false;
      adminFetch<LogResponse>("/api/admin/settings/email/log", {
        authHeaders: authHeaders(),
      }).then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setData(res.data);
          setError(null);
        } else {
          setError(res.error);
        }
        setLoading(false);
        onSettled?.();
      });
      return () => {
        cancelled = true;
      };
    },
    [authHeaders, status],
  );

  useEffect(() => load(), [load]);

  if (loading) return <p className="text-body text-ink/55">Loading delivery log…</p>;

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
        {error}
      </div>
    );
  }

  if (!data?.configured) {
    return (
      <p className="text-body text-ink/55">
        RESEND_API_KEY is not set, so there is no delivery history to show.
      </p>
    );
  }

  if (data.emails.length === 0) {
    return <p className="text-body text-ink/55">No emails sent yet.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-label text-ink/55">
          {data.emails.length} most recent {data.emails.length === 1 ? "send" : "sends"}
          {data.hasMore && " · more in the Resend dashboard"}
        </p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="text-label text-ink/65 hover:text-ink hover:underline"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--hairline)] bg-stone">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-ink/[0.03] text-eyebrow text-ink/55">
              <tr>
                <th className="px-5 py-4 font-normal">Recipient</th>
                <th className="px-5 py-4 font-normal">Subject</th>
                <th className="px-5 py-4 font-normal">Sent</th>
                <th className="px-5 py-4 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.emails.map((entry) => (
                <tr key={entry.id} className="border-t border-[var(--hairline)]">
                  <td className="px-5 py-4 text-body text-ink">
                    {entry.to.join(", ") || "—"}
                    <span className="mt-0.5 block text-label text-ink/45">
                      from {entry.from}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-body text-ink/80">{entry.subject}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-label text-ink/60">
                    {formatTimestamp(entry.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "text-label capitalize",
                        STATUS_TONE[entry.status] ?? "text-ink/60",
                      )}
                    >
                      {entry.status.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-label text-ink/45">
        Read live from Resend on every load, so this always matches the Resend
        dashboard. History is bounded by Resend&rsquo;s own retention.
      </p>
    </div>
  );
}
