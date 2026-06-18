"use client";

import { forwardRef } from "react";
import {
  cmsImageMobileStyle,
  cmsImageSrc,
  type CmsImageValue,
} from "@/lib/cms/cms-image";
import { cn } from "@/lib/utils";

type CmsVideoProps = Omit<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  "src" | "style"
> & {
  value: CmsImageValue | undefined | null;
  style?: React.CSSProperties;
};

/**
 * Renders a CMS video with optional mobile-only focal positioning (below md).
 * Desktop uses the passed className as-is; mobile applies object-position from CMS.
 */
export const CmsVideo = forwardRef<HTMLVideoElement, CmsVideoProps>(function CmsVideo(
  { value, className, style, ...props },
  ref,
) {
  const src = cmsImageSrc(value ?? "");
  if (!src) return null;

  const mobileStyle = cmsImageMobileStyle(value);

  return (
    <video
      ref={ref}
      src={src}
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
});
