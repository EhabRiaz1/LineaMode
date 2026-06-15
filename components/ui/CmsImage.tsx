"use client";

import {
  cmsImageMobileStyle,
  cmsImageObjectPosition,
  cmsImageSrc,
  parseCmsImage,
  type CmsImageValue,
} from "@/lib/cms/cms-image";
import { cn } from "@/lib/utils";

type CmsImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "style"
> & {
  value: CmsImageValue | undefined | null;
  style?: React.CSSProperties;
};

/**
 * Renders a CMS image with optional mobile-only focal positioning (below md).
 * Desktop uses the passed className as-is; mobile applies object-position from CMS.
 */
export function CmsImage({ value, className, style, alt = "", ...props }: CmsImageProps) {
  const src = cmsImageSrc(value ?? "");
  if (!src) return null;

  const { mobileFocus } = parseCmsImage(value);
  const mobileStyle = cmsImageMobileStyle(value);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn(
        className,
        mobileStyle &&
          "max-md:object-cover max-md:[object-position:var(--cms-mobile-focus)]",
      )}
      style={{
        ...style,
        ...mobileStyle,
      }}
      {...props}
    />
  );
}

/** Server-safe src helper for places that still use raw img tags with separate mobile classes. */
export function cmsImageProps(value: CmsImageValue | undefined | null) {
  const parsed = parseCmsImage(value);
  return {
    src: parsed.src,
    mobileFocus: parsed.mobileFocus,
    mobileObjectPosition: cmsImageObjectPosition(parsed.mobileFocus),
    mobileStyle: cmsImageMobileStyle(value),
  };
}
