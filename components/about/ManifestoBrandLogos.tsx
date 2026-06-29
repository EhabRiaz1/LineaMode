import { CmsImage } from "@/components/ui/CmsImage";
import { cmsImageSrc, type CmsImageValue } from "@/lib/cms/cms-image";

export type ManifestoBrandLogo = {
  name: string;
  image: CmsImageValue;
};

export function ManifestoBrandLogos({ logos }: { logos: ManifestoBrandLogo[] }) {
  const visible = logos.filter((logo) => cmsImageSrc(logo.image));

  if (visible.length === 0) return null;

  return (
    <div
      className="mt-10 md:mt-16 flex flex-col items-start gap-6 md:gap-7"
      aria-label="Group companies"
    >
      {visible.map((logo) => (
        <div key={logo.name} className="w-full max-w-[12.5rem]">
          <CmsImage
            value={logo.image}
            alt={logo.name}
            className="h-8 w-auto max-w-full object-contain object-left brightness-0 opacity-[0.38] md:h-9"
          />
        </div>
      ))}
    </div>
  );
}
