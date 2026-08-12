import type { APIRoute } from "astro";

export const prerender = false;

// First-party reverse proxy for PostHog. Capture requests reach itsjan.dev,
// not a posthog.com domain, so ad blockers do not drop them. Static assets go
// to eu-assets.i.posthog.com. Every other path is capture data and goes to
// eu.i.posthog.com.
const PREFIX = "/relay";
const API_HOST = "eu.i.posthog.com";
const ASSET_HOST = "eu-assets.i.posthog.com";

export const ALL: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const path = url.pathname.slice(PREFIX.length) || "/";
  const targetHost = path.startsWith("/static/") ? ASSET_HOST : API_HOST;

  const proxyRequest = new Request(`https://${targetHost}${path}${url.search}`, request);
  proxyRequest.headers.delete("cookie");

  return fetch(proxyRequest);
};
