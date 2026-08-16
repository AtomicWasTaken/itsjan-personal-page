import { defineMiddleware } from "astro:middleware";
import indexMarkdown from "../public/index.md?raw";
import enMarkdown from "../public/en.md?raw";
import deMarkdown from "../public/de.md?raw";

const markdownRoutes: Record<string, string> = {
  "/": indexMarkdown,
  "/en": enMarkdown,
  "/de": deMarkdown,
};

const securityHeaders = {
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const;

function acceptsMarkdown(acceptHeader: string | null): boolean {
  if (!acceptHeader) return false;

  return acceptHeader.split(",").some((entry) => {
    const [mediaType, ...parameters] = entry.trim().toLowerCase().split(";");
    if (mediaType !== "text/markdown") return false;
    const quality = parameters.find((parameter) =>
      parameter.trim().startsWith("q="),
    );
    return !quality || Number.parseFloat(quality.split("=", 2)[1]) > 0;
  });
}

function appendVary(headers: Headers, value: string): void {
  const values = new Set(
    (headers.get("Vary") ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  );
  values.add(value);
  headers.set("Vary", [...values].join(", "));
}

function applyResponseHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  appendVary(headers, "Accept");
  Object.entries(securityHeaders).forEach(([name, value]) =>
    headers.set(name, value),
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const request = context.request;
  const pathname = new URL(request.url).pathname.replace(/\/$/, "") || "/";

  if (
    acceptsMarkdown(request.headers.get("Accept")) &&
    markdownRoutes[pathname]
  ) {
    return applyResponseHeaders(
      new Response(markdownRoutes[pathname], {
        headers: {
          "Cache-Control": "public, max-age=300",
          "Content-Type": "text/markdown; charset=utf-8",
        },
      }),
    );
  }

  return applyResponseHeaders(await next());
});
