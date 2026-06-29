"use client";

import {
  cmsImageMobileStyle,
  cmsImageObjectPosition,
  cmsImageMobileSrc,
  cmsImageSrc,
  hasDistinctMobileSrc,
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
 * Renders a CMS image with optional separate mobile asset and mobile-only focal positioning.
 * Desktop uses `src`; below md uses `mobileSrc` when set, otherwise `src` with focal crop.
 */
export function CmsImage({ value, className, style, alt = "", ...props }: CmsImageProps) {
  const desktopSrc = cmsImageSrc(value ?? "");
  if (!desktopSrc) return null;

  const mobileStyle = cmsImageMobileStyle(value);
  const mobileClasses =
    mobileStyle &&
    "max-md:object-cover max-md:[object-position:var(--cms-mobile-focus)]";

  if (hasDistinctMobileSrc(value)) {
    const mobileSrc = cmsImageMobileSrc(value ?? "");
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={desktopSrc}
          alt={alt}
          className={cn(className, "hidden md:block")}
          style={style}
          {...props}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mobileSrc}
          alt={alt}
          className={cn(className, "block md:hidden", mobileClasses)}
          style={{ ...style, ...mobileStyle }}
          {...props}
        />
      </>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={desktopSrc}
      alt={alt}
      className={cn(className, mobileClasses)}
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
    mobileSrc: cmsImageMobileSrc(value),
    hasDistinctMobile: hasDistinctMobileSrc(value),
    mobileFocus: parsed.mobileFocus,
    mobileObjectPosition: cmsImageObjectPosition(parsed.mobileFocus),
    mobileStyle: cmsImageMobileStyle(value),
  };
}
