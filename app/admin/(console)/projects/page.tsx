import { ConsoleHeader } from "@/components/admin/ConsoleHeader";
import { ProjectsList } from "@/components/admin/projects/ProjectsList";

export const metadata = { title: "Projects · Admin" };

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow="02 / Projects"
        title="Every active project."
        subtitle="Filter by status or pipeline. Click a row to open the full detail view."
      />
      <ProjectsList />
    </div>
  );
}
