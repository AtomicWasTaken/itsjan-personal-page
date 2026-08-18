import { describe, expect, mock, test } from "bun:test";

await mock.module("astro:middleware", () => ({
  defineMiddleware: <Middleware>(middleware: Middleware) => middleware,
}));

const { acceptsMarkdown, applyResponseHeaders, contentResponseFor } =
  await import("./middleware");

describe("acceptsMarkdown", () => {
  test("accepts explicit Markdown media types with a positive quality", () => {
    expect(acceptsMarkdown("text/html, text/markdown;q=0.8")).toBeTrue();
    expect(acceptsMarkdown("text/markdown; charset=utf-8")).toBeTrue();
  });

  test("rejects missing, unrelated, and disabled Markdown media types", () => {
    expect(acceptsMarkdown(null)).toBeFalse();
    expect(acceptsMarkdown("text/html, application/json")).toBeFalse();
    expect(acceptsMarkdown("text/markdown;q=0")).toBeFalse();
  });
});

describe("contentResponseFor", () => {
  test("redirects trailing slashes to the canonical URL in one hop", async () => {
    const response = await contentResponseFor(
      new Request("https://preview.example/en/?source=test"),
    );

    expect(response?.status).toBe(308);
    expect(response?.headers.get("Location")).toBe(
      "https://preview.example/en?source=test",
    );
  });

  test("keeps the root URL unchanged", async () => {
    const response = await contentResponseFor(
      new Request("https://preview.example/"),
    );

    expect(response).toBeUndefined();
  });

  test("negotiates localized Markdown and language-aware Vary headers", async () => {
    const response = await contentResponseFor(
      new Request("https://preview.example/", {
        headers: {
          Accept: "text/markdown",
          "Accept-Language": "de-DE,de;q=0.9,en;q=0.5",
        },
      }),
    );

    expect(response?.status).toBe(200);
    expect(response?.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response?.headers.get("Vary")).toContain("Accept");
    expect(response?.headers.get("Vary")).toContain("Accept-Language");
    expect(await response?.text()).toContain("Softwareentwickler");
  });

  test("serves explicit locale routes independently of Accept-Language", async () => {
    const response = await contentResponseFor(
      new Request("https://preview.example/en", {
        headers: {
          Accept: "text/markdown",
          "Accept-Language": "de",
        },
      }),
    );

    expect(await response?.text()).toContain("software developer from Bremen");
    expect(response?.headers.get("Vary")).toBe("Accept");
  });

  test("does not intercept regular HTML requests", async () => {
    const response = await contentResponseFor(
      new Request("https://preview.example/", {
        headers: { Accept: "text/html" },
      }),
    );

    expect(response).toBeUndefined();
  });

  test("serves direct text resources and strips HEAD response bodies", async () => {
    const response = await contentResponseFor(
      new Request("https://preview.example/llms.txt", { method: "HEAD" }),
    );

    expect(response?.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
    expect(response?.headers.get("Cache-Control")).toBe("public, max-age=300");
    expect(await response?.text()).toBe("");
  });

  test("rewrites public resource origins for preview deployments", async () => {
    const response = await contentResponseFor(
      new Request("https://preview.example/index.md"),
    );
    const body = await response?.text();

    expect(body).toContain("https://preview.example");
    expect(body).not.toContain("https://itsjan.dev");
  });
});

describe("applyResponseHeaders", () => {
  test("preserves existing Vary values and applies security headers", () => {
    const response = applyResponseHeaders(
      new Response("ok", {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          Vary: "Accept-Encoding",
        },
      }),
      true,
    );

    expect(response.headers.get("Vary")).toBe(
      "Accept-Encoding, Accept, Accept-Language",
    );
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Permissions-Policy")).toContain("camera=()");
    expect(response.headers.get("Content-Security-Policy")).toContain(
      "frame-ancestors 'none'",
    );
    expect(response.headers.get("Strict-Transport-Security")).toBe(
      "max-age=31536000",
    );
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
