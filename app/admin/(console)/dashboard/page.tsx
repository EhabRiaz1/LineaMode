import { ConsoleHeader } from "@/components/admin/ConsoleHeader";
import { DashboardGrid } from "@/components/admin/dashboard/DashboardGrid";

export const metadata = { title: "Dashboard · Admin" };

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow="Dashboard"
        title="Quick overview"
        subtitle="Your customizable workspace. Drag to rearrange widgets."
      />
      <DashboardGrid />
    </div>
  );
}
