"use client";

import { cn } from "@/lib/utils";
import type { PreviewViewport } from "./usePreviewViewport";

export function PreviewViewportToggle({
  viewport,
  onChange,
  className,
}: {
  viewport: PreviewViewport;
  onChange: (viewport: PreviewViewport) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Preview viewport"
      className={cn(
        "inline-flex rounded-full border border-[var(--hairline)] p-0.5",
        className,
      )}
    >
      <ViewportButton
        active={viewport === "desktop"}
        onClick={() => onChange("desktop")}
        label="Desktop preview"
      >
        <DesktopIcon />
      </ViewportButton>
      <ViewportButton
        active={viewport === "mobile"}
        onClick={() => onChange("mobile")}
        label="Mobile preview"
      >
        <MobileIcon />
      </ViewportButton>
    </div>
  );
}

function ViewportButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex items-center rounded-full p-1.5 transition-colors",
        active
          ? "bg-ink text-stone"
          : "text-ink/55 hover:bg-ink/5 hover:text-ink/75",
      )}
    >
      {children}
    </button>
  );
}

function DesktopIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
      />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
      />
    </svg>
  );
}
