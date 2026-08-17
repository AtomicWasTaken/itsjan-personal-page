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
const FRESH_CACHE_URL = `${SITE_ORIGIN}/_cache/github-contributions/fresh`;
const LAST_KNOWN_CACHE_URL = `${SITE_ORIGIN}/_cache/github-contributions/last-known`;
const CACHE_SECONDS = 15 * 60;
const LAST_KNOWN_CACHE_SECONDS = 7 * 24 * 60 * 60;
const FALLBACK_DAYS = 365;
const ACTIVITY_ROWS = 7;
const activeRefreshes = new Set<string>();

export type ContributionCache = Pick<Cache, "match" | "put">;

type GithubContributionOptions = {
  cache?: ContributionCache;
  fetcher?: GithubFetcher;
};

type GithubFetcher = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export type BackgroundScheduler = (task: Promise<void>) => void;

export async function fetchGithubContributions(
  schedule: BackgroundScheduler,
  options: GithubContributionOptions = {},
): Promise<GithubDay[]> {
  const cache = options.cache ?? getEdgeCache();
  const freshCacheKey = new Request(FRESH_CACHE_URL);
  const lastKnownCacheKey = new Request(LAST_KNOWN_CACHE_URL);
  const fresh = await readCachedContributions(cache, freshCacheKey);

  if (fresh) return fresh;

  const lastKnown = await readCachedContributions(cache, lastKnownCacheKey);
  scheduleRefresh(schedule, {
    cache,
    fetcher: options.fetcher ?? fetch,
    freshCacheKey,
    lastKnownCacheKey,
  });

  return lastKnown ?? [];
}

type RefreshOptions = Required<
  Pick<GithubContributionOptions, "cache" | "fetcher">
> & {
  freshCacheKey: Request;
  lastKnownCacheKey: Request;
};

function scheduleRefresh(
  schedule: BackgroundScheduler,
  options: RefreshOptions,
): void {
  if (activeRefreshes.has(FRESH_CACHE_URL)) return;
  activeRefreshes.add(FRESH_CACHE_URL);

  const refresh = refreshContributions(options)
    .catch((error: unknown) => {
      console.error(
        JSON.stringify({
          message: "GitHub contribution refresh failed",
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    })
    .finally(() => activeRefreshes.delete(FRESH_CACHE_URL));

  schedule(refresh);
}

async function refreshContributions({
  cache,
  fetcher,
  freshCacheKey,
  lastKnownCacheKey,
}: RefreshOptions): Promise<void> {
  const response = await fetcher(CONTRIBUTIONS_URL, {
    headers: {
      accept: "text/html",
      "user-agent": `${new URL(SITE_ORIGIN).hostname} contribution graph`,
    },
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}`);

  const contributions = parseGithubContributions(await response.text());
  if (!contributions.length) {
    throw new Error("GitHub returned no contribution days");
  }

  await Promise.all([
    writeCachedContributions(
      cache,
      freshCacheKey,
      contributions,
      CACHE_SECONDS,
    ),
    writeCachedContributions(
      cache,
      lastKnownCacheKey,
      contributions,
      LAST_KNOWN_CACHE_SECONDS,
    ),
  ]);
}

async function readCachedContributions(
  cache: ContributionCache,
  cacheKey: Request,
): Promise<GithubDay[] | undefined> {
  try {
    const cached = await cache.match(cacheKey);
    if (!cached) return undefined;

    const data: unknown = await cached.json();
    if (!Array.isArray(data)) return undefined;

    const contributions = data.filter(isGithubDay);
    return contributions.length ? contributions : undefined;
  } catch {
    return undefined;
  }
}

async function writeCachedContributions(
  cache: ContributionCache,
  cacheKey: Request,
  contributions: GithubDay[],
  maxAge: number,
): Promise<void> {
  try {
    await cache.put(
      cacheKey,
      Response.json(contributions, {
        headers: { "Cache-Control": `public, max-age=${maxAge}` },
      }),
    );
  } catch {
    // Cache failures should not turn a successful refresh into a page failure.
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

function getEdgeCache(): ContributionCache {
  const cache = (
    globalThis.caches as (CacheStorage & { default?: Cache }) | undefined
  )?.default;
  return cache ?? createNoopCache();
}

function createNoopCache(): ContributionCache {
  return {
    match: () => Promise.resolve(undefined),
    put: () => Promise.resolve(),
  };
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
