import { describe, expect, test } from "bun:test";
import { ageYears } from "./jan";

describe("ageYears", () => {
  test("changes only on the birthday", () => {
    expect(ageYears(new Date("2026-05-29T12:00:00+02:00"))).toBe(18);
    expect(ageYears(new Date("2026-05-30T12:00:00+02:00"))).toBe(19);
  });
});
