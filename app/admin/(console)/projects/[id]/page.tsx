import { ProjectDetailView } from "@/components/admin/projects/detail/ProjectDetailView";

export const metadata = { title: "Project · Admin" };

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectDetailView projectId={id} />;
}
