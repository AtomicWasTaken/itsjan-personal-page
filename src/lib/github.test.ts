import { describe, expect, test } from "bun:test";
import { buildActivity, parseGithubContributions } from "./github";

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
