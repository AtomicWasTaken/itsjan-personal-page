import { describe, expect, test } from "bun:test";
import { buildPageSchema } from "./schema";

const pageSchema = (
  locale: "en" | "de",
  path: string,
  type:
    "Article" | "CollectionPage" | "ProfilePage" | "WebPage" = "ProfilePage",
) =>
  buildPageSchema({
    type,
    url: `https://itsjan.dev${path}`,
    title: locale === "de" ? "Deutsches Portfolio" : "English portfolio",
    description:
      locale === "de" ? "Deutsche Beschreibung" : "English description",
    locale,
  });

describe("buildPageSchema", () => {
  test("keeps Person and WebSite entities stable across locales", () => {
    const english = pageSchema("en", "/en");
    const german = pageSchema("de", "/de");

    expect(english["@graph"][0]).toEqual(german["@graph"][0]);
    expect(english["@graph"][1]).toEqual(german["@graph"][1]);
    expect(english["@graph"][1].inLanguage).toEqual(["en", "de"]);
  });

  test("creates a unique localized ProfilePage connected to stable entities", () => {
    const schema = pageSchema("de", "/de");
    const page = schema["@graph"][2];

    expect(page).toMatchObject({
      "@type": "ProfilePage",
      "@id": "https://itsjan.dev/de#page",
      url: "https://itsjan.dev/de",
      name: "Deutsches Portfolio",
      description: "Deutsche Beschreibung",
      inLanguage: "de",
      isPartOf: { "@id": "https://itsjan.dev/#website" },
      mainEntity: { "@id": "https://itsjan.dev/#person" },
    });
  });

  test("uses an author relationship for non-profile pages", () => {
    const schema = pageSchema("en", "/en/privacy", "WebPage");
    const page = schema["@graph"][2];

    expect(page["@type"]).toBe("WebPage");
    expect(page).toHaveProperty("author", {
      "@id": "https://itsjan.dev/#person",
    });
    expect(page).not.toHaveProperty("mainEntity");
  });

  test("supports project indexes and case-study articles", () => {
    for (const type of ["CollectionPage", "Article"] as const) {
      const page = pageSchema("en", "/en/projects", type)["@graph"][2];
      expect(page["@type"]).toBe(type);
      expect(page).toHaveProperty("author", {
        "@id": "https://itsjan.dev/#person",
      });
    }
  });

  test("describes the software covered by a case-study article", () => {
    const schema = buildPageSchema({
      type: "Article",
      url: "https://itsjan.dev/en/projects/finny",
      title: "Finny case study",
      description: "How Finny works.",
      locale: "en",
      about: { name: "Finny", url: "https://fnny.app" },
      publishedAt: "2026-08-18",
    });
    const article = schema["@graph"][2];

    expect(article).toMatchObject({
      "@type": "Article",
      headline: "Finny case study",
      image: "https://itsjan.dev/og.png",
      datePublished: "2026-08-18",
      dateModified: "2026-08-18",
      about: {
        "@type": "SoftwareApplication",
        name: "Finny",
        url: "https://fnny.app",
      },
    });
  });
});
