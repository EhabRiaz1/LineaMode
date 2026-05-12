import { StartFlow } from "@/components/start/StartFlow";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
    title: "Start a Project",
    description:
      "Tell us where the thread starts. A short letter — three doors into the studio.",
    path: "/start",
});

export default function StartPage() {
  return <StartFlow />;
}
