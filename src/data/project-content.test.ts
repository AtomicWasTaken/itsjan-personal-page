import { describe, expect, test } from "bun:test";
import {
  FINNY_CASE_STUDIES,
  PROJECT_INDEX_CONTENT,
  PROJECT_ROUTES,
  VENTRY_CASE_STUDIES,
} from "./project-content";

describe("localized project content architecture", () => {
  test("uses stable, distinct route conventions", () => {
    expect(PROJECT_ROUTES.en).toEqual({
      index: "/en/projects",
      finny: "/en/projects/finny",
      ventry: "/en/projects/ventry",
    });
    expect(PROJECT_ROUTES.de).toEqual({
      index: "/de/projekte",
      finny: "/de/projekte/finny",
      ventry: "/de/projekte/ventry",
    });
    expect(
      new Set(Object.values(PROJECT_ROUTES).flatMap(Object.values)).size,
    ).toBe(6);
  });

  test("keeps complete translated index entries aligned by stable ID", () => {
    const english = PROJECT_INDEX_CONTENT.en;
    const german = PROJECT_INDEX_CONTENT.de;

    expect(english.metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(english.metaDescription.length).toBeLessThanOrEqual(160);
    expect(german.metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(german.metaDescription.length).toBeLessThanOrEqual(160);
    expect(english.introduction).not.toBe(german.introduction);
    expect(english.projects.map(({ id }) => id)).toEqual(["finny", "ventry"]);
    expect(german.projects.map(({ id }) => id)).toEqual(["finny", "ventry"]);

    for (const project of [...english.projects, ...german.projects]) {
      expect(project.title).toBeTruthy();
      expect(project.summary).toBeTruthy();
      expect(project.technologies.length).toBeGreaterThan(0);
      expect(project.externalUrl).toMatch(/^https:\/\//);
    }
  });

  test("keeps both Finny case studies complete and genuinely localized", () => {
    const english = FINNY_CASE_STUDIES.en;
    const german = FINNY_CASE_STUDIES.de;

    expect(english.route).toBe(PROJECT_ROUTES.en.finny);
    expect(german.route).toBe(PROJECT_ROUTES.de.finny);
    expect(english.alternateRoute).toBe(german.route);
    expect(german.alternateRoute).toBe(english.route);
    expect(english.metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(english.metaDescription.length).toBeLessThanOrEqual(160);
    expect(german.metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(german.metaDescription.length).toBeLessThanOrEqual(160);
    expect(english.summary).not.toBe(german.summary);

    for (const caseStudy of [english, german]) {
      expect(caseStudy.problem.length).toBeGreaterThan(0);
      expect(caseStudy.role.length).toBeGreaterThan(0);
      expect(caseStudy.architecture.length).toBeGreaterThan(0);
      expect(caseStudy.technologies).toEqual(["typescript", "react", "nextjs"]);
      expect(caseStudy.decisions.length).toBeGreaterThan(0);
      expect(caseStudy.challenges.length).toBeGreaterThan(0);
      expect(caseStudy.outcomes.length).toBeGreaterThan(0);
      expect(caseStudy.visuals).toEqual([
        expect.objectContaining({ kind: "diagram" }),
      ]);
    }
  });

  test("keeps both Ventry case studies complete, historical and localized", () => {
    const english = VENTRY_CASE_STUDIES.en;
    const german = VENTRY_CASE_STUDIES.de;

    expect(english.route).toBe(PROJECT_ROUTES.en.ventry);
    expect(german.route).toBe(PROJECT_ROUTES.de.ventry);
    expect(english.alternateRoute).toBe(german.route);
    expect(german.alternateRoute).toBe(english.route);
    expect(english.metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(english.metaDescription.length).toBeLessThanOrEqual(160);
    expect(german.metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(german.metaDescription.length).toBeLessThanOrEqual(160);
    expect(english.summary).not.toBe(german.summary);

    for (const caseStudy of [english, german]) {
      expect(caseStudy.period).toBe("2023–2024");
      expect(caseStudy.problem.length).toBeGreaterThan(0);
      expect(caseStudy.role.length).toBeGreaterThan(0);
      expect(caseStudy.architecture.length).toBeGreaterThan(0);
      expect(caseStudy.technologies).toEqual(["typescript", "nextjs"]);
      expect(caseStudy.decisions.length).toBeGreaterThan(0);
      expect(caseStudy.challenges.length).toBeGreaterThan(0);
      expect(caseStudy.outcomes.length).toBeGreaterThan(0);
      expect(caseStudy.visuals).toEqual([
        expect.objectContaining({ kind: "diagram" }),
      ]);
    }
  });
});
