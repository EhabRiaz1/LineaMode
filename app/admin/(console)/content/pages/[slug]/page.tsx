import { PageEditor } from "@/components/admin/content/PageEditor";

export const metadata = { title: "Edit page · Admin" };

type Params = Promise<{ slug: string }>;

export default async function EditPagePage({ params }: { params: Params }) {
  const { slug } = await params;
  return <PageEditor slug={slug} />;
}
