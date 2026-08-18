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
  productName: string;
  locale: Locale;
  route: string;
  alternateRoute: string;
  externalUrl: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  publishedAt: string;
  summary: string;
  period: string;
  status: string;
  eyebrow: string;
  backLabel: string;
  externalLabel: string;
  technologyLabel: string;
  labels: {
    problem: string;
    role: string;
    architecture: string;
    decisions: string;
    challenges: string;
    outcomes: string;
  };
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
  caseStudyUrl?: string;
  caseStudyLabel?: string;
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
        caseStudyUrl: PROJECT_ROUTES.en.finny,
        caseStudyLabel: "Read the Finny case study",
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
        caseStudyUrl: PROJECT_ROUTES.de.finny,
        caseStudyLabel: "Finny-Fallstudie lesen",
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

export const FINNY_CASE_STUDIES = {
  en: {
    id: "finny",
    productName: "Finny",
    locale: "en",
    route: PROJECT_ROUTES.en.finny,
    alternateRoute: PROJECT_ROUTES.de.finny,
    externalUrl: PROJECTS.finny.href,
    title: "Finny: turning receipts into timely warranty reminders",
    metaTitle: "Finny receipt and warranty app · Case study",
    metaDescription:
      "How Jan-Marlon Leibl builds Finny, a TypeScript, React and Next.js web app that turns receipts into reviewable records and warranty reminders.",
    publishedAt: "2026-08-18",
    summary:
      "Finny is a web app for keeping proof of purchase, product details and warranty dates together. It turns receipt input into a record people can check before relying on its reminders.",
    period: "Since 2026",
    status: "Active development",
    eyebrow: "Finny case study",
    backLabel: "All projects",
    externalLabel: "Visit Finny",
    technologyLabel: "Technologies used",
    labels: {
      problem: "The problem",
      role: "My role",
      architecture: "How the workflow is structured",
      decisions: "Key decisions",
      challenges: "Implementation challenges",
      outcomes: "Current outcome",
    },
    problem: [
      "A receipt is most useful months after checkout, when a product fails or a warranty deadline approaches. By then, proof of purchase, product details and the relevant date are often no longer in the same place.",
      "Finny brings those pieces into one reviewable record and keeps the saved warranty date connected to the receipt instead of treating the scan as an isolated document.",
    ],
    role: [
      "I am building Finny as an active software project from Bremen. The documented project stack is TypeScript, React and Next.js.",
      "My work covers the web product flow from receipt input and field review to the stored purchase record and the reminder experience.",
    ],
    architecture: [
      "A receipt enters the web app as a photo or PDF; Pro users can also forward receipts by email.",
      "OCR suggests the retailer, product, purchase date, price and warranty period. The user reviews and corrects those suggestions before saving them.",
      "The reviewed record connects proof of purchase to a saved deadline. Finny then sends email reminders before that date.",
    ],
    technologies: ["typescript", "react", "nextjs"],
    decisions: [
      {
        title: "Review before save",
        detail:
          "OCR output remains a draft. The product asks the user to verify the extracted fields before they become the record used for reminders.",
      },
      {
        title: "One purchase record",
        detail:
          "The receipt, retailer, product, price, purchase date and warranty period stay connected instead of being spread across separate tools.",
      },
      {
        title: "Deadline-led reminders",
        detail:
          "Reminders are derived from the reviewed warranty date, so the notification flow starts with data the user has already checked.",
      },
    ],
    challenges: [
      {
        title: "Receipts are inconsistent inputs",
        detail:
          "Photos and PDFs vary, and extracted fields can be incomplete. The workflow therefore exposes suggestions for correction rather than presenting OCR as certain.",
      },
      {
        title: "Dates are not legal conclusions",
        detail:
          "Commercial warranties and statutory rights are different. Finny organizes reviewable dates and reminders without deciding legal questions for the user.",
      },
    ],
    outcomes: [
      "Finny is an active project and has been part of the portfolio since 2026.",
      "The public product supports receipt photos or PDFs, reviewable OCR fields and email reminders before saved deadlines.",
      "Public product information is available in both English and German.",
    ],
    visuals: [
      {
        kind: "diagram",
        title: "From receipt to reminder",
        description:
          "The Finny workflow keeps a human review between automatic receipt extraction and the saved deadline used for reminders.",
        steps: [
          "Add receipt",
          "Review OCR draft",
          "Save purchase record",
          "Receive reminder",
        ],
      },
    ],
  },
  de: {
    id: "finny",
    productName: "Finny",
    locale: "de",
    route: PROJECT_ROUTES.de.finny,
    alternateRoute: PROJECT_ROUTES.en.finny,
    externalUrl: PROJECTS.finny.href,
    title: "Finny: Von Belegen zu rechtzeitigen Garantie-Erinnerungen",
    metaTitle: "Finny für Belege und Garantien · Fallstudie",
    metaDescription:
      "Wie Jan-Marlon Leibl Finny entwickelt: eine Web-App mit TypeScript, React und Next.js für prüfbare Belegdaten und rechtzeitige Garantie-Erinnerungen.",
    publishedAt: "2026-08-18",
    summary:
      "Finny ist eine Web-App, die Kaufbelege, Produktdetails und Garantiedaten zusammenhält. Aus einem Beleg entsteht ein Datensatz, den Nutzer prüfen, bevor sie sich auf die Erinnerungen verlassen.",
    period: "Seit 2026",
    status: "Aktive Entwicklung",
    eyebrow: "Finny-Fallstudie",
    backLabel: "Alle Projekte",
    externalLabel: "Finny besuchen",
    technologyLabel: "Eingesetzte Technologien",
    labels: {
      problem: "Das Problem",
      role: "Meine Rolle",
      architecture: "So ist der Ablauf aufgebaut",
      decisions: "Wichtige Entscheidungen",
      challenges: "Herausforderungen bei der Umsetzung",
      outcomes: "Aktueller Stand",
    },
    problem: [
      "Ein Kassenbon wird oft erst Monate nach dem Kauf wichtig, wenn ein Produkt ausfällt oder eine Garantiefrist näher rückt. Dann liegen Kaufnachweis, Produktdetails und das relevante Datum häufig nicht mehr am selben Ort.",
      "Finny führt diese Informationen in einem prüfbaren Datensatz zusammen und verbindet das gespeicherte Garantiedatum direkt mit dem Beleg.",
    ],
    role: [
      "Ich entwickle Finny als aktives Softwareprojekt aus Bremen. Als Projekt-Stack sind TypeScript, React und Next.js dokumentiert.",
      "Meine Arbeit umfasst den Web-Ablauf von der Belegerfassung und Feldprüfung bis zum gespeicherten Kaufdatensatz und den Erinnerungen.",
    ],
    architecture: [
      "Ein Beleg gelangt als Foto oder PDF in die Web-App; Pro-Nutzer können Belege zusätzlich per E-Mail weiterleiten.",
      "Die OCR schlägt Händler, Produkt, Kaufdatum, Preis und Garantiezeitraum vor. Vor dem Speichern prüft und korrigiert der Nutzer diese Angaben.",
      "Der geprüfte Datensatz verbindet den Kaufnachweis mit einer gespeicherten Frist. Vor diesem Datum verschickt Finny Erinnerungen per E-Mail.",
    ],
    technologies: ["typescript", "react", "nextjs"],
    decisions: [
      {
        title: "Prüfung vor dem Speichern",
        detail:
          "Das OCR-Ergebnis bleibt ein Entwurf. Nutzer bestätigen oder korrigieren die erkannten Felder, bevor daraus die Grundlage für Erinnerungen wird.",
      },
      {
        title: "Ein Datensatz pro Kauf",
        detail:
          "Beleg, Händler, Produkt, Preis, Kaufdatum und Garantiezeitraum bleiben verbunden, statt auf mehrere Werkzeuge verteilt zu sein.",
      },
      {
        title: "Erinnerungen aus geprüften Fristen",
        detail:
          "Die Benachrichtigungen leiten sich aus dem kontrollierten Garantiedatum ab und beginnen damit bei Daten, die der Nutzer bereits geprüft hat.",
      },
    ],
    challenges: [
      {
        title: "Belege sind uneinheitliche Eingaben",
        detail:
          "Fotos und PDFs unterscheiden sich, erkannte Felder können unvollständig sein. Deshalb zeigt der Ablauf korrigierbare Vorschläge, statt OCR-Ergebnisse als sicher darzustellen.",
      },
      {
        title: "Fristen sind keine Rechtsauskunft",
        detail:
          "Herstellergarantien und gesetzliche Rechte sind nicht dasselbe. Finny organisiert prüfbare Daten und Erinnerungen, ohne Rechtsfragen für den Nutzer zu entscheiden.",
      },
    ],
    outcomes: [
      "Finny ist ein aktives Projekt und seit 2026 Teil des Portfolios.",
      "Das öffentliche Produkt unterstützt Belegfotos oder PDFs, prüfbare OCR-Felder und E-Mail-Erinnerungen vor gespeicherten Fristen.",
      "Öffentliche Produktinformationen stehen auf Deutsch und Englisch bereit.",
    ],
    visuals: [
      {
        kind: "diagram",
        title: "Vom Beleg zur Erinnerung",
        description:
          "Im Finny-Ablauf liegt eine menschliche Prüfung zwischen der automatischen Belegerkennung und der gespeicherten Frist für Erinnerungen.",
        steps: [
          "Beleg hinzufügen",
          "OCR-Entwurf prüfen",
          "Kaufdatensatz speichern",
          "Erinnerung erhalten",
        ],
      },
    ],
  },
} as const satisfies Record<Locale, ProjectCaseStudy>;
