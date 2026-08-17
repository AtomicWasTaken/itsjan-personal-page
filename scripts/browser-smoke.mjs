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

  const markdownResponse = await fetch(baseUrl, {
    headers: {
      Accept: "text/markdown",
      "Accept-Language": "de",
    },
  });
  assert.equal(markdownResponse.status, 200);
  assert.match(markdownResponse.headers.get("content-type") ?? "", /markdown/);
  assert.match(markdownResponse.headers.get("vary") ?? "", /Accept-Language/);
  assert.match(await markdownResponse.text(), /Softwareentwickler/);

  browser = await chromium.launch({
    executablePath: browserExecutable,
    headless: true,
  });
  const context = await browser.newContext({
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
    (await page.locator("h1").first().textContent())?.trim(),
    "Jan-Marlon Leibl",
  );
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

  assert.deepEqual(consoleProblems, []);

  process.stdout.write(
    `Browser smoke passed: consent, analytics lifecycle, theme, avatar, share, activity graph; ${interceptedAnalyticsRequests} analytics request(s) intercepted.\n`,
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
