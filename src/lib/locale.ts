export type Locale = "en" | "de";

export function detectLocale(request: Request): Locale {
  const pathLocale = new URL(request.url).pathname.split("/")[1];
  if (pathLocale === "de" || pathLocale === "en") return pathLocale;
  return "en";
}
