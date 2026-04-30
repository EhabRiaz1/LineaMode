import { cn } from "@/lib/utils";

/**
 * Linear Grid System — the brand's recurring visual signature.
 *
 * From the brand deck:
 *   "Structured lines and modular order, turning the brand into a visual
 *    system rather than decoration. It expresses precision, minimalism, and
 *    control, while subtle variations in weight and spacing add rhythm and
 *    avoid rigidity. Occasional breaks in the grid reinforce the brand's
 *    idea of controlled disruption."
 *
 * Renders an SVG grid of vertical struts (and optional horizontals). The
 * `disruption` prop offsets one strut intentionally — the "controlled
 * disruption" detail.
 */
export function GridPattern({
  className,
  density = 24,
  orientation = "vertical",
  disruption = false,
}: {
  className?: string;
  density?: number;
  orientation?: "vertical" | "horizontal" | "cross";
  disruption?: boolean;
}) {
  const lines = Array.from({ length: density });
  const disruptIdx = Math.floor(density * 0.62);

  return (
    <svg
      role="presentation"
      aria-hidden
      className={cn("pointer-events-none", className)}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox={`0 0 ${density} ${density}`}
    >
      {(orientation === "vertical" || orientation === "cross") &&
        lines.map((_, i) => {
          const isDisrupt = disruption && i === disruptIdx;
          const x = i + 0.5 + (isDisrupt ? 0.18 : 0);
          const top = isDisrupt ? 1.4 : 0;
          const bottom = isDisrupt ? density - 1.2 : density;
          return (
            <line
              key={`v-${i}`}
              x1={x}
              x2={x}
              y1={top}
              y2={bottom}
              stroke="currentColor"
              strokeWidth={i % 4 === 0 ? 0.05 : 0.025}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      {(orientation === "horizontal" || orientation === "cross") &&
        lines.map((_, i) => (
          <line
            key={`h-${i}`}
            y1={i + 0.5}
            y2={i + 0.5}
            x1={0}
            x2={density}
            stroke="currentColor"
            strokeWidth={i % 4 === 0 ? 0.05 : 0.025}
            vectorEffect="non-scaling-stroke"
          />
        ))}
    </svg>
  );
}
