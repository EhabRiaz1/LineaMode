import type { Variants } from "motion/react";
import { dur, easeBrand } from "./easings";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: dur.m, ease: easeBrand },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: dur.l, ease: easeBrand },
  },
};

export const stagger = (delayChildren = 0, staggerChildren = 0.06): Variants => ({
  hidden: {},
  show: {
    transition: {
      delayChildren,
      staggerChildren,
    },
  },
});

export const maskRise: Variants = {
  hidden: { y: "110%" },
  show: {
    y: "0%",
    transition: { duration: dur.l, ease: easeBrand },
  },
};

export const imageMaskReveal: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)" },
  show: {
    clipPath: "inset(0% 0 0 0)",
    transition: { duration: dur.xl, ease: easeBrand },
  },
};
