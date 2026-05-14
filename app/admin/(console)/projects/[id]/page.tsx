import { Suspense } from "react";
import { ProjectDetailView } from "@/components/admin/projects/detail/ProjectDetailView";

export const metadata = { title: "Project · Admin" };

type Params = Promise<{ id: string }>;

export default function ProjectDetailPage({ params }: { params: Params }) {
  return (
    <Suspense>
      <ResolvedView params={params} />
    </Suspense>
  );
}

async function ResolvedView({ params }: { params: Params }) {
  const { id } = await params;
  return <ProjectDetailView projectId={id} />;
}
