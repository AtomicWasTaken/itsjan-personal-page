import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const publicTextResources = [
  { path: "../src/content/resources/auth.md", language: "en" },
  { path: "../src/content/resources/de.md", language: "de" },
  { path: "../src/content/resources/en.md", language: "en" },
  { path: "../src/content/resources/index.md", language: "en" },
  { path: "../src/content/resources/llms-full.txt", language: "en" },
  { path: "../src/content/resources/llms.txt", language: "en" },
  { path: "../src/content/resources/privacy.de.md", language: "de" },
  { path: "../src/content/resources/privacy.en.md", language: "en" },
  {
    path: "../src/content/resources/skills/itsjan-profile/SKILL.md",
    language: "en",
  },
  {
    path: "../src/content/resources/.well-known/agent-skills/index.json",
    language: "en",
  },
];
const skillPath = new URL(
  "../src/content/resources/skills/itsjan-profile/SKILL.md",
  import.meta.url,
);
const discoveryPath = new URL(
  "../src/content/resources/.well-known/agent-skills/index.json",
  import.meta.url,
);
const headersPath = new URL("../public/_headers", import.meta.url);
const privacyPagePath = new URL("../src/pages/privacy.astro", import.meta.url);

const [skill, discoverySource, headers, privacyPage, ...publicTexts] =
  await Promise.all([
    readFile(skillPath),
    readFile(discoveryPath, "utf8"),
    readFile(headersPath, "utf8"),
    readFile(privacyPagePath, "utf8"),
    ...publicTextResources.map(({ path }) =>
      readFile(new URL(path, import.meta.url)),
    ),
  ]);

const discovery = JSON.parse(discoverySource);
const publishedDigest = discovery.skills?.find(
  (skillEntry) => skillEntry.name === "itsjan-profile",
)?.digest;
const actualDigest = `sha256:${createHash("sha256").update(skill).digest("hex")}`;
const errors = [];

if (publishedDigest !== actualDigest) {
  errors.push(
    [
      "Agent Skill digest is out of date.",
      `Expected: ${actualDigest}`,
      `Found:    ${publishedDigest ?? "missing"}`,
    ].join("\n"),
  );
}

const utf8 = new TextDecoder("utf-8", { fatal: true });
const mojibakeMarkers = ["\uFFFD", "Ã", "Â", "â€", "ðŸ", "·"];
const languageMarkers = {
  de: new Set([
    "auf",
    "aus",
    "bei",
    "beitrag",
    "beiträge",
    "bis",
    "das",
    "datei",
    "dateien",
    "datenschutzerklärung",
    "deutsch",
    "deutsche",
    "deutschen",
    "deutsches",
    "die",
    "dieser",
    "dieses",
    "ein",
    "eine",
    "einer",
    "erfahrung",
    "für",
    "habe",
    "ich",
    "im",
    "ist",
    "kontaktmöglichkeiten",
    "mit",
    "nach",
    "nicht",
    "oder",
    "projekte",
    "ressourcen",
    "seit",
    "sie",
    "sind",
    "technologien",
    "unter",
    "und",
    "vollständige",
    "vollständiges",
    "von",
    "vor",
    "wenn",
    "werden",
    "wie",
    "wird",
    "zu",
    "zum",
    "zur",
  ]),
  en: new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "before",
    "because",
    "built",
    "building",
    "by",
    "can",
    "completed",
    "contact",
    "current",
    "details",
    "does",
    "english",
    "experience",
    "file",
    "for",
    "from",
    "full",
    "german",
    "has",
    "he",
    "his",
    "i",
    "in",
    "is",
    "it",
    "links",
    "my",
    "no",
    "of",
    "on",
    "one",
    "only",
    "or",
    "policy",
    "privacy",
    "projects",
    "public",
    "read",
    "resources",
    "source",
    "the",
    "this",
    "through",
    "to",
    "use",
    "with",
    "without",
    "work",
    "works",
    "your",
  ]),
};

function findLanguageIssues(content, expectedLanguage) {
  const oppositeLanguage = expectedLanguage === "en" ? "de" : "en";

  return content.split("\n").flatMap((sourceLine, index) => {
    const line = sourceLine
      .replace(/https?:\/\/\S+|mailto:\S+/gu, " ")
      .replace(/`[^`]*`/gu, " ");
    const tokens =
      line.toLocaleLowerCase("de-DE").match(/\p{L}+(?:['’]\p{L}+)?/gu) ?? [];
    const expectedCount = tokens.filter((token) =>
      languageMarkers[expectedLanguage].has(token),
    ).length;
    const oppositeCount = tokens.filter((token) =>
      languageMarkers[oppositeLanguage].has(token),
    ).length;

    if (oppositeCount < 2 || oppositeCount <= expectedCount) return [];

    return [
      `${index + 1}: ${sourceLine.trim()} (${oppositeLanguage} markers: ${oppositeCount}, ${expectedLanguage} markers: ${expectedCount})`,
    ];
  });
}

publicTexts.forEach((source, index) => {
  const resource = publicTextResources[index];
  const path = resource.path.replace("../", "");
  let content;
  try {
    content = utf8.decode(source);
  } catch {
    errors.push(`${path} is not valid UTF-8.`);
    return;
  }

  const marker = mojibakeMarkers.find((value) => content.includes(value));
  if (marker) {
    errors.push(
      `${path} contains the suspicious character sequence ${JSON.stringify(marker)}.`,
    );
  }

  const languageIssues = findLanguageIssues(content, resource.language);
  if (languageIssues.length > 0) {
    errors.push(
      [
        `${path} contains prose that does not look ${resource.language === "de" ? "German" : "English"}:`,
        ...languageIssues,
      ].join("\n"),
    );
  }
});

const englishProfile = utf8.decode(publicTexts[2]);
const indexProfile = utf8.decode(publicTexts[3]);
if (englishProfile !== indexProfile) {
  errors.push(
    "src/content/resources/index.md must stay in sync with src/content/resources/en.md.",
  );
}

const privacyRepresentations = {
  de: {
    markdown: utf8.decode(publicTexts[6]),
    date: "12. August 2026",
    headings: [
      "Datenschutzerklärung",
      "Verantwortlicher",
      "Hosting",
      "Reichweitenmessung mit PostHog",
      "Fehlerdiagnose",
      "Ihre Rechte",
    ],
  },
  en: {
    markdown: utf8.decode(publicTexts[7]),
    date: "12 August 2026",
    headings: [
      "Privacy policy",
      "Controller",
      "Hosting",
      "Analytics with PostHog",
      "Error diagnostics",
      "Your rights",
    ],
  },
};
const privacyLinks = [
  "mailto:hi@itsjan.dev",
  "https://www.cloudflare.com/privacypolicy/",
  "https://posthog.com/privacy",
  "https://posthog.com/dpa",
];

Object.entries(privacyRepresentations).forEach(
  ([locale, { markdown, date, headings }]) => {
    const requiredValues = [date, ...headings, ...privacyLinks];
    requiredValues.forEach((value) => {
      if (!markdown.includes(value)) {
        errors.push(
          `src/content/resources/privacy.${locale}.md is missing shared privacy value: ${value}`,
        );
      }
      if (!privacyPage.includes(value)) {
        errors.push(
          `src/pages/privacy.astro is missing the ${locale} privacy value: ${value}`,
        );
      }
    });
  },
);

if (!headers.includes("Content-Type: text/markdown; charset=utf-8")) {
  errors.push("public/_headers must declare UTF-8 for Markdown resources.");
}
if (!headers.includes("Content-Type: text/plain; charset=utf-8")) {
  errors.push("public/_headers must declare UTF-8 for text resources.");
}

if (errors.length > 0) {
  console.error(errors.join("\n\n"));
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Content resources use consistent languages and valid UTF-8; privacy representations and Agent Skill digest are current.\n`,
  );
}
