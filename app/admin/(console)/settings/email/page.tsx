"use client";

import { useState } from "react";
import { ConsoleHeader } from "@/components/admin/ConsoleHeader";
import { EmailDeliveryLog } from "@/components/admin/settings/EmailDeliveryLog";
import { EmailTemplateEditor } from "@/components/admin/settings/EmailTemplateEditor";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "templates", label: "Templates" },
  { key: "log", label: "Delivery log" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function EmailSettingsPage() {
  const [tab, setTab] = useState<TabKey>("templates");

  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow="09 / Settings"
        title="Email"
        subtitle="Edit the automatic replies and watch what Resend delivered."
      />

      <div className="flex gap-6 border-b border-[var(--hairline)]">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "-mb-px border-b-2 px-1 pb-3 text-label transition-colors",
              tab === item.key
                ? "border-ink text-ink"
                : "border-transparent text-ink/50 hover:text-ink/75",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "templates" ? <EmailTemplateEditor /> : <EmailDeliveryLog />}
    </div>
  );
}
