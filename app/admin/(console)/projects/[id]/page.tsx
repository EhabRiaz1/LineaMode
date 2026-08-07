import { Suspense } from "react";
import { connection } from "next/server";
import { ProjectDetailView } from "@/components/admin/projects/detail/ProjectDetailView";

export const metadata = { title: "Project · Admin" };

type Props = { params: Promise<{ id: string }> };

/** connection() + Suspense keeps this off the prerender — see content/pages/[slug]/page.tsx. */
async function Detail({ params }: Props) {
  await connection();
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
