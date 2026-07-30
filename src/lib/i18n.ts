// Bilingual content + locale detection from Accept-Language header.

import type { Technology } from "./portfolio";

export type Locale = "en" | "de";

export function detectLocale(request: Request): Locale {
  const requestUrl = new URL(request.url);
  const pathLocale = requestUrl.pathname.split("/")[1];
  if (pathLocale === "de" || pathLocale === "en") return pathLocale;

  const queryLocale = requestUrl.searchParams.get("lang");
  if (queryLocale === "de" || queryLocale === "en") return queryLocale;

  const header = request.headers.get("accept-language");
  if (!header) return "en";
  const langs = header
    .split(",")
    .map((part) => {
      const [tag, qs] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: qs ? parseFloat(qs) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of langs) {
    if (tag.startsWith("de")) return "de";
    if (tag.startsWith("en")) return "en";
  }
  return "en";
}

interface Strings {
  htmlLang: string;
  meta: {
    imageAlt: string;
    jobTitle: string;
  };
  portfolio: {
    subtitle: (age: number) => string;
    subtitleStates: (age: number) => string[];
    avatar: {
      expand: string;
      collapse: string;
    };
    intro: {
      beforeBremen: string;
      afterBremen: string;
      apprenticeship: string;
      afterApprenticeship: string;
      finny: string;
      afterFinny: string;
    };
    tech: {
      aria: string;
      mobileHeading: string;
      mobileViewMore: string;
      mobileViewLess: string;
      visitLabel: (name: string) => string;
      items: Technology[];
    };
    experience: {
      heading: string;
      items: {
        period: string;
        title: string;
        organization: string;
        location: string;
        secondary?: {
          period: string;
          title: string;
        };
        bullets: string[];
        technologies: string[];
      }[];
    };
    projects: string;
    theme: {
      label: string;
      toDark: string;
      toLight: string;
    };
    activity: {
      heading: string;
      desktopAria: string;
      mobileAria: string;
      less: string;
      more: string;
      contribution: string;
      contributions: string;
    };
    connect: {
      heading: string;
      xAria: string;
      githubAria: string;
      linkedinAria: string;
      emailAria: string;
      copyEmail: string;
      emailCopied: string;
    };
    finny: {
      linkAria: string;
      previewAria: string;
      receiptTitle: string;
      receiptVendor: string;
      receiptDetail: string;
      warrantyTitle: string;
      warrantyDetail: string;
      warrantyUntil: string;
      description: { lead: string; first: string; middle: string; second: string; join: string; third: string; end: string };
      cta: { prefix: string; label: string };
    };
    ventry: {
      linkAria: string;
      previewAria: string;
      panelTitle: string;
      panelCount: string;
      fileStatus: string;
      shareLabel: string;
      shareStatus: string;
      shareAction: string;
      description: { lead: string; keyword: string; end: string };
      cta: { prefix: string; label: string };
    };
  };
}

const technologyLogos: Technology[] = [
  { name: "PHP", logo: "https://cdn.simpleicons.org/php/777BB4", href: "https://www.php.net/" },
  { name: "TypeScript", logo: "https://cdn.simpleicons.org/typescript/3178C6", href: "https://www.typescriptlang.org/" },
  { name: "React", logo: "https://cdn.simpleicons.org/react/61DAFB", href: "https://react.dev/" },
  { name: "Next.js", logo: "https://cdn.simpleicons.org/nextdotjs/000000", href: "https://nextjs.org/", darkModeLight: true },
  { name: "TYPO3", logo: "https://cdn.simpleicons.org/typo3/FF8700", href: "https://typo3.org/" },
  { name: "Angular", logo: "https://cdn.simpleicons.org/angular/DD0031", href: "https://angular.dev/" },
  { name: "Vue", logo: "https://cdn.simpleicons.org/vuedotjs/4FC08D", href: "https://vuejs.org/" },
  { name: "GitHub", logo: "https://cdn.simpleicons.org/github/181717", href: "https://github.com/", darkModeLight: true },
  { name: "GitLab", logo: "https://cdn.simpleicons.org/gitlab/FC6D26", href: "https://gitlab.com/" },
  { name: "Gitea", logo: "https://cdn.simpleicons.org/gitea/609926", href: "https://about.gitea.com/" },
  { name: "Docker", logo: "https://cdn.simpleicons.org/docker/2496ED", href: "https://www.docker.com/" },
  { name: "Proxmox", logo: "https://cdn.simpleicons.org/proxmox/E57000", href: "https://www.proxmox.com/" },
  { name: "Linux", logo: "https://cdn.simpleicons.org/linux/FCC624", href: "https://www.linux.org/" },
  { name: "macOS", logo: "https://cdn.simpleicons.org/apple/000000", href: "https://www.apple.com/macos/", darkModeLight: true },
  { name: "Astro", logo: "https://cdn.simpleicons.org/astro/FF5D01", href: "https://astro.build/" },
  { name: "Cloudflare", logo: "https://cdn.simpleicons.org/cloudflare/F38020", href: "https://www.cloudflare.com/" },
  { name: "Bun", logo: "https://cdn.simpleicons.org/bun/000000", href: "https://bun.sh/", darkModeLight: true },
  { name: "Claude", logo: "https://cdn.simpleicons.org/claude/D97757", href: "https://claude.ai/" },
  { name: "Codex", logo: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/openai.svg", href: "https://openai.com/codex", darkModeLight: true },
  { name: "Cursor", logo: "https://cdn.simpleicons.org/cursor/000000", href: "https://cursor.com/", darkModeLight: true },
  { name: "Gemini", logo: "https://cdn.simpleicons.org/googlegemini/8E75B2", href: "https://gemini.google.com/" },
  { name: "Perplexity", logo: "https://cdn.simpleicons.org/perplexity/20B8CD", href: "https://www.perplexity.ai/" },
  { name: "VS Code", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg", href: "https://code.visualstudio.com/" },
  { name: "PhpStorm", logo: "https://cdn.simpleicons.org/phpstorm/000000", href: "https://www.jetbrains.com/phpstorm/", darkModeLight: true },
  { name: "Windows", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/windows11/windows11-original.svg", href: "https://www.microsoft.com/windows" },
  { name: "Tailwind CSS", logo: "https://cdn.simpleicons.org/tailwindcss/06B6D4", href: "https://tailwindcss.com/" },
];

const en: Strings = {
  htmlLang: "en",
  meta: {
    imageAlt: "Preview of Jan-Marlon Leibl's personal page",
    jobTitle: "Software Developer",
  },
  portfolio: {
    subtitle: (age) => `${age}-year-old software developer from Bremen`,
    subtitleStates: (age) => [
      `${age}-year-old software developer from Bremen`,
      "Building Finny",
      "PHP · TypeScript · React",
    ],
    avatar: {
      expand: "Expand profile picture",
      collapse: "Close profile picture",
    },
    intro: {
      beforeBremen: "I'm from ",
      afterBremen: ", where I finished a ",
      apprenticeship: "three-year software development apprenticeship",
      afterApprenticeship: ". I tend to build things because I want them for myself. Right now that's ",
      finny: "Finny",
      afterFinny: ": an app that keeps receipts and purchase details together. It reminds me before a warranty runs out. I usually work with PHP, TypeScript, and React.",
    },
    tech: {
      aria: "Technologies Jan works with",
      mobileHeading: "Technologies",
      mobileViewMore: "View more",
      mobileViewLess: "Show less",
      visitLabel: (name) => `Click to visit ${name} ↗`,
      items: technologyLogos,
    },
    experience: {
      heading: "Experience",
      items: [
        {
          period: "2026 to present",
          title: "Building",
          organization: "Finny",
          location: "Bremen",
          bullets: [
            "I’m building Finny to keep receipts and purchase details together, with reminders before warranties expire.",
          ],
          technologies: ["TypeScript", "React", "Next.js"],
        },
        {
          period: "2023 to 2026",
          title: "Software development apprentice at",
          organization: "team neusta",
          location: "Bremen",
          secondary: {
            period: "2023 to 2026",
            title: "Vocational school · Schulzentrum SII Utbremen",
          },
          bullets: [
            "Worked on client projects using PHP, TypeScript, and TYPO3.",
          ],
          technologies: ["PHP", "Symfony", "TypeScript", "TYPO3", "Git"],
        },
        {
          period: "2023 to 2024",
          title: "Built",
          organization: "Ventry",
          location: "Bremen",
          bullets: [
            "Built Ventry for temporary file sharing with links that expire.",
          ],
          technologies: ["TypeScript", "Next.js"],
        },
      ],
    },
    projects: "Projects",
    theme: {
      label: "Toggle color theme",
      toDark: "Switch to dark mode",
      toLight: "Switch to light mode",
    },
    activity: {
      heading: "GitHub activity",
      desktopAria: "GitHub contribution activity for the past year",
      mobileAria: "GitHub contribution activity for the past year",
      less: "less",
      more: "more",
      contribution: "contribution",
      contributions: "contributions",
    },
    connect: {
      heading: "Say hi",
      xAria: "X",
      githubAria: "GitHub",
      linkedinAria: "LinkedIn",
      emailAria: "Email",
      copyEmail: "Copy email",
      emailCopied: "Email copied",
    },
    finny: {
      linkAria: "Open Finny at fnny.app",
      previewAria: "Finny project preview",
      receiptTitle: "RECEIPT",
      receiptVendor: "dm · 24.90",
      receiptDetail: "2-year warranty",
      warrantyTitle: "WARRANTY",
      warrantyDetail: "still covered",
      warrantyUntil: "until 08.2028",
      description: { lead: "Finny keeps ", first: "receipts", middle: " and ", second: "purchase details", join: " together, then reminds me before a ", third: "warranty", end: " runs out." },
      cta: { prefix: "", label: "Open Finny ↗" },
    },
    ventry: {
      linkAria: "Open Ventry at ventry.host",
      previewAria: "Ventry project preview",
      panelTitle: "RECENT FILES",
      panelCount: "2 FILES",
      fileStatus: "ready to share",
      shareLabel: "share link",
      shareStatus: "deletes later",
      shareAction: "ready",
      description: { lead: "I built Ventry for temporary file sharing. It creates a ", keyword: "link", end: " that removes the file once the share expires." },
      cta: { prefix: "", label: "Open Ventry ↗" },
    },
  },
};

const de: Strings = {
  htmlLang: "de",
  meta: {
    imageAlt: "Vorschau der persönlichen Website von Jan-Marlon Leibl",
    jobTitle: "Softwareentwickler",
  },
  portfolio: {
    subtitle: (age) => `${age}-jähriger Softwareentwickler aus Bremen`,
    subtitleStates: (age) => [
      `${age}-jähriger Softwareentwickler aus Bremen`,
      "Entwickelt gerade Finny",
      "PHP · TypeScript · React",
    ],
    avatar: {
      expand: "Profilbild vergrößern",
      collapse: "Profilbild schließen",
    },
    intro: {
      beforeBremen: "Ich komme aus ",
      afterBremen: " und habe hier meine ",
      apprenticeship: "dreijährige Ausbildung",
      afterApprenticeship: " zum Softwareentwickler gemacht. Ich baue meistens Sachen, weil ich sie selbst benutzen will. Gerade ist das ",
      finny: "Finny",
      afterFinny: ": eine App, die Belege und Kaufdetails zusammenhält und mich erinnert, bevor eine Garantie abläuft. Meistens arbeite ich mit PHP, TypeScript und React.",
    },
    tech: {
      aria: "Technologien, mit denen Jan arbeitet",
      mobileHeading: "Technologien",
      mobileViewMore: "Mehr anzeigen",
      mobileViewLess: "Weniger anzeigen",
      visitLabel: (name) => `${name} besuchen ↗`,
      items: technologyLogos,
    },
    experience: {
      heading: "Erfahrung",
      items: [
        {
          period: "2026 bis heute",
          title: "Ich entwickle",
          organization: "Finny",
          location: "Bremen",
          bullets: [
            "Ich baue Finny, damit Belege und Kaufdetails zusammenbleiben und ich vor Ablauf einer Garantie erinnert werde.",
          ],
          technologies: ["TypeScript", "React", "Next.js"],
        },
        {
          period: "2023 bis 2026",
          title: "Softwareentwickler in Ausbildung bei",
          organization: "team neusta",
          location: "Bremen",
          secondary: {
            period: "2023 bis 2026",
            title: "Berufsschule · Schulzentrum SII Utbremen",
          },
          bullets: [
            "An Kundenprojekten mit PHP, TypeScript und TYPO3 gearbeitet.",
          ],
          technologies: ["PHP", "Symfony", "TypeScript", "TYPO3", "Git"],
        },
        {
          period: "2023 bis 2024",
          title: "Entwickelt",
          organization: "Ventry",
          location: "Bremen",
          bullets: [
            "Ventry zum temporären Teilen von Dateien mit ablaufenden Links gebaut.",
          ],
          technologies: ["TypeScript", "Next.js"],
        },
      ],
    },
    projects: "Projekte",
    theme: {
      label: "Farbschema umschalten",
      toDark: "Dunkelmodus einschalten",
      toLight: "Hellmodus einschalten",
    },
    activity: {
      heading: "GitHub-Aktivität",
      desktopAria: "GitHub-Beitragsaktivität der letzten zwölf Monate",
      mobileAria: "GitHub-Beitragsaktivität der letzten zwölf Monate",
      less: "weniger",
      more: "mehr",
      contribution: "Beitrag",
      contributions: "Beiträge",
    },
    connect: {
      heading: "Sag hi",
      xAria: "X",
      githubAria: "GitHub",
      linkedinAria: "LinkedIn",
      emailAria: "E-Mail",
      copyEmail: "E-Mail kopieren",
      emailCopied: "E-Mail kopiert",
    },
    finny: {
      linkAria: "Finny auf fnny.app öffnen",
      previewAria: "Finny-Projektvorschau",
      receiptTitle: "BELEG",
      receiptVendor: "dm · 24,90",
      receiptDetail: "2 Jahre Garantie",
      warrantyTitle: "GARANTIE",
      warrantyDetail: "noch abgedeckt",
      warrantyUntil: "bis 08.2028",
      description: { lead: "Finny hält ", first: "Belege", middle: " und ", second: "Kaufdetails", join: " zusammen und erinnert mich, bevor eine ", third: "Garantie", end: " ausläuft." },
      cta: { prefix: "", label: "Finny öffnen ↗" },
    },
    ventry: {
      linkAria: "Ventry auf ventry.host öffnen",
      previewAria: "Ventry-Projektvorschau",
      panelTitle: "AKTUELLE DATEIEN",
      panelCount: "2 DATEIEN",
      fileStatus: "bereit zum Teilen",
      shareLabel: "Freigabelink",
      shareStatus: "löscht sich später",
      shareAction: "bereit",
      description: { lead: "Ventry habe ich zum temporären Teilen von Dateien gebaut. Es erstellt einen ", keyword: "Link", end: ", der nach Ablauf der Freigabe die Datei entfernt." },
      cta: { prefix: "", label: "Ventry öffnen ↗" },
    },
  },
};

const dict = { en, de };

export function tr(locale: Locale): Strings {
  return dict[locale];
}
