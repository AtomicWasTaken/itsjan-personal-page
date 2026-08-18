import type { Locale } from "./locale";
import {
  CONTACT_EMAIL,
  PERSON_NAME,
  PROFILE_IMAGE_URL,
  SITE_NAME,
  SITE_ORIGIN,
  SOCIAL_LINKS,
} from "./site";

export type PageSchemaType =
  "Article" | "CollectionPage" | "ProfilePage" | "WebPage";

interface PageSchemaInput {
  type: PageSchemaType;
  url: string;
  title: string;
  description: string;
  locale: Locale;
}

export function buildPageSchema({
  type,
  url,
  title,
  description,
  locale,
}: PageSchemaInput) {
  const personId = `${SITE_ORIGIN}/#person`;
  const websiteId = `${SITE_ORIGIN}/#website`;
  const pageId = `${url}#page`;
  const personReference = { "@id": personId };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: PERSON_NAME,
        url: SITE_ORIGIN,
        image: PROFILE_IMAGE_URL,
        jobTitle: "Software Developer",
        email: CONTACT_EMAIL,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bremen",
          addressCountry: "DE",
        },
        sameAs: Object.values(SOCIAL_LINKS),
        knowsAbout: [
          "PHP",
          "TypeScript",
          "React",
          "Next.js",
          "TYPO3",
          "Symfony",
          "Cloudflare",
        ],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: SITE_NAME,
        url: SITE_ORIGIN,
        inLanguage: ["en", "de"],
        publisher: personReference,
      },
      {
        "@type": type,
        "@id": pageId,
        url,
        name: title,
        description,
        inLanguage: locale,
        isPartOf: { "@id": websiteId },
        ...(type === "ProfilePage"
          ? { mainEntity: personReference }
          : { author: personReference }),
      },
    ],
  };
}
