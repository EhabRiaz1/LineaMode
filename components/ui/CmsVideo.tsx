"use client";

import { forwardRef, type Ref } from "react";
import {
  cmsImageMobileStyle,
  cmsImageMobileSrc,
  cmsImageSrc,
  hasDistinctMobileSrc,
  type CmsImageValue,
} from "@/lib/cms/cms-image";
import { cn } from "@/lib/utils";

type CmsVideoProps = Omit<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  "src" | "style"
> & {
  value: CmsImageValue | undefined | null;
  style?: React.CSSProperties;
  /** Ref for the mobile video element when a distinct mobile asset is set. */
  mobileVideoRef?: Ref<HTMLVideoElement>;
};

/**
 * Renders a CMS video with optional separate mobile asset and mobile-only focal positioning.
 * Desktop uses `src`; below md uses `mobileSrc` when set, otherwise `src` with focal crop.
 */
export const CmsVideo = forwardRef<HTMLVideoElement, CmsVideoProps>(function CmsVideo(
  { value, className, style, mobileVideoRef, ...props },
  ref,
) {
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
        <video
          ref={ref}
          src={desktopSrc}
          className={cn(className, "hidden md:block")}
          style={style}
          {...props}
        />
        <video
          ref={mobileVideoRef}
          src={mobileSrc}
          className={cn(className, "block md:hidden", mobileClasses)}
          style={{ ...style, ...mobileStyle }}
          {...props}
        />
      </>
    );
  }

  return (
    <video
      ref={ref}
      src={desktopSrc}
      className={cn(className, mobileClasses)}
      style={{
        ...style,
        ...mobileStyle,
      }}
      {...props}
    />
  );
});
