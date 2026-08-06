import { Suspense } from "react";
import { ProjectDetailView } from "@/components/admin/projects/detail/ProjectDetailView";

export const metadata = { title: "Project · Admin" };

type Props = { params: Promise<{ id: string }> };

/** params awaited behind Suspense — see content/pages/[slug]/page.tsx. */
async function Detail({ params }: Props) {
  const { id } = await params;
  return <ProjectDetailView projectId={id} />;
}

export default function ProjectDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<p className="text-body text-ink/55">Loading project…</p>}>
      <Detail params={params} />
    </Suspense>
  );
}
