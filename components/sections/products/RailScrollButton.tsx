import { cn } from "@/lib/utils";

function RailScrollIcon({ direction }: { direction: "prev" | "next" }) {
  if (direction === "next") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M6 3l5 5-5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 3L5 8l5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RailScrollButton({
  direction,
  label,
  onClick,
  className,
}: {
  direction: "prev" | "next";
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "pointer-events-auto flex size-10 items-center justify-center rounded-full bg-stone text-ink shadow-[0_4px_20px_rgba(0,0,0,0.12)] ring-1 ring-ink/10 transition-transform hover:scale-105",
        className,
      )}
    >
      <RailScrollIcon direction={direction} />
    </button>
  );
}
