import { describe, expect, test } from "bun:test";
import { tr } from "./i18n";

describe("localized metadata", () => {
  test("keeps portfolio descriptions unique and search-result friendly", () => {
    const english = tr("en").meta.description;
    const german = tr("de").meta.description;

    expect(english).not.toBe(german);
    expect(english.length).toBeWithin(140, 160);
    expect(german.length).toBeWithin(140, 160);
  });

  test("describes visible portfolio work and technologies", () => {
    for (const description of [
      tr("en").meta.description,
      tr("de").meta.description,
    ]) {
      expect(description).toContain("Finny");
      expect(description).toContain("Ventry");
      expect(description).toContain("PHP");
      expect(description).toContain("TypeScript");
      expect(description).toContain("React");
    }
  });
});
