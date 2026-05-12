"use client";

import { cn } from "@/lib/utils";

/**
 * Brand-aligned swirling loader used inside the admin console. Pure CSS
 * (no motion lib) so it works as a Suspense fallback during streaming
 * — when JS hasn't booted yet, the keyframes still spin from the
 * server-rendered HTML.
 */
export function Spinner({
  size = 28,
  className,
  label,
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label ?? "Loading"}
      className={cn("inline-flex items-center gap-3 text-ink/55", className)}
    >
      <span
        aria-hidden
        className="lineamode-spinner inline-block rounded-full"
        style={{
          width: size,
          height: size,
          borderWidth: Math.max(2, Math.round(size / 12)),
        }}
      />
      {label ? <span className="text-label">{label}</span> : null}
      <style>{`
        .lineamode-spinner {
          border-style: solid;
          border-color: var(--color-ink, #2c2c28);
          border-top-color: transparent;
          border-right-color: transparent;
          animation: lineamode-spinner 0.9s linear infinite;
        }
        @keyframes lineamode-spinner {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .lineamode-spinner { animation-duration: 2s; }
        }
      `}</style>
    </span>
  );
}

/**
 * Full-area centred spinner with the admin's stone background. Use as the
 * default fallback for admin route segments and for in-page busy states.
 */
export function SpinnerOverlay({
  label,
  size = 36,
  className,
}: {
  label?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label ?? "Loading"}
      className={cn(
        "flex min-h-[40vh] w-full items-center justify-center bg-stone",
        className,
      )}
    >
      <Spinner size={size} label={label} />
    </div>
  );
}
