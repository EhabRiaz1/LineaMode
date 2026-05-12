import { ConsoleHeader } from "@/components/admin/ConsoleHeader";
import { Funnel } from "@/components/admin/insights/Funnel";

export const metadata = { title: "Insights · Admin" };

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow="08 / Insights"
        title="The funnel."
        subtitle="How visitors move through /start, what brings them in, and where they fall off. Last 30 days."
      />
      <Funnel />
    </div>
  );
}
