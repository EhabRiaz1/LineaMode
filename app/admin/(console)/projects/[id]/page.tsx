import { Suspense } from "react";
import { ProjectDetailView } from "@/components/admin/projects/detail/ProjectDetailView";

export const metadata = { title: "Project · Admin" };

type Params = Promise<{ id: string }>;

export default function ProjectDetailPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<p className="text-body text-ink/55">Loading project…</p>}>
      {params.then(({ id }) => (
        <ProjectDetailView projectId={id} />
      ))}
    </Suspense>
  );
}
