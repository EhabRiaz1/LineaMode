import { ConsoleHeader } from "@/components/admin/ConsoleHeader";
import { BrandTokensEditor } from "@/components/admin/settings/BrandTokensEditor";

export const metadata = { title: "Brand Tokens · Settings · Admin" };

export default function BrandTokensPage() {
  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow="09 / Settings"
        title="Brand tokens"
        subtitle="Site-wide tagline, default SEO copy and footer line."
      />
      <BrandTokensEditor />
    </div>
  );
}
