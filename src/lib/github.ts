import type { Locale } from "./locale";
import { SITE_ORIGIN, SOCIAL_HANDLES } from "./site";

export type GithubDay = {
  date: string;
  level: number;
  count: number;
};

export type ActivityDay = {
  label: string;
  level: number;
  project: "other" | "none";
  count: number;
};

const CONTRIBUTIONS_URL = `https://github.com/users/${SOCIAL_HANDLES.github}/contributions`;
const CACHE_URL = `${SITE_ORIGIN}/_cache/github-contributions`;
const CACHE_SECONDS = 15 * 60;
const FALLBACK_DAYS = 365;
const ACTIVITY_ROWS = 7;

export async function fetchGithubContributions(): Promise<GithubDay[]> {
  const cache = getEdgeCache();
  const cacheKey = new Request(CACHE_URL);

  try {
    const cached = await cache?.match(cacheKey);
    if (cached) {
      const data: unknown = await cached.json();
      if (Array.isArray(data)) return data.filter(isGithubDay);
    }

    const response = await fetch(CONTRIBUTIONS_URL, {
      headers: {
        accept: "text/html",
        "user-agent": `${new URL(SITE_ORIGIN).hostname} contribution graph`,
      },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return [];

    const contributions = parseGithubContributions(await response.text());
    if (contributions.length && cache) {
      try {
        await cache.put(
          cacheKey,
          Response.json(contributions, {
            headers: {
              "Cache-Control": `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`,
            },
          }),
        );
      } catch {
        // A cache write should never discard a successful GitHub response.
      }
    }

    return contributions;
  } catch {
    return [];
  }
}

export function buildActivity(
  contributions: GithubDay[],
  locale: Locale,
  labels: { contribution: string; contributions: string },
): ActivityDay[] {
  const today = new Date();
  today.setUTCHours(12, 0, 0, 0);

  const startDate = contributions.length
    ? new Date(`${contributions[0].date}T12:00:00Z`)
    : new Date(today);
  if (!contributions.length)
    startDate.setUTCDate(today.getUTCDate() - (FALLBACK_DAYS - 1));

  const byDate = new Map(contributions.map((day) => [day.date, day]));
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const days = contributions.length || FALLBACK_DAYS;

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + index);
    const contribution = byDate.get(toDateKey(date));
    const count = contribution?.count ?? 0;

    return {
      label: `${formatter.format(date)} · ${count} ${count === 1 ? labels.contribution : labels.contributions}`,
      level: contribution?.level ?? 0,
      project: count ? "other" : "none",
      count,
    };
  });
}

export function activityRevealOrder(index: number): number {
  return Math.floor(index / ACTIVITY_ROWS);
}

export function parseGithubContributions(html: string): GithubDay[] {
  const tooltipCounts = new Map<string, number>();
  const tooltips = /<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/gi;
  let tooltipMatch: RegExpExecArray | null;

  while ((tooltipMatch = tooltips.exec(html))) {
    const target = readAttribute(tooltipMatch[1], "for");
    if (!target) continue;
    const text = tooltipMatch[2]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    tooltipCounts.set(target, readContributionCount(text));
  }

  const daysByDate = new Map<string, GithubDay>();
  const cells = /<td\b([^>]*)>\s*<\/td>/gi;
  let cellMatch: RegExpExecArray | null;

  while ((cellMatch = cells.exec(html))) {
    const attributes = cellMatch[1];
    if (!/\bContributionCalendar-day\b/i.test(attributes)) continue;

    const date = readAttribute(attributes, "data-date");
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

    const level = clamp(
      Number(readAttribute(attributes, "data-level") ?? 0),
      0,
      4,
    );
    const directCount = readAttribute(attributes, "data-count");
    const id = readAttribute(attributes, "id");
    const count =
      directCount === undefined
        ? id
          ? (tooltipCounts.get(id) ?? 0)
          : 0
        : readContributionCount(directCount);

    daysByDate.set(date, { date, level, count });
  }

  return [...daysByDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function getEdgeCache(): Cache | undefined {
  return (globalThis.caches as (CacheStorage & { default?: Cache }) | undefined)
    ?.default;
}

function isGithubDay(value: unknown): value is GithubDay {
  if (!value || typeof value !== "object") return false;
  const day = value as Partial<GithubDay>;
  return (
    typeof day.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(day.date) &&
    Number.isInteger(day.level) &&
    day.level! >= 0 &&
    day.level! <= 4 &&
    Number.isInteger(day.count) &&
    day.count! >= 0
  );
}

function readAttribute(attributes: string, name: string): string | undefined {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return attributes.match(new RegExp(`\\b${escapedName}="([^"]*)"`, "i"))?.[1];
}

function readContributionCount(value: string): number {
  if (/\bno contributions?\b/i.test(value)) return 0;
  const digits = value.match(/[\d][\d,.\s]*/)?.[0].replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(
    max,
    Math.max(min, Number.isFinite(value) ? Math.round(value) : min),
  );
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
