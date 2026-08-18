import { defineMiddleware } from "astro:middleware";
import agentSkillDiscovery from "./content/resources/.well-known/agent-skills/index.json?raw";
import authMarkdown from "./content/resources/auth.md?raw";
import deMarkdown from "./content/resources/de.md?raw";
import enMarkdown from "./content/resources/en.md?raw";
import indexMarkdown from "./content/resources/index.md?raw";
import llmsFullText from "./content/resources/llms-full.txt?raw";
import llmsText from "./content/resources/llms.txt?raw";
import privacyDeMarkdown from "./content/resources/privacy.de.md?raw";
import privacyEnMarkdown from "./content/resources/privacy.en.md?raw";
import profileSkillMarkdown from "./content/resources/skills/itsjan-profile/SKILL.md?raw";
import { detectLocale } from "./lib/locale";
import { SITE_ORIGIN } from "./lib/site";

const markdownRoutes: Record<string, string> = {
  "/en": enMarkdown,
  "/de": deMarkdown,
};

const textResources: Record<string, { body: string; contentType: string }> = {
  "/auth.md": {
    body: authMarkdown,
    contentType: "text/markdown; charset=utf-8",
  },
  "/de.md": {
    body: deMarkdown,
    contentType: "text/markdown; charset=utf-8",
  },
  "/en.md": {
    body: enMarkdown,
    contentType: "text/markdown; charset=utf-8",
  },
  "/index.md": {
    body: indexMarkdown,
    contentType: "text/markdown; charset=utf-8",
  },
  "/llms-full.txt": {
    body: llmsFullText,
    contentType: "text/plain; charset=utf-8",
  },
  "/llms.txt": {
    body: llmsText,
    contentType: "text/plain; charset=utf-8",
  },
  "/privacy.de.md": {
    body: privacyDeMarkdown,
    contentType: "text/markdown; charset=utf-8",
  },
  "/privacy.en.md": {
    body: privacyEnMarkdown,
    contentType: "text/markdown; charset=utf-8",
  },
  "/skills/itsjan-profile/SKILL.md": {
    body: profileSkillMarkdown,
    contentType: "text/markdown; charset=utf-8",
  },
};

function markdownFor(request: Request, pathname: string): string | undefined {
  if (pathname === "/") {
    return detectLocale(request) === "de" ? deMarkdown : indexMarkdown;
  }
  if (pathname === "/privacy") {
    return detectLocale(request) === "de"
      ? privacyDeMarkdown
      : privacyEnMarkdown;
  }
  return markdownRoutes[pathname];
}

// Worker responses own security policy because HTML and negotiated text are
// generated dynamically. public/_headers only owns static asset MIME/cache rules.
const contentSecurityPolicy = [
  "base-uri 'self'",
  "connect-src 'self' https://t.itsjan.dev",
  "default-src 'self'",
  "font-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://t.itsjan.dev",
  "style-src 'self' 'unsafe-inline'",
  "worker-src 'self' blob:",
].join("; ");

const securityHeaders = {
  "Content-Security-Policy": contentSecurityPolicy,
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const;

export function acceptsMarkdown(acceptHeader: string | null): boolean {
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

function withRequestOrigin(content: string, request: Request): string {
  return content.replaceAll(SITE_ORIGIN, new URL(request.url).origin);
}

async function localizedAgentSkillDiscovery(request: Request): Promise<string> {
  const discovery = JSON.parse(agentSkillDiscovery) as {
    skills?: Array<{ name: string; url: string; digest: string }>;
  };
  const profileSkill = withRequestOrigin(profileSkillMarkdown, request);
  const digestBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(profileSkill),
  );
  const digest = [...new Uint8Array(digestBuffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  const entry = discovery.skills?.find(
    (skill) => skill.name === "itsjan-profile",
  );

  if (entry) {
    entry.url = new URL("/skills/itsjan-profile/SKILL.md", request.url).href;
    entry.digest = `sha256:${digest}`;
  }

  return `${JSON.stringify(discovery, null, 2)}\n`;
}

function textResponse(
  request: Request,
  body: string,
  contentType: string,
): Response {
  return new Response(
    request.method === "HEAD" ? null : withRequestOrigin(body, request),
    {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Content-Type": contentType,
      },
    },
  );
}

export function applyResponseHeaders(
  response: Response,
  variesByLanguage = false,
): Response {
  const headers = new Headers(response.headers);
  appendVary(headers, "Accept");
  if (variesByLanguage) appendVary(headers, "Accept-Language");
  Object.entries(securityHeaders).forEach(([name, value]) =>
    headers.set(name, value),
  );
  if (
    headers.get("Content-Type")?.startsWith("text/html") &&
    !headers.has("Cache-Control")
  ) {
    headers.set("Cache-Control", "no-store");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function contentResponseFor(
  request: Request,
): Promise<Response | undefined> {
  const requestUrl = new URL(request.url);
  const pathname = requestUrl.pathname.replace(/\/+$/, "") || "/";

  if (requestUrl.pathname !== pathname) {
    requestUrl.pathname = pathname;
    return applyResponseHeaders(
      new Response(null, {
        status: 308,
        headers: { Location: requestUrl.href },
      }),
    );
  }

  const markdown = markdownFor(request, pathname);
  const textResource = textResources[pathname];

  if (pathname === "/.well-known/agent-skills/index.json") {
    return applyResponseHeaders(
      textResponse(
        request,
        await localizedAgentSkillDiscovery(request),
        "application/json; charset=utf-8",
      ),
    );
  }

  if (textResource) {
    return applyResponseHeaders(
      textResponse(request, textResource.body, textResource.contentType),
    );
  }

  if (acceptsMarkdown(request.headers.get("Accept")) && markdown) {
    return applyResponseHeaders(
      textResponse(request, markdown, "text/markdown; charset=utf-8"),
      pathname === "/" || pathname === "/privacy",
    );
  }

  return undefined;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const contentResponse = await contentResponseFor(context.request);
  if (contentResponse) return contentResponse;

  return applyResponseHeaders(await next());
});
