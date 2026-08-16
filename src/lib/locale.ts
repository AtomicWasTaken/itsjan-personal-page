export type Locale = "en" | "de";

export function detectLocale(request: Request): Locale {
  const pathLocale = new URL(request.url).pathname.split("/")[1];
  if (pathLocale === "de" || pathLocale === "en") return pathLocale;

  const preferences = (request.headers.get("Accept-Language") ?? "")
    .split(",")
    .map((entry, index) => {
      const [tag, ...parameters] = entry.trim().toLowerCase().split(";");
      const qualityParameter = parameters.find((parameter) =>
        parameter.trim().startsWith("q="),
      );
      const parsedQuality = qualityParameter
        ? Number.parseFloat(qualityParameter.split("=", 2)[1])
        : 1;
      return {
        tag,
        quality: Number.isFinite(parsedQuality) ? parsedQuality : 0,
        index,
      };
    })
    .filter(({ quality }) => quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const { tag } of preferences) {
    if (tag === "de" || tag.startsWith("de-")) return "de";
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }

  return "en";
}
