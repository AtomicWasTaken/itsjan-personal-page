import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { chromium } from "playwright-core";

const host = "127.0.0.1";
const port =
  process.env.BROWSER_TEST_PORT ?? String(20_000 + (process.pid % 20_000));
const baseUrl = `http://${host}:${port}`;
let previewStarted = false;
let previewOutput = "";

const runAstro = (args) =>
  new Promise((resolve, reject) => {
    const output = [];
    const child = spawn(process.execPath, ["run", "astro", ...args], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", (chunk) => output.push(chunk.toString()));
    child.stderr.on("data", (chunk) => output.push(chunk.toString()));
    child.once("error", reject);
    child.once("close", (code) => {
      const text = output.join("");
      if (code === 0) resolve(text);
      else reject(new Error(`Astro command failed with ${code}:\n${text}`));
    });
  });

const stopServer = async () => {
  if (!previewStarted) return;
  await runAstro(["preview", "stop", "--port", port]);
  previewStarted = false;
};

const waitForServer = async () => {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // The preview server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Preview server did not start:\n${previewOutput}`);
};

const browserExecutable = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
  chromium.executablePath(),
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].find((candidate) => candidate && existsSync(candidate));

if (!browserExecutable) {
  throw new Error(
    "No Chromium executable found. Set PLAYWRIGHT_CHROMIUM_EXECUTABLE.",
  );
}

let browser;
let page;

try {
  previewOutput = await runAstro([
    "preview",
    "--background",
    "--host",
    host,
    "--port",
    port,
  ]);
  previewStarted = true;
  await waitForServer();

  const htmlResponse = await fetch(baseUrl);
  assert.equal(htmlResponse.headers.get("cache-control"), "no-store");
  assert.match(
    htmlResponse.headers.get("content-security-policy") ?? "",
    /frame-ancestors 'none'/,
  );
  assert.equal(
    htmlResponse.headers.get("strict-transport-security"),
    "max-age=31536000",
  );

  const trailingSlashResponse = await fetch(`${baseUrl}/en/?source=smoke`, {
    redirect: "manual",
  });
  assert.ok([301, 308].includes(trailingSlashResponse.status));
  assert.equal(
    new URL(trailingSlashResponse.headers.get("location"), baseUrl).href,
    `${baseUrl}/en?source=smoke`,
  );

  const sitemapResponse = await fetch(`${baseUrl}/sitemap-0.xml`);
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, url]) => url,
  );
  assert.deepEqual(sitemapUrls, [
    "https://itsjan.dev",
    "https://itsjan.dev/de",
    "https://itsjan.dev/de/datenschutz",
    "https://itsjan.dev/en",
    "https://itsjan.dev/en/privacy",
  ]);

  for (const removedProjectPath of [
    "/en/projects",
    "/de/projekte",
    "/en/projects/finny",
    "/de/projekte/finny",
    "/en/projects/ventry",
    "/de/projekte/ventry",
  ]) {
    const response = await fetch(`${baseUrl}${removedProjectPath}`, {
      redirect: "manual",
    });
    assert.equal(response.status, 404);
    assert.equal(
      sitemapUrls.includes(`https://itsjan.dev${removedProjectPath}`),
      false,
    );
  }

  const legacyPrivacyResponse = await fetch(`${baseUrl}/privacy`, {
    redirect: "manual",
  });
  assert.equal(legacyPrivacyResponse.status, 308);
  assert.equal(
    new URL(legacyPrivacyResponse.headers.get("location"), baseUrl).href,
    `${baseUrl}/en/privacy`,
  );

  for (const [path, language, canonical, alternate] of [
    ["/en/privacy", "en", "/en/privacy", "/de/datenschutz"],
    ["/de/datenschutz", "de", "/de/datenschutz", "/en/privacy"],
  ]) {
    const response = await fetch(`${baseUrl}${path}`);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, new RegExp(`<html lang="${language}"`));
    assert.match(
      html,
      new RegExp(`rel="canonical" href="https://itsjan.dev${canonical}"`),
    );
    assert.match(
      html,
      new RegExp(
        `hreflang="${language === "en" ? "de" : "en"}" href="https://itsjan.dev${alternate}"`,
      ),
    );
  }

  const staticImageResponse = await fetch(`${baseUrl}/favicon.png`);
  assert.equal(
    staticImageResponse.headers.get("cache-control"),
    "public, max-age=86400, stale-while-revalidate=604800",
  );

  const markdownResponse = await fetch(baseUrl, {
    headers: {
      Accept: "text/markdown",
      "Accept-Language": "de",
    },
  });
  assert.equal(markdownResponse.status, 200);
  assert.match(markdownResponse.headers.get("content-type") ?? "", /markdown/);
  assert.doesNotMatch(
    markdownResponse.headers.get("vary") ?? "",
    /Accept-Language/,
  );
  assert.match(await markdownResponse.text(), /software developer/);

  const germanPreferenceResponse = await fetch(baseUrl, {
    headers: { "Accept-Language": "de-DE,de;q=0.9" },
  });
  const germanPreferenceHtml = await germanPreferenceResponse.text();
  assert.match(germanPreferenceHtml, /<html lang="en"/);
  assert.match(
    germanPreferenceHtml,
    /Jan-Marlon Leibl · Software developer from Bremen/,
  );

  const profileSchemas = [];
  for (const [path, language, expectedDescription] of [
    [
      "/",
      "en",
      "Jan-Marlon Leibl is a software developer from Bremen building Finny, Ventry and modern web products with PHP, TypeScript, React, Next.js and Cloudflare.",
    ],
    [
      "/en",
      "en",
      "Jan-Marlon Leibl is a software developer from Bremen building Finny, Ventry and modern web products with PHP, TypeScript, React, Next.js and Cloudflare.",
    ],
    [
      "/de",
      "de",
      "Jan-Marlon Leibl ist Softwareentwickler aus Bremen und entwickelt Finny, Ventry und moderne Webprojekte mit PHP, TypeScript, React, Next.js und Cloudflare.",
    ],
  ]) {
    const response = await fetch(`${baseUrl}${path}`);
    const html = await response.text();
    const headingLevels = [
      ...html.matchAll(/<h([1-6])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/g),
    ].map(([, level]) => Number(level));
    const source = html.match(
      /<script type="application\/ld\+json">([^<]+)<\/script>/,
    )?.[1];
    assert.ok(source);
    assert.equal(headingLevels.filter((level) => level === 1).length, 1);
    assert.equal(
      headingLevels.some(
        (level, index) => index > 0 && level > headingLevels[index - 1] + 1,
      ),
      false,
    );
    const schema = JSON.parse(source);
    assert.match(
      html,
      new RegExp(`<meta name="description" content="${expectedDescription}">`),
    );
    assert.match(
      html,
      new RegExp(
        `<meta property="og:description" content="${expectedDescription}">`,
      ),
    );
    assert.match(
      html,
      new RegExp(
        `<meta name="twitter:description" content="${expectedDescription}">`,
      ),
    );
    const pageEntity = schema["@graph"].find(
      (entity) => entity["@type"] === "ProfilePage",
    );
    assert.equal(pageEntity.inLanguage, language);
    assert.equal(pageEntity.mainEntity["@id"], "https://itsjan.dev/#person");
    assert.equal(pageEntity.isPartOf["@id"], "https://itsjan.dev/#website");
    profileSchemas.push(schema);
  }
  assert.deepEqual(
    profileSchemas.map((schema) => schema["@graph"][0]),
    Array(3).fill(profileSchemas[0]["@graph"][0]),
  );
  assert.deepEqual(
    profileSchemas.map((schema) => schema["@graph"][1]),
    Array(3).fill(profileSchemas[0]["@graph"][1]),
  );

  browser = await chromium.launch({
    executablePath: browserExecutable,
    headless: true,
  });
  const context = await browser.newContext({
    locale: "en-US",
    viewport: { width: 1440, height: 1000 },
  });
  let interceptedAnalyticsRequests = 0;
  const localOrigin = new URL(baseUrl).origin;
  await context.route("**/*", async (route) => {
    if (new URL(route.request().url()).origin === localOrigin) {
      await route.continue();
      return;
    }
    interceptedAnalyticsRequests += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}",
    });
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value) => {
          globalThis.__browserTestClipboard = value;
        },
      },
    });
  });

  page = await context.newPage();
  const consoleProblems = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      consoleProblems.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    consoleProblems.push(`pageerror: ${error.message}`);
  });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  assert.equal(await page.locator("#language-suggestion").isHidden(), true);
  const analyticsHost = await page
    .locator('meta[name="posthog-api-host"]')
    .getAttribute("content");
  assert.ok(analyticsHost);
  assert.notEqual(new URL(analyticsHost).origin, localOrigin);
  assert.equal(
    await page.title(),
    "Jan-Marlon Leibl · Software developer from Bremen",
  );
  assert.equal(
    (await page.locator("h1").first().textContent())
      ?.replace(/\s+/g, " ")
      .trim(),
    "Jan-Marlon Leibl, software developer from Bremen",
  );
  assert.equal(await page.locator("h1").count(), 1);
  assert.deepEqual(await page.locator("#projects h3").allTextContents(), [
    "Finny receipt and warranty app",
    "Ventry expiring file sharing",
  ]);
  assert.deepEqual(
    await page
      .locator("#projects a")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
    ["https://fnny.app", "https://ventry.host"],
  );
  const semanticPage = await context.newPage();
  for (const [path, expectedH1, expectedProjects] of [
    [
      "/en",
      "Jan-Marlon Leibl, software developer from Bremen",
      ["Finny receipt and warranty app", "Ventry expiring file sharing"],
    ],
    [
      "/de",
      "Jan-Marlon Leibl, Softwareentwickler aus Bremen",
      [
        "Finny für Belege und Garantien",
        "Ventry für zeitlich begrenzte Dateifreigaben",
      ],
    ],
  ]) {
    await semanticPage.goto(`${baseUrl}${path}`);
    assert.equal(await semanticPage.locator("h1").count(), 1);
    assert.equal(
      (await semanticPage.locator("h1").textContent())
        ?.replace(/\s+/g, " ")
        .trim(),
      expectedH1,
    );
    assert.deepEqual(
      await semanticPage.locator("#projects h3").allTextContents(),
      expectedProjects,
    );
  }
  await semanticPage.close();

  const germanLocaleContext = await browser.newContext({
    locale: "de-DE",
    viewport: { width: 1440, height: 1000 },
  });
  const germanLocalePage = await germanLocaleContext.newPage();
  await germanLocalePage.goto(`${baseUrl}/en`);
  const languageSuggestion = germanLocalePage.locator("#language-suggestion");
  await assert.doesNotReject(() =>
    languageSuggestion.waitFor({ state: "visible" }),
  );
  assert.equal(
    await germanLocalePage
      .locator("#language-suggestion-accept")
      .getAttribute("href"),
    "/de",
  );
  await germanLocalePage.locator("#language-suggestion-dismiss").click();
  await assert.doesNotReject(() =>
    languageSuggestion.waitFor({ state: "hidden" }),
  );
  assert.equal(
    await germanLocalePage.evaluate(() =>
      globalThis.localStorage.getItem("itsjan-language-suggestion"),
    ),
    "dismissed",
  );
  await germanLocalePage.reload();
  assert.equal(await languageSuggestion.isHidden(), true);

  await germanLocalePage.evaluate(() =>
    globalThis.localStorage.removeItem("itsjan-language-suggestion"),
  );
  await germanLocalePage.goto(`${baseUrl}/en/privacy`);
  await assert.doesNotReject(() =>
    languageSuggestion.waitFor({ state: "visible" }),
  );
  assert.equal(
    await germanLocalePage
      .locator("#language-suggestion-accept")
      .getAttribute("href"),
    "/de/datenschutz",
  );
  await Promise.all([
    germanLocalePage.waitForURL(`${baseUrl}/de/datenschutz`),
    germanLocalePage.locator("#language-suggestion-accept").click(),
  ]);
  assert.equal(
    await germanLocalePage.evaluate(() =>
      globalThis.localStorage.getItem("itsjan-language-suggestion"),
    ),
    "accepted",
  );
  assert.equal(
    await germanLocalePage.locator("#language-suggestion").count(),
    0,
  );
  await germanLocaleContext.close();

  assert.equal(await page.locator(".activity-reveal").count(), 1);
  assert.equal(await page.locator(".activity-reveal [tabindex]").count(), 0);
  assert.ok(
    await page.locator('.activity-day[data-level="0"]').first().isVisible(),
  );

  const consent = page.locator("#privacy-consent");
  await assert.doesNotReject(() => consent.waitFor({ state: "visible" }));
  assert.equal(
    await page.evaluate(() =>
      globalThis.localStorage.getItem("itsjan-analytics-consent"),
    ),
    null,
  );
  assert.equal(await page.evaluate(() => Boolean(globalThis.posthog)), false);
  assert.equal(interceptedAnalyticsRequests, 0);

  await page.locator("#privacy-accept").click();
  await page.waitForFunction(() => Boolean(globalThis.posthog));
  assert.equal(await page.evaluate(() => globalThis.posthog?.__loaded), true);
  assert.equal(
    await page.evaluate(() => globalThis.posthog?.has_opted_out_capturing?.()),
    false,
  );
  assert.equal(
    await page.evaluate(() =>
      globalThis.localStorage.getItem("itsjan-analytics-consent"),
    ),
    "granted",
  );

  await page.locator("#privacy-settings").click();
  await page.locator("#privacy-reject").click();
  await page.waitForTimeout(250);
  assert.equal(await consent.isHidden(), true);
  assert.equal(
    await page.evaluate(() =>
      globalThis.localStorage.getItem("itsjan-analytics-consent"),
    ),
    "denied",
  );
  assert.equal(
    await page.evaluate(() => globalThis.posthog?.has_opted_out_capturing?.()),
    true,
  );

  const themeBefore = await page.locator("html").getAttribute("data-theme");
  await page.locator("#theme-toggle").click();
  await page.waitForFunction(
    (previous) => document.documentElement.dataset.theme !== previous,
    themeBefore,
  );
  const themeAfter = await page.locator("html").getAttribute("data-theme");
  assert.notEqual(themeAfter, themeBefore);
  assert.equal(
    await page.evaluate(() => globalThis.localStorage.getItem("itsjan-theme")),
    themeAfter,
  );

  const avatar = page.locator("#profile-avatar");
  const avatarModal = page.locator("#avatar-modal");
  await avatar.click();
  assert.equal(await avatarModal.getAttribute("aria-hidden"), "false");
  assert.equal(
    await page.evaluate(() =>
      document.activeElement?.matches("[data-avatar-close]"),
    ),
    true,
  );
  await page.keyboard.press("Escape");
  assert.equal(await avatarModal.getAttribute("aria-hidden"), "true");
  assert.equal(
    await avatar.evaluate((element) => element === document.activeElement),
    true,
  );

  const share = page.locator("#share-profile");
  await share.click();
  await page.waitForFunction(() =>
    document.querySelector("#share-profile")?.hasAttribute("data-copied"),
  );
  assert.equal(
    await page.evaluate(() => globalThis.__browserTestClipboard),
    "https://itsjan.dev/",
  );
  assert.equal(await share.getAttribute("data-copied"), "true");

  const technologyAccordion = page.locator("#mobile-tech-accordion");
  const technologyToggle = page.locator("#mobile-tech-toggle");
  await technologyToggle.evaluate((element) => {
    if (element instanceof HTMLButtonElement) element.click();
  });
  assert.equal(await technologyAccordion.getAttribute("data-open"), "true");
  assert.equal(await technologyToggle.getAttribute("aria-expanded"), "true");

  const copyEmail = page.locator("#copy-email");
  await copyEmail.click();
  await page.waitForFunction(() =>
    document.querySelector("#copy-email")?.hasAttribute("data-copied"),
  );
  assert.equal(
    await page.evaluate(() => globalThis.__browserTestClipboard),
    "hi@itsjan.dev",
  );

  const socialPreviewRoot = page.locator("[data-social-preview-root]");
  const socialPreview = page.locator("[data-social-preview]");
  await page.locator('[data-social-preview-key="github"]').focus();
  assert.equal(
    await socialPreviewRoot.getAttribute("data-preview-open"),
    "true",
  );
  assert.equal(await socialPreview.getAttribute("aria-hidden"), "false");
  await page.locator('[data-analytics-platform="email"]').focus();
  assert.equal(await socialPreview.getAttribute("aria-hidden"), "true");

  assert.deepEqual(consoleProblems, []);

  process.stdout.write(
    `Browser smoke passed: consent, analytics lifecycle, theme, avatar, share, email copy, technology accordion, social preview, activity graph; ${interceptedAnalyticsRequests} analytics request(s) intercepted.\n`,
  );
} catch (error) {
  if (page) {
    await page.screenshot({
      path: "/tmp/itsjan-browser-smoke-failure.png",
      fullPage: true,
    });
  }
  throw error;
} finally {
  await browser?.close();
  await stopServer();
}
