const chromeProfileDirectory = process.env.LIGHTHOUSE_PROFILE_DIRECTORY;

if (!chromeProfileDirectory) {
  throw new Error("Run Lighthouse CI through `bun run lighthouse:ci`.");
}

module.exports = {
  ci: {
    collect: {
      url: [
        "http://127.0.0.1:4327/",
        "http://127.0.0.1:4327/de",
        "http://127.0.0.1:4327/en",
        "http://127.0.0.1:4327/en/privacy",
        "http://127.0.0.1:4327/de/datenschutz",
        "http://127.0.0.1:4327/en/projects",
        "http://127.0.0.1:4327/de/projekte",
      ],
      numberOfRuns: 3,
      startServerCommand:
        "bunx wrangler dev --config dist/server/wrangler.json --ip 127.0.0.1 --port 4327 --show-interactive-dev-session false",
      startServerReadyPattern: "Ready on http://127.0.0.1:4327",
      startServerReadyTimeout: 30_000,
      settings: {
        preset: "desktop",
        chromeFlags: `--headless=new --no-sandbox --user-data-dir="${chromeProfileDirectory}"`,
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 1 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "first-contentful-paint": [
          "error",
          { maxNumericValue: 1_800, aggregationMethod: "median-run" },
        ],
        "largest-contentful-paint": [
          "error",
          { maxNumericValue: 2_500, aggregationMethod: "median-run" },
        ],
        "cumulative-layout-shift": [
          "error",
          { maxNumericValue: 0.1, aggregationMethod: "median-run" },
        ],
        "total-blocking-time": [
          "error",
          { maxNumericValue: 200, aggregationMethod: "median-run" },
        ],
        "speed-index": [
          "error",
          { maxNumericValue: 3_400, aggregationMethod: "median-run" },
        ],
      },
    },
  },
};
