import { defineMiddleware } from "astro:middleware";

const markdownRoutes: Record<string, string> = {
  "/": "/index.md",
  "/en": "/en.md",
  "/de": "/de.md",
};

export const onRequest = defineMiddleware(async (context, next) => {
  const request = context.request;
  const pathname = new URL(request.url).pathname.replace(/\/$/, "") || "/";
  const acceptsMarkdown = request.headers
    .get("accept")
    ?.toLowerCase()
    .split(",")
    .some((value) => value.trim().split(";", 1)[0] === "text/markdown");

  if (acceptsMarkdown && markdownRoutes[pathname]) {
    const markdownUrl = new URL(markdownRoutes[pathname], request.url);
    // Fetch the public asset directly. Rewriting the request through Astro's
    // page fallback can redirect back to `/`, creating a loop for agents.
    const assetResponse = await fetch(markdownUrl, {
      headers: { accept: "*/*" },
    });
    if (!assetResponse.ok) return next();

    const response = new Response(assetResponse.body, assetResponse);
    response.headers.set("Content-Type", "text/markdown; charset=utf-8");
    response.headers.append("Vary", "Accept");
    return response;
  }

  const response = await next();
  response.headers.append("Vary", "Accept");
  return response;
});
