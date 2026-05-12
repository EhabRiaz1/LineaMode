import { ConsoleHeader } from "@/components/admin/ConsoleHeader";
import { Kanban } from "@/components/admin/pipeline/Kanban";

export const metadata = { title: "Pipeline · Admin" };

export default function PipelinePage() {
  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow="03 / Pipeline"
        title="The board."
        subtitle="Drag a card across lanes to advance status. Each move is logged on the project timeline."
      />
      <Kanban />
    </div>
  );
}
