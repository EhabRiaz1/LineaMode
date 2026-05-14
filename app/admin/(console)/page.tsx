import { redirect } from "next/navigation";

export default function ConsoleIndexPage() {
  redirect("/admin/dashboard");
}
