import { describe, expect, test } from "bun:test";
import { detectLocale } from "./locale";

const request = (path: string, acceptLanguage?: string) =>
  new Request(`https://itsjan.dev${path}`, {
    headers: acceptLanguage ? { "Accept-Language": acceptLanguage } : undefined,
  });

describe("detectLocale", () => {
  test("prefers an explicit locale route", () => {
    expect(detectLocale(request("/de", "en-US"))).toBe("de");
    expect(detectLocale(request("/en", "de-DE"))).toBe("en");
  });

  test("respects quality values and ignores rejected languages", () => {
    expect(detectLocale(request("/", "de-DE;q=0.4, en-US;q=0.9"))).toBe("en");
    expect(detectLocale(request("/", "de;q=0"))).toBe("en");
  });

  test("defaults to English for unsupported or missing languages", () => {
    expect(detectLocale(request("/", "fr-FR"))).toBe("en");
    expect(detectLocale(request("/"))).toBe("en");
  });
});
