import { GridPattern } from "./GridPattern";
import { cn } from "@/lib/utils";

/**
 * Slim Linear-Grid divider used between major sections.
 * Carries the brand's "controlled disruption" detail at low intensity.
 */
export function SectionDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("relative h-10 w-full opacity-50", className)}
    >
      <GridPattern
        density={48}
        orientation="vertical"
        disruption
        className="text-current"
      />
    </div>
  );
}
