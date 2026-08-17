import { describe, expect, mock, spyOn, test } from "bun:test";
import {
  buildActivity,
  fetchGithubContributions,
  parseGithubContributions,
  type ContributionCache,
  type GithubDay,
} from "./github";

const FRESH_CACHE_URL = "https://itsjan.dev/_cache/github-contributions/fresh";
const LAST_KNOWN_CACHE_URL =
  "https://itsjan.dev/_cache/github-contributions/last-known";

function createCache(initial: Record<string, GithubDay[]> = {}): {
  cache: ContributionCache;
  values: Map<string, GithubDay[]>;
} {
  const values = new Map(Object.entries(initial));
  const cache: ContributionCache = {
    match(request) {
      const value = values.get(
        request instanceof Request ? request.url : request.toString(),
      );
      return Promise.resolve(value ? Response.json(value) : undefined);
    },
    async put(request, response) {
      const url = request instanceof Request ? request.url : request.toString();
      values.set(url, (await response.json()) as GithubDay[]);
    },
  };

  return { cache, values };
}

function contribution(count = 3): GithubDay {
  return { date: "2026-08-17", level: 2, count };
}

describe("fetchGithubContributions", () => {
  test("returns a fresh cache hit without scheduling a refresh", async () => {
    const { cache } = createCache({
      [FRESH_CACHE_URL]: [contribution()],
    });
    const schedule = mock(() => undefined);
    const fetcher = mock(() => Promise.resolve(new Response("unused")));

    const result = await fetchGithubContributions(schedule, {
      cache,
      fetcher,
    });

    expect(result).toEqual([contribution()]);
    expect(schedule).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
  });

  test("returns a cold-cache fallback before the upstream request settles", async () => {
    const { cache, values } = createCache();
    const tasks: Promise<void>[] = [];
    let resolveUpstream: (response: Response) => void = () => undefined;
    const upstream = new Promise<Response>((resolve) => {
      resolveUpstream = resolve;
    });

    const result = await fetchGithubContributions((task) => tasks.push(task), {
      cache,
      fetcher: () => upstream,
    });

    expect(result).toEqual([]);
    expect(tasks).toHaveLength(1);
    expect(values.size).toBe(0);

    resolveUpstream(
      new Response(
        '<td class="ContributionCalendar-day" data-date="2026-08-17" data-level="2" data-count="3"></td>',
      ),
    );
    await tasks[0];

    expect(values.get(FRESH_CACHE_URL)).toEqual([contribution()]);
    expect(values.get(LAST_KNOWN_CACHE_URL)).toEqual([contribution()]);
  });

  test("serves last-known data when a background refresh times out", async () => {
    const { cache } = createCache({
      [LAST_KNOWN_CACHE_URL]: [contribution(7)],
    });
    const tasks: Promise<void>[] = [];
    const errorLog = spyOn(console, "error").mockImplementation(() => {});

    const result = await fetchGithubContributions((task) => tasks.push(task), {
      cache,
      fetcher: () => Promise.reject(new Error("request timed out")),
    });
    await tasks[0];

    expect(result).toEqual([contribution(7)]);
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(errorLog.mock.calls[0]?.[0]).toContain(
      "GitHub contribution refresh failed",
    );
    errorLog.mockRestore();
  });

  test("deduplicates concurrent refreshes within an isolate", async () => {
    const { cache } = createCache();
    const tasks: Promise<void>[] = [];
    let resolveUpstream: (response: Response) => void = () => undefined;
    const upstream = new Promise<Response>((resolve) => {
      resolveUpstream = resolve;
    });
    const fetcher = mock(() => upstream);

    const [first, second] = await Promise.all([
      fetchGithubContributions((task) => tasks.push(task), { cache, fetcher }),
      fetchGithubContributions((task) => tasks.push(task), { cache, fetcher }),
    ]);

    expect(first).toEqual([]);
    expect(second).toEqual([]);
    expect(tasks).toHaveLength(1);
    expect(fetcher).toHaveBeenCalledTimes(1);

    resolveUpstream(
      new Response(
        '<td class="ContributionCalendar-day" data-date="2026-08-17" data-level="2" data-count="3"></td>',
      ),
    );
    await tasks[0];
  });

  test("treats cache read failures as misses", async () => {
    const cache: ContributionCache = {
      match: () => Promise.reject(new Error("cache unavailable")),
      put: () => Promise.resolve(),
    };
    const tasks: Promise<void>[] = [];
    const errorLog = spyOn(console, "error").mockImplementation(() => {});

    const result = await fetchGithubContributions((task) => tasks.push(task), {
      cache,
      fetcher: () => Promise.reject(new Error("upstream unavailable")),
    });
    await tasks[0];

    expect(result).toEqual([]);
    expect(tasks).toHaveLength(1);
    errorLog.mockRestore();
  });
});

describe("parseGithubContributions", () => {
  test("reads tooltip counts, direct counts and clamps levels", () => {
    const html = `
      <table>
        <td id="day-one" class="ContributionCalendar-day" data-date="2026-08-14" data-level="2"></td>
        <td id="day-two" class="ContributionCalendar-day" data-date="2026-08-15" data-level="9" data-count="1,234"></td>
      </table>
      <tool-tip for="day-one">12 contributions on August 14</tool-tip>
    `;

    expect(parseGithubContributions(html)).toEqual([
      { date: "2026-08-14", level: 2, count: 12 },
      { date: "2026-08-15", level: 4, count: 1_234 },
    ]);
  });

  test("ignores malformed cells and handles no-contribution tooltips", () => {
    const html = `
      <td id="empty" class="ContributionCalendar-day" data-date="2026-08-16" data-level="0"></td>
      <td class="ContributionCalendar-day" data-date="not-a-date" data-level="1"></td>
      <tool-tip for="empty">No contributions on August 16</tool-tip>
    `;

    expect(parseGithubContributions(html)).toEqual([
      { date: "2026-08-16", level: 0, count: 0 },
    ]);
  });
});

describe("buildActivity", () => {
  test("uses singular and plural labels", () => {
    const activity = buildActivity(
      [
        { date: "2026-08-14", level: 1, count: 1 },
        { date: "2026-08-15", level: 2, count: 2 },
      ],
      "en",
      { contribution: "contribution", contributions: "contributions" },
    );

    expect(activity[0].label).toContain("1 contribution");
    expect(activity[1].label).toContain("2 contributions");
  });
});
