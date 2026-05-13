import { ProjectDetailView } from "@/components/admin/projects/detail/ProjectDetailView";
import { connection } from "next/server";

export const metadata = { title: "Project · Admin" };

type Params = Promise<{ id: string }>;

export default async function ProjectDetailPage({ params }: { params: Params }) {
  await connection();
  const { id } = await params;
  return <ProjectDetailView projectId={id} />;
}
