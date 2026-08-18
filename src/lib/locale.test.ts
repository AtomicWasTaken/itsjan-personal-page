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

  test("keeps the x-default route English regardless of Accept-Language", () => {
    expect(detectLocale(request("/", "de-DE,de;q=0.9"))).toBe("en");
    expect(detectLocale(request("/", "en-US;q=0.2,de;q=1"))).toBe("en");
  });

  test("defaults unprefixed routes to English", () => {
    expect(detectLocale(request("/", "fr-FR"))).toBe("en");
    expect(detectLocale(request("/"))).toBe("en");
    expect(detectLocale(request("/privacy", "de-DE"))).toBe("en");
  });
});
