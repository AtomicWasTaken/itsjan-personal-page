import type { Locale } from "../lib/locale";
import { PROJECTS, type ProjectId } from "./portfolio";
import type { TechnologyId } from "./technologies";

export const PROJECT_ROUTES = {
  en: {
    index: "/en/projects",
    finny: "/en/projects/finny",
    ventry: "/en/projects/ventry",
  },
  de: {
    index: "/de/projekte",
    finny: "/de/projekte/finny",
    ventry: "/de/projekte/ventry",
  },
} as const satisfies Record<Locale, Record<"index" | ProjectId, string>>;

export type ProjectVisual =
  | {
      kind: "image";
      src: string;
      alt: string;
      width: number;
      height: number;
    }
  | {
      kind: "diagram";
      title: string;
      description: string;
      steps: readonly string[];
    };

export interface ProjectCaseStudy {
  id: ProjectId;
  locale: Locale;
  route: string;
  alternateRoute: string;
  externalUrl: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  summary: string;
  period: string;
  status: string;
  problem: readonly string[];
  role: readonly string[];
  architecture: readonly string[];
  technologies: readonly TechnologyId[];
  decisions: readonly { title: string; detail: string }[];
  challenges: readonly { title: string; detail: string }[];
  outcomes: readonly string[];
  visuals: readonly ProjectVisual[];
}

interface ProjectIndexEntry {
  id: ProjectId;
  title: string;
  summary: string;
  period: string;
  status: string;
  technologies: readonly TechnologyId[];
  externalUrl: string;
  externalLabel: string;
}

export interface ProjectIndexContent {
  title: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  introduction: string;
  backLabel: string;
  technologyLabel: string;
  projects: readonly ProjectIndexEntry[];
}

export const PROJECT_INDEX_CONTENT = {
  en: {
    title: "Software projects by Jan-Marlon Leibl",
    metaTitle: "Software projects · Jan-Marlon Leibl",
    metaDescription:
      "Explore Jan-Marlon Leibl's Finny warranty app and Ventry file-sharing project, including their purpose, development period and technologies.",
    eyebrow: "Selected work",
    introduction:
      "Two products I built around practical problems: keeping purchase records useful after checkout and sharing files without leaving them online indefinitely.",
    backLabel: "Back home",
    technologyLabel: "Technologies",
    projects: [
      {
        id: "finny",
        title: "Finny — receipts and warranty reminders",
        summary:
          "An active project that keeps receipts and purchase details together and sends a reminder before a warranty expires.",
        period: "Since 2026",
        status: "Active project",
        technologies: ["typescript", "react", "nextjs"],
        externalUrl: PROJECTS.finny.href,
        externalLabel: "Visit Finny",
      },
      {
        id: "ventry",
        title: "Ventry — expiring file sharing",
        summary:
          "A file-sharing project built around links that expire and files that are removed automatically when their time is up.",
        period: "2023–2024",
        status: "Completed project",
        technologies: ["typescript", "nextjs"],
        externalUrl: PROJECTS.ventry.href,
        externalLabel: "Visit Ventry",
      },
    ],
  },
  de: {
    title: "Softwareprojekte von Jan-Marlon Leibl",
    metaTitle: "Softwareprojekte · Jan-Marlon Leibl",
    metaDescription:
      "Entdecke Jan-Marlon Leibls Garantie-App Finny und das Filesharing-Projekt Ventry mit Zweck, Entwicklungszeitraum und Technologien.",
    eyebrow: "Ausgewählte Projekte",
    introduction:
      "Zwei Produkte für konkrete Probleme: Kaufunterlagen nach dem Bezahlen nützlich halten und Dateien teilen, ohne sie dauerhaft online zu lassen.",
    backLabel: "Zurück zur Startseite",
    technologyLabel: "Technologien",
    projects: [
      {
        id: "finny",
        title: "Finny — Belege und Garantie-Erinnerungen",
        summary:
          "Ein aktives Projekt, das Belege und Kaufdetails zusammenhält und vor dem Ablauf einer Garantie erinnert.",
        period: "Seit 2026",
        status: "Aktives Projekt",
        technologies: ["typescript", "react", "nextjs"],
        externalUrl: PROJECTS.finny.href,
        externalLabel: "Finny besuchen",
      },
      {
        id: "ventry",
        title: "Ventry — zeitlich begrenztes Filesharing",
        summary:
          "Ein Filesharing-Projekt mit Links, die ablaufen, und Dateien, die danach automatisch entfernt werden.",
        period: "2023–2024",
        status: "Abgeschlossenes Projekt",
        technologies: ["typescript", "nextjs"],
        externalUrl: PROJECTS.ventry.href,
        externalLabel: "Ventry besuchen",
      },
    ],
  },
} as const satisfies Record<Locale, ProjectIndexContent>;
