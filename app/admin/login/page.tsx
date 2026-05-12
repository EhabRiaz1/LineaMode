import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Admin Login",
  description: "Sign in to the Lineamode admin portal.",
  path: "/admin/login",
});

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
