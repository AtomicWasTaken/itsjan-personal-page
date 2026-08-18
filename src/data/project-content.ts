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
        caseStudyUrl: PROJECT_ROUTES.en.ventry,
        caseStudyLabel: "Read the Ventry case study",
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
        caseStudyUrl: PROJECT_ROUTES.de.ventry,
        caseStudyLabel: "Ventry-Fallstudie lesen",
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

export const VENTRY_CASE_STUDIES = {
  en: {
    id: "ventry",
    productName: "Ventry",
    locale: "en",
    route: PROJECT_ROUTES.en.ventry,
    alternateRoute: PROJECT_ROUTES.de.ventry,
    externalUrl: PROJECTS.ventry.href,
    title: "Ventry: file sharing with an expiry built in",
    metaTitle: "Ventry expiring file sharing · Case study",
    metaDescription:
      "How Jan-Marlon Leibl built Ventry with TypeScript and Next.js: a 2023–2024 file-sharing project with expiring links and automatic file removal.",
    publishedAt: "2026-08-18",
    summary:
      "Ventry was developed from 2023 to 2024 around a direct promise: share a file through a link, give that link an expiry, and remove the file automatically when its time is up.",
    period: "2023–2024",
    status: "Historical development period",
    eyebrow: "Ventry case study",
    backLabel: "All projects",
    externalLabel: "Visit Ventry",
    technologyLabel: "Technologies used",
    labels: {
      problem: "The problem",
      role: "My role",
      architecture: "How the lifecycle is structured",
      decisions: "Key decisions",
      challenges: "Implementation challenges",
      outcomes: "Project status",
    },
    problem: [
      "Many file-sharing links outlive the moment they were created for. That leaves the sender responsible for remembering where a file is hosted and when it should no longer be available.",
      "Ventry tied access to a defined expiry and paired that expiry with automatic file removal, so temporary sharing did not depend on a later manual cleanup step.",
    ],
    role: [
      "I built Ventry from 2023 to 2024 as a TypeScript and Next.js project. The portfolio records that period as completed work rather than implying current development.",
      "My work centered on the browser flow for uploading a file, creating a shareable link and making the expiry visible as part of the sharing lifecycle.",
    ],
    architecture: [
      "The sender uploads a file and chooses the time window in which it should remain available.",
      "Ventry creates a link that represents access to that file for the configured period.",
      "Once the expiry is reached, link access ends and the associated file is removed automatically.",
    ],
    technologies: ["typescript", "nextjs"],
    decisions: [
      {
        title: "Expiry belongs to the share",
        detail:
          "The lifetime is part of creating the link, not a separate cleanup preference that has to be remembered later.",
      },
      {
        title: "Link and file share one lifecycle",
        detail:
          "An expired link and its stored file are treated as one state transition so access and retention do not drift apart.",
      },
      {
        title: "Keep the browser flow direct",
        detail:
          "The core interaction stays focused on the file, its expiry and the resulting link rather than adding unrelated project-management features.",
      },
    ],
    challenges: [
      {
        title: "Access and storage must agree",
        detail:
          "Ending access is only half of the promise. The stored file also has to follow the same expiry so a dead link does not leave forgotten data behind.",
      },
      {
        title: "Cleanup happens without a page visit",
        detail:
          "Expiry is time-driven rather than triggered by the sender returning to the site, so removal cannot rely on a later manual interaction.",
      },
    ],
    outcomes: [
      "The portfolio records Ventry's development period as 2023 to 2024.",
      "The implemented concept connected expiring links with automatic removal of the associated file.",
      "The public ventry.host site remains online and currently describes self-deleting uploads; that does not imply that Jan is still developing the project.",
    ],
    visuals: [
      {
        kind: "diagram",
        title: "A time-bounded file lifecycle",
        description:
          "The Ventry flow couples the link's availability with the lifetime of the stored file.",
        steps: [
          "Upload file",
          "Set expiry",
          "Share link",
          "Remove automatically",
        ],
      },
    ],
  },
  de: {
    id: "ventry",
    productName: "Ventry",
    locale: "de",
    route: PROJECT_ROUTES.de.ventry,
    alternateRoute: PROJECT_ROUTES.en.ventry,
    externalUrl: PROJECTS.ventry.href,
    title: "Ventry: Filesharing mit eingebautem Ablaufdatum",
    metaTitle: "Ventry für ablaufendes Filesharing · Fallstudie",
    metaDescription:
      "Wie Jan-Marlon Leibl Ventry mit TypeScript und Next.js entwickelte: ein Filesharing-Projekt von 2023–2024 mit ablaufenden Links und automatischer Dateilöschung.",
    publishedAt: "2026-08-18",
    summary:
      "Ventry entstand von 2023 bis 2024 mit einem klaren Versprechen: Eine Datei über einen Link teilen, diesem Link ein Ablaufdatum geben und die Datei danach automatisch entfernen.",
    period: "2023–2024",
    status: "Historischer Entwicklungszeitraum",
    eyebrow: "Ventry-Fallstudie",
    backLabel: "Alle Projekte",
    externalLabel: "Ventry besuchen",
    technologyLabel: "Eingesetzte Technologien",
    labels: {
      problem: "Das Problem",
      role: "Meine Rolle",
      architecture: "So ist der Lebenszyklus aufgebaut",
      decisions: "Wichtige Entscheidungen",
      challenges: "Herausforderungen bei der Umsetzung",
      outcomes: "Projektstatus",
    },
    problem: [
      "Viele Filesharing-Links bleiben länger bestehen als der Anlass, für den sie erstellt wurden. Der Absender muss sich dann merken, wo eine Datei liegt und wann sie nicht mehr verfügbar sein sollte.",
      "Ventry verband den Zugriff mit einem festen Ablaufdatum und koppelte diesen Zeitpunkt an die automatische Dateilöschung. Temporäres Teilen brauchte dadurch keinen späteren manuellen Aufräumschritt.",
    ],
    role: [
      "Ich entwickelte Ventry von 2023 bis 2024 als Projekt mit TypeScript und Next.js. Das Portfolio führt diesen Zeitraum als abgeschlossene Arbeit und behauptet keine laufende Entwicklung.",
      "Meine Arbeit konzentrierte sich auf den Browser-Ablauf vom Datei-Upload über den teilbaren Link bis zum sichtbaren Ablaufdatum im Freigabeprozess.",
    ],
    architecture: [
      "Der Absender lädt eine Datei hoch und legt fest, wie lange sie verfügbar bleiben soll.",
      "Ventry erstellt einen Link, der den Zugriff auf diese Datei für den gewählten Zeitraum ermöglicht.",
      "Nach Ablauf endet der Zugriff über den Link und die zugehörige Datei wird automatisch entfernt.",
    ],
    technologies: ["typescript", "nextjs"],
    decisions: [
      {
        title: "Das Ablaufdatum gehört zur Freigabe",
        detail:
          "Die Laufzeit wird beim Erstellen des Links festgelegt und ist keine getrennte Aufräumoption, an die man sich später erinnern muss.",
      },
      {
        title: "Link und Datei teilen einen Lebenszyklus",
        detail:
          "Ein abgelaufener Link und seine gespeicherte Datei bilden einen gemeinsamen Zustandswechsel, damit Zugriff und Aufbewahrung nicht auseinanderlaufen.",
      },
      {
        title: "Ein direkter Browser-Ablauf",
        detail:
          "Die zentrale Interaktion bleibt auf Datei, Ablaufdatum und Ergebnis-Link konzentriert, ohne zusätzliche Projektverwaltungsfunktionen einzubauen.",
      },
    ],
    challenges: [
      {
        title: "Zugriff und Speicherung müssen übereinstimmen",
        detail:
          "Nur den Zugriff zu beenden reicht nicht. Auch die gespeicherte Datei muss derselben Frist folgen, damit ein toter Link keine vergessenen Daten hinterlässt.",
      },
      {
        title: "Aufräumen ohne erneuten Seitenaufruf",
        detail:
          "Der Ablauf ist zeitgesteuert und beginnt nicht erst, wenn der Absender die Seite wieder besucht. Die Löschung darf deshalb keine spätere manuelle Interaktion voraussetzen.",
      },
    ],
    outcomes: [
      "Das Portfolio dokumentiert den Entwicklungszeitraum von Ventry mit 2023 bis 2024.",
      "Das umgesetzte Konzept verband ablaufende Links mit der automatischen Entfernung der zugehörigen Datei.",
      "Die öffentliche Seite ventry.host ist weiterhin erreichbar und beschreibt aktuell selbstlöschende Uploads. Daraus folgt keine fortlaufende Entwicklung durch Jan.",
    ],
    visuals: [
      {
        kind: "diagram",
        title: "Ein zeitlich begrenzter Datei-Lebenszyklus",
        description:
          "Der Ventry-Ablauf koppelt die Verfügbarkeit des Links an die Lebensdauer der gespeicherten Datei.",
        steps: [
          "Datei hochladen",
          "Ablauf festlegen",
          "Link teilen",
          "Automatisch entfernen",
        ],
      },
    ],
  },
} as const satisfies Record<Locale, ProjectCaseStudy>;
