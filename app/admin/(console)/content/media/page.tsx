import { ConsoleHeader } from "@/components/admin/ConsoleHeader";
import { MediaLibrary } from "@/components/admin/content/MediaLibrary";

export const metadata = { title: "Media · Admin" };

export default function MediaPage() {
  return (
    <div className="space-y-8">
      <ConsoleHeader
        eyebrow="07 / Media"
        title="Library."
        subtitle="The shared image pool. Anything uploaded here can be picked from any block."
      />
      <MediaLibrary />
    </div>
  );
}
