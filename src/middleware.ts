import { defineMiddleware } from "astro:middleware";
import indexMarkdown from "../public/index.md?raw";
import enMarkdown from "../public/en.md?raw";
import deMarkdown from "../public/de.md?raw";

const markdownRoutes: Record<string, string> = {
  "/": indexMarkdown,
  "/en": enMarkdown,
  "/de": deMarkdown,
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
    return new Response(markdownRoutes[pathname], {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Vary: "Accept",
      },
    });
  }

  const response = await next();
  response.headers.append("Vary", "Accept");
  return response;
});
