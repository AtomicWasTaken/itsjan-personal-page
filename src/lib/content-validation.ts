import { EXPERIENCE_IDS, ORGANIZATION_IDS, PROJECTS } from "../data/portfolio";
import { ALL_TECHNOLOGIES } from "../data/technologies";

type TranslationContent = Record<
  string,
  {
    portfolio: {
      experience: {
        items: Array<{
          id: string;
          organizationId: string;
          technologies: string[];
        }>;
      };
      finny: { id: string };
      ventry: { id: string };
    };
  }
>;

const duplicates = (values: string[]): string[] =>
  values.filter((value, index) => values.indexOf(value) !== index);

const compareIds = (
  actual: string[],
  expected: readonly string[],
  label: string,
  errors: string[],
): void => {
  const missing = expected.filter((id) => !actual.includes(id));
  const unexpected = actual.filter((id) => !expected.includes(id));
  if (missing.length) errors.push(`${label} is missing: ${missing.join(", ")}`);
  if (unexpected.length)
    errors.push(`${label} contains unknown IDs: ${unexpected.join(", ")}`);
  const repeated = [...new Set(duplicates(actual))];
  if (repeated.length)
    errors.push(`${label} contains duplicate IDs: ${repeated.join(", ")}`);
};

export const validatePortfolioContent = (
  translations: TranslationContent,
): void => {
  const errors: string[] = [];
  const technologyIds = ALL_TECHNOLOGIES.map(({ id }) => id);
  const technologyIdSet = new Set<string>(technologyIds);
  const organizationIdSet = new Set<string>(ORGANIZATION_IDS);
  compareIds(
    technologyIds,
    [...new Set(technologyIds)],
    "technology catalog",
    errors,
  );

  Object.entries(translations).forEach(([locale, strings]) => {
    const portfolio = strings.portfolio;
    const experienceIds = portfolio.experience.items.map(({ id }) => id);
    compareIds(
      experienceIds,
      EXPERIENCE_IDS,
      `${locale} experience entries`,
      errors,
    );

    portfolio.experience.items.forEach((entry) => {
      if (!organizationIdSet.has(entry.organizationId)) {
        errors.push(
          `${locale} experience '${entry.id}' references unknown organization '${entry.organizationId}'`,
        );
      }
      entry.technologies.forEach((technologyId) => {
        if (!technologyIdSet.has(technologyId)) {
          errors.push(
            `${locale} experience '${entry.id}' references unknown technology '${technologyId}'`,
          );
        }
      });
    });

    const projectIds = [portfolio.finny.id, portfolio.ventry.id];
    compareIds(
      projectIds,
      Object.keys(PROJECTS),
      `${locale} project entries`,
      errors,
    );
  });

  if (errors.length > 0) {
    throw new Error(`Invalid portfolio content:\n- ${errors.join("\n- ")}`);
  }
};
