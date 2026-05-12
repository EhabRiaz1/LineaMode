import { SITE_NAME, SITE_TAGLINE, SITE_URL, SQUARE_LOGO_PATH } from "@/lib/seo/site";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: "Lineamode",
  url: SITE_URL,
  logo: `${SITE_URL}${SQUARE_LOGO_PATH}`,
  slogan: SITE_TAGLINE,
  description:
    "End-to-end clothing manufacturer with specializations in knitwear garments made of performance polyesters. Design support, product development, and agile manufacturing for global fashion brands.",
  foundingDate: "2024",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1st Floor, NESPAK House, G-5/2, Attaturk Avenue",
    addressLocality: "Islamabad",
    addressCountry: "PK",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "saif@lineamode.com",
    contactType: "Sales",
    areaServed: "Worldwide",
    availableLanguage: ["en"],
  },
  sameAs: ["https://www.linkedin.com/company/lineamode-apparel"],
};
