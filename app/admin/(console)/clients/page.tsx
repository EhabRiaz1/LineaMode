import { ConsoleHeader } from "@/components/admin/ConsoleHeader";
import { ClientsList } from "@/components/admin/clients/ClientsList";

export const metadata = { title: "Clients · Admin" };

export default function ClientsPage() {
  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow="04 / Clients"
        title="The book."
        subtitle="Every client we've spoken to, with their project count and tags."
      />
      <ClientsList />
    </div>
  );
}
