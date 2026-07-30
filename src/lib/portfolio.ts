export type Technology = {
  name: string;
  logo: string;
  href: string;
  darkModeLight?: boolean;
};

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

export type StickerPlacement = {
  side: "left" | "right";
  topPercent: number;
  offsetPercent: number;
  size: number;
  rotation: number;
};

const EXPERIENCE_ONLY_TECHNOLOGIES: Technology[] = [
  {
    name: "Symfony",
    logo: "/logos/symfony.svg",
    href: "https://symfony.com/",
    darkModeLight: true,
  },
  {
    name: "Git",
    logo: "/logos/git.svg",
    href: "https://git-scm.com/",
  },
];

const FEATURED_MOBILE_TECHNOLOGIES = [
  "PHP",
  "TypeScript",
  "React",
  "Next.js",
  "TYPO3",
  "Symfony",
  "Git",
  "Docker",
];

const GITHUB_CONTRIBUTIONS_URL = "https://github.com/users/AtomicWasTaken/contributions";
const GITHUB_CONTRIBUTIONS_CACHE_URL = "https://itsjan.dev/_cache/github-contributions";
const GITHUB_CONTRIBUTIONS_CACHE_SECONDS = 15 * 60;
const ACTIVITY_DAYS_FALLBACK = 365;
const ACTIVITY_ROWS = 7;
const STICKER_HORIZONTAL_BANDS = [[7, 24], [36, 59], [72, 94]] as const;

export function createTechnologyCollections(technologies: Technology[]) {
  const all = [...technologies, ...EXPERIENCE_ONLY_TECHNOLOGIES];
  const byName = new Map(all.map((technology) => [technology.name, technology]));
  const featured = FEATURED_MOBILE_TECHNOLOGIES
    .map((name) => byName.get(name))
    .filter((technology): technology is Technology => Boolean(technology));

  return {
    all,
    featured,
    additional: all.filter((technology) => !FEATURED_MOBILE_TECHNOLOGIES.includes(technology.name)),
    find: (names: string[]) => names
      .map((name) => byName.get(name))
      .filter((technology): technology is Technology => Boolean(technology)),
  };
}

export async function fetchGithubContributions(): Promise<GithubDay[]> {
  const cache = getEdgeCache();
  const cacheKey = new Request(GITHUB_CONTRIBUTIONS_CACHE_URL);

  try {
    const cached = await cache?.match(cacheKey);
    if (cached) return await cached.json<GithubDay[]>();

    const response = await fetch(GITHUB_CONTRIBUTIONS_URL, {
      headers: {
        accept: "text/html",
        "user-agent": "itsjan.dev contribution graph",
      },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return [];

    const contributions = parseGithubContributions(await response.text());
    if (contributions.length && cache) {
      await cache.put(cacheKey, Response.json(contributions, {
        headers: { "Cache-Control": `public, max-age=${GITHUB_CONTRIBUTIONS_CACHE_SECONDS}` },
      }));
    }

    return contributions;
  } catch {
    return [];
  }
}

function getEdgeCache(): Cache | undefined {
  return (globalThis.caches as CacheStorage & { default?: Cache } | undefined)?.default;
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
  if (!contributions.length) startDate.setUTCDate(today.getUTCDate() - (ACTIVITY_DAYS_FALLBACK - 1));

  const byDate = new Map(contributions.map((day) => [day.date, day]));
  const formatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" });
  const days = contributions.length || ACTIVITY_DAYS_FALLBACK;

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

export function createStickerLayout(count: number): StickerPlacement[] {
  const leftCount = Math.ceil(count / 2);
  const rightCount = count - leftCount;

  return shuffle([
    ...createStickerSideLayout("left", leftCount),
    ...createStickerSideLayout("right", rightCount),
  ]);
}

export function toStickerStyle(placement: StickerPlacement): string {
  return `top:${placement.topPercent}%; --sticker-x:${placement.offsetPercent}%; --icon-size:min(${placement.size}px,5vh); --sticker-rotation:${placement.rotation}deg`;
}

export function activityRevealOrder(index: number): number {
  return Math.floor(index / ACTIVITY_ROWS);
}

function parseGithubContributions(html: string): GithubDay[] {
  const days: GithubDay[] = [];
  const cells = /<td\b([^>]*)><\/td>/gi;
  let cell: RegExpExecArray | null;

  while ((cell = cells.exec(html))) {
    const attributes = cell[1];
    if (!/\bContributionCalendar-day\b/i.test(attributes)) continue;

    const date = attributes.match(/\bdata-date="([^"]+)"/i)?.[1];
    if (!date) continue;

    const level = Number(attributes.match(/\bdata-level="(\d+)"/i)?.[1] ?? 0);
    const tooltip = html
      .slice(cell.index + cell[0].length, cell.index + cell[0].length + 600)
      .match(/<tool-tip\b[^>]*>([\s\S]*?)<\/tool-tip>/i)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .trim();
    const count = Number(tooltip?.match(/\b(\d+)\s+contributions?\b/i)?.[1] ?? 0);

    days.push({ date, level: Math.min(4, Math.max(0, level)), count });
  }

  return days.sort((a, b) => a.date.localeCompare(b.date));
}

function createStickerSideLayout(side: StickerPlacement["side"], count: number): StickerPlacement[] {
  const firstTop = 4;
  const lastTop = 88;
  const step = count > 1 ? (lastTop - firstTop) / (count - 1) : 0;
  const verticalJitter = step * 0.02;
  const bands = createBandOrder(count);

  return Array.from({ length: count }, (_, row) => {
    const [bandStart, bandEnd] = STICKER_HORIZONTAL_BANDS[bands[row]];
    const topPercent = count > 1
      ? firstTop + row * step + (Math.random() * 2 - 1) * verticalJitter
      : (firstTop + lastTop) / 2;

    return {
      side,
      topPercent,
      offsetPercent: bandStart + Math.random() * (bandEnd - bandStart),
      size: randomInteger(31, 43),
      rotation: randomInteger(-10, 10),
    };
  });
}

function createBandOrder(count: number): number[] {
  const order: number[] = [];
  while (order.length < count) {
    const group = shuffle([0, 1, 2]);
    if (order.at(-1) === group[0]) [group[0], group[1]] = [group[1], group[0]];
    order.push(...group);
  }
  return order.slice(0, count);
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInteger(0, index);
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}
