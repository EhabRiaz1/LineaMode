export type SocialPlatform = "linkedin" | "instagram" | "youtube";

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  href: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/lineamode-apparel",
  },
  {
    platform: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/lineamodeapparel",
  },
  {
    platform: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@lineamodeapparel",
  },
];

export const SOCIAL_SAME_AS = SOCIAL_LINKS.map((link) => link.href);
