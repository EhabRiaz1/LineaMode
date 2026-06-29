import Link from "next/link";
import { CmsImage } from "@/components/ui/CmsImage";
import { cmsImageSrc, type CmsImageValue } from "@/lib/cms/cms-image";

export type AboutFounderPreview = {
  name: string;
  portrait: CmsImageValue;
  linkedin?: string;
  email?: string;
  whatsapp?: string;
};

const textLinkClass =
  "inline-flex items-center rounded-full border border-stone/25 bg-stone/10 px-3 py-1.5 text-[0.6875rem] font-mono uppercase tracking-[0.12em] text-stone/85 transition-colors hover:border-stone/45 hover:bg-stone/15 hover:text-stone";

const iconLinkClass =
  "inline-flex size-9 items-center justify-center rounded-full border border-stone/25 bg-stone/10 text-stone/85 transition-colors hover:border-stone/45 hover:bg-stone/15 hover:text-stone";

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 7.5 12 13l8-5.5M6 18h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function AboutFounderPreviewCard({ founder }: { founder: AboutFounderPreview }) {
  const linkedin = founder.linkedin?.trim() ?? "";
  const email = founder.email?.trim() ?? "";
  const whatsapp = founder.whatsapp?.trim() ?? "";
  const whatsappUrl = whatsappHref(whatsapp);

  return (
    <article className="w-[min(68vw,240px)] shrink-0 snap-start sm:w-[260px] md:w-[280px] lg:w-[300px]">
      <div className="relative aspect-square overflow-hidden bg-stone/10 ring-1 ring-stone/20">
        {cmsImageSrc(founder.portrait) ? (
          <CmsImage
            value={founder.portrait}
            alt={founder.name}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full items-end bg-stone/10 p-4">
            <span className="text-label text-stone/40">No photo</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/92 via-ink/50 to-transparent px-4 pb-4 pt-14 md:px-5 md:pb-5 md:pt-16">
          <h3 className="font-[family-name:var(--font-display)] text-[clamp(1.15rem,1.4vw,1.55rem)] font-light leading-[1.05] tracking-[-0.02em]">
            {founder.name}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {linkedin ? (
              <Link href={linkedin} target="_blank" rel="noreferrer" className={textLinkClass}>
                LinkedIn
              </Link>
            ) : null}
            {email ? (
              <Link
                href={`mailto:${email}`}
                className={iconLinkClass}
                aria-label={`Email ${founder.name}`}
              >
                <EmailIcon className="size-4" />
              </Link>
            ) : null}
            {whatsappUrl ? (
              <Link
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className={iconLinkClass}
                aria-label={`WhatsApp ${founder.name}`}
              >
                <WhatsAppIcon className="size-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
