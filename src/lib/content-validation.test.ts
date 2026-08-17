import { describe, expect, test } from "bun:test";
import { validatePortfolioContent } from "./content-validation";

const validTranslation = () => ({
  portfolio: {
    experience: {
      items: [
        {
          id: "building-finny",
          organizationId: "finny",
          technologies: ["typescript", "react", "nextjs"],
        },
        {
          id: "team-neusta-apprenticeship",
          organizationId: "team-neusta",
          technologies: ["php", "symfony"],
        },
        {
          id: "built-ventry",
          organizationId: "ventry",
          technologies: ["typescript", "nextjs"],
        },
        {
          id: "homelab",
          organizationId: "homelab",
          technologies: ["proxmox", "linux", "windows"],
        },
      ],
    },
    finny: { id: "finny" },
    ventry: { id: "ventry" },
  },
});

describe("validatePortfolioContent", () => {
  test("accepts complete content keyed by stable IDs", () => {
    expect(() =>
      validatePortfolioContent({
        en: validTranslation(),
        de: validTranslation(),
      }),
    ).not.toThrow();
  });

  test("reports missing entries and invalid references with their locale", () => {
    const invalid = validTranslation();
    invalid.portfolio.experience.items.pop();
    invalid.portfolio.experience.items[0].technologies.push("renamed-label");
    invalid.portfolio.ventry.id = "renamed-project";
    expect(() => validatePortfolioContent({ en: invalid })).toThrow(
      /en experience entries is missing: homelab.*unknown technology 'renamed-label'.*en project entries is missing: ventry.*unknown IDs: renamed-project/s,
    );
  });
});
