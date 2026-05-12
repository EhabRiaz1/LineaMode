import { ProjectDetailView } from "@/components/admin/projects/detail/ProjectDetailView";

export const metadata = { title: "Project · Admin" };

type Params = Promise<{ id: string }>;

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  return <ProjectDetailView projectId={id} />;
}
