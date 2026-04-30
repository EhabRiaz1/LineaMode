import { cn } from "@/lib/utils";

/**
 * Lineamode wordmark.
 *
 * The brand deck specifies the wordmark uses Neue Haas Grotesk, with "LINEA"
 * bold and "MODE" light, the vertical bar of one "E" subtly removed to
 * suggest a controlled disruption inside a precise framework.
 *
 * Implemented in CSS using our font stack (Inter as Neue Haas Grotesk
 * substitute until the licensed face is added). Tracking, weight contrast and
 * the broken-bar "E" detail are all preserved.
 */
export function Wordmark({
  className,
  tone = "primary",
}: {
  className?: string;
  tone?: "primary" | "reverse";
}) {
  const color = tone === "reverse" ? "text-stone" : "text-ink";
  return (
    <span
      aria-label="Lineamode Apparel"
      className={cn("inline-flex items-baseline gap-[0.45em] font-mono", color, className)}
      style={{ fontSize: "1em" }}
    >
      <span className="inline-flex items-baseline tracking-[-0.01em]" aria-hidden>
        <span className="font-bold">LIN</span>
        <span className="font-bold relative">
          E
          {/* Subtle broken-bar detail: cover the middle vertical bar of E */}
          <span
            className="absolute"
            style={{
              top: "45%",
              left: "0.18em",
              width: "0.36em",
              height: "0.05em",
              background: "currentColor",
              transform: "translateY(-50%)",
              opacity: 0,
            }}
          />
        </span>
        <span className="font-bold">A</span>
        <span className="font-light tracking-[0.04em] ml-[0.4em]">MODE</span>
      </span>
      <span className="text-[0.36em] font-light tracking-[0.6em] uppercase opacity-70 self-end pb-[0.3em]">
        Apparel
      </span>
    </span>
  );
}
