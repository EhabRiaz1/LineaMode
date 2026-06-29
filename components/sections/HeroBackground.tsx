"use client";

import {
  motion,
  useInView,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef } from "react";
import { easeBrand } from "@/lib/motion/easings";
import { CmsImage } from "@/components/ui/CmsImage";
import { CmsVideo } from "@/components/ui/CmsVideo";
import {
  cmsImageSrc,
  hasDistinctMobileSrc,
  type CmsImageValue,
} from "@/lib/cms/cms-image";

type HeroBackgroundProps = {
  image: CmsImageValue;
  video?: CmsImageValue;
  mediaMode?: "image" | "video";
};

function ImageLayer({
  image,
  filter,
  wobble,
}: {
  image: CmsImageValue;
  filter: MotionValue<string>;
  wobble: MotionValue<number>;
}) {
  return (
    <motion.div
      className="absolute inset-0"
      style={{
        filter,
        scale: wobble,
        willChange: "filter, transform",
      }}
    >
      <CmsImage
        value={image}
        alt=""
        aria-hidden
        className="h-full w-full object-cover md:object-[center_25%]"
        draggable={false}
      />
    </motion.div>
  );
}

function syncHeroVideoPlayback(
  inView: boolean,
  desktopRef: HTMLVideoElement | null,
  mobileRef: HTMLVideoElement | null,
  distinctMobile: boolean,
) {
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  const active =
    distinctMobile && isMobile ? mobileRef : desktopRef ?? mobileRef;
  const inactive =
    distinctMobile && isMobile ? desktopRef : mobileRef;

  inactive?.pause();

  if (!active) return;

  if (inView) {
    void active.play().catch(() => {
      // Autoplay can be blocked; poster remains visible.
    });
  } else {
    active.pause();
  }
}

export function HeroBackground({ image, video, mediaMode = "image" }: HeroBackgroundProps) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "0px 0px 0px 0px" });
  const useVideo = mediaMode === "video" && Boolean(cmsImageSrc(video)) && !reduce;
  const distinctMobileVideo = Boolean(video && hasDistinctMobileSrc(video));
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, {
    damping: 28,
    stiffness: 220,
    mass: 0.5,
  });

  const blurPx = useTransform(smooth, (v) =>
    !inView || reduce || useVideo ? 0 : Math.min(8, Math.abs(v) / 240),
  );
  const saturate = useTransform(smooth, (v) =>
    !inView || reduce || useVideo ? 1 : 1 + Math.min(0.18, Math.abs(v) / 6000),
  );
  const wobble = useTransform(smooth, (v) =>
    !inView || reduce || useVideo ? 1 : 1 + Math.min(0.012, Math.abs(v) / 90000),
  );
  const filter = useMotionTemplate`blur(${blurPx}px) saturate(${saturate})`;

  useEffect(() => {
    if (!useVideo) return;

    const run = () => {
      syncHeroVideoPlayback(
        inView,
        videoRef.current,
        mobileVideoRef.current,
        distinctMobileVideo,
      );
    };

    run();

    const mq = window.matchMedia("(max-width: 767px)");
    mq.addEventListener("change", run);
    return () => mq.removeEventListener("change", run);
  }, [useVideo, inView, distinctMobileVideo]);

  return (
    <motion.div
      ref={rootRef}
      className="absolute inset-0"
      initial={{ opacity: 0, scale: 1.06 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.6, ease: easeBrand, delay: 0.2 }}
    >
      {useVideo ? (
        <CmsVideo
          ref={videoRef}
          mobileVideoRef={mobileVideoRef}
          value={video}
          className="absolute inset-0 h-full w-full object-cover md:object-[center_25%]"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
        />
      ) : (
        <ImageLayer image={image} filter={filter} wobble={wobble} />
      )}
    </motion.div>
  );
}
