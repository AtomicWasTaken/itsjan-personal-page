// Bilingual content + locale detection from Accept-Language header.

import { TECHNOLOGIES } from "../data/technologies";
import type { Technology } from "../data/technologies";
import type { Locale } from "./locale";
export { detectLocale } from "./locale";
export type { Locale } from "./locale";

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
      shareAria: string;
      shareTooltip: string;
      linkCopied: string;
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
      description: {
        lead: string;
        first: string;
        middle: string;
        second: string;
        join: string;
        third: string;
        end: string;
      };
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

const en: Strings = {
  htmlLang: "en",
  meta: {
    imageAlt: "Jan-Marlon Leibl's portfolio",
    jobTitle: "Software Developer",
  },
  portfolio: {
    subtitle: (age) => `${age}, software developer from Bremen`,
    subtitleStates: (age) => [
      `${age}, software developer from Bremen`,
      "Building Finny",
      "Mostly PHP, TypeScript and React",
      "Home server tinkerer",
    ],
    avatar: {
      expand: "Expand profile picture",
      collapse: "Close profile picture",
    },
    intro: {
      beforeBremen: "I'm a software developer from ",
      afterBremen: ". After finishing a ",
      apprenticeship: "three-year apprenticeship",
      afterApprenticeship:
        " here, I started building the tools I wanted for myself. My current project is ",
      finny: "Finny",
      afterFinny:
        ", an app that keeps receipts and purchase details in one place and warns me before a warranty expires. Most days I work with PHP, TypeScript and React. Away from that, I run a Proxmox server and usually find something else to fix in my home network.",
    },
    tech: {
      aria: "Tools and technologies I use",
      mobileHeading: "Tools I use",
      mobileViewMore: "Show more",
      mobileViewLess: "Show fewer",
      visitLabel: (name) => `Visit ${name}`,
      items: TECHNOLOGIES,
    },
    experience: {
      heading: "Experience",
      items: [
        {
          period: "Since 2026",
          title: "Building",
          organization: "Finny",
          location: "Bremen",
          bullets: [
            "I'm building Finny to keep receipts and purchase details in one place, with a reminder before each warranty expires.",
          ],
          technologies: ["TypeScript", "React", "Next.js"],
        },
        {
          period: "2023 to 2026",
          title: "Software development apprenticeship at",
          organization: "team neusta",
          location: "Bremen",
          secondary: {
            period: "2023 to 2026",
            title: "Vocational school at Schulzentrum SII Utbremen",
          },
          bullets: [
            "I worked on client projects using PHP, TypeScript and TYPO3.",
          ],
          technologies: ["PHP", "Symfony", "TypeScript", "TYPO3", "Git"],
        },
        {
          period: "2023 to 2024",
          title: "Built",
          organization: "Ventry",
          location: "Bremen",
          bullets: [
            "I built Ventry because I wanted a simple way to share files through links that expire on their own.",
          ],
          technologies: ["TypeScript", "Next.js"],
        },
        {
          period: "Personal",
          title: "Running my",
          organization: "homelab",
          location: "Bremen",
          bullets: [
            "I keep a Proxmox node and my home network running, upgrade hardware and chase down whatever broke this time.",
          ],
          technologies: ["Proxmox", "Linux", "Windows"],
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
      heading: "My year on GitHub",
      desktopAria: "My GitHub contributions over the past year",
      mobileAria: "My GitHub contributions over the past year",
      less: "Less",
      more: "More",
      contribution: "contribution",
      contributions: "contributions",
    },
    connect: {
      heading: "Elsewhere",
      xAria: "X",
      githubAria: "GitHub",
      linkedinAria: "LinkedIn",
      emailAria: "Email",
      shareAria: "Share this page",
      shareTooltip: "Share this page",
      linkCopied: "Copied",
      copyEmail: "Copy my email",
      emailCopied: "Copied",
    },
    finny: {
      linkAria: "Open Finny",
      previewAria: "Preview of Finny",
      receiptTitle: "RECEIPT",
      receiptVendor: "dm · 24.90",
      receiptDetail: "warranty: 2 years",
      warrantyTitle: "WARRANTY",
      warrantyDetail: "covered",
      warrantyUntil: "until 08.2028",
      description: {
        lead: "With Finny, my ",
        first: "receipts",
        middle: ", ",
        second: "purchase details",
        join: " and ",
        third: "warranties",
        end: " finally live in one place. It reminds me before I miss an expiry date.",
      },
      cta: { prefix: "", label: "Open Finny ↗" },
    },
    ventry: {
      linkAria: "Open Ventry",
      previewAria: "Preview of Ventry",
      panelTitle: "RECENT UPLOADS",
      panelCount: "2 FILES",
      fileStatus: "ready to share",
      shareLabel: "expiring link",
      shareStatus: "deletes automatically",
      shareAction: "ready",
      description: {
        lead: "Ventry lets me send a file without keeping it online forever. The ",
        keyword: "link",
        end: " and the file disappear when the time is up.",
      },
      cta: { prefix: "", label: "Open Ventry ↗" },
    },
  },
};

const de: Strings = {
  htmlLang: "de",
  meta: {
    imageAlt: "Portfolio von Jan-Marlon Leibl",
    jobTitle: "Softwareentwickler",
  },
  portfolio: {
    subtitle: (age) => `${age}, Softwareentwickler aus Bremen`,
    subtitleStates: (age) => [
      `${age}, Softwareentwickler aus Bremen`,
      "Ich baue Finny",
      "Meistens PHP, TypeScript und React",
      "Homelab-Bastler",
    ],
    avatar: {
      expand: "Profilbild vergrößern",
      collapse: "Profilbild schließen",
    },
    intro: {
      beforeBremen: "Ich bin Softwareentwickler aus ",
      afterBremen: ". Nach meiner ",
      apprenticeship: "dreijährigen Ausbildung",
      afterApprenticeship:
        " hier habe ich angefangen, die Tools zu bauen, die mir selbst gefehlt haben. Aktuell arbeite ich an ",
      finny: "Finny",
      afterFinny:
        ", einer App, die Belege und Kaufdetails an einem Ort sammelt und mich rechtzeitig vor dem Ende einer Garantie erinnert. Im Alltag arbeite ich vor allem mit PHP, TypeScript und React. Wenn noch Zeit bleibt, betreibe ich einen Proxmox-Server und finde in meinem Heimnetzwerk meistens das nächste Problem zum Lösen.",
    },
    tech: {
      aria: "Tools und Technologien, mit denen ich arbeite",
      mobileHeading: "Meine Tools",
      mobileViewMore: "Mehr zeigen",
      mobileViewLess: "Weniger zeigen",
      visitLabel: (name) => `${name} besuchen`,
      items: TECHNOLOGIES,
    },
    experience: {
      heading: "Erfahrung",
      items: [
        {
          period: "Seit 2026",
          title: "Ich entwickle",
          organization: "Finny",
          location: "Bremen",
          bullets: [
            "Ich baue Finny, damit Belege und Kaufdetails nicht mehr an verschiedenen Orten liegen. Vor Ablauf einer Garantie gibt die App rechtzeitig Bescheid.",
          ],
          technologies: ["TypeScript", "React", "Next.js"],
        },
        {
          period: "2023 bis 2026",
          title: "Ausbildung zum Softwareentwickler bei",
          organization: "team neusta",
          location: "Bremen",
          secondary: {
            period: "2023 bis 2026",
            title: "Berufsschule am Schulzentrum SII Utbremen",
          },
          bullets: [
            "Bei Kundenprojekten habe ich hauptsächlich mit PHP, TypeScript und TYPO3 gearbeitet.",
          ],
          technologies: ["PHP", "Symfony", "TypeScript", "TYPO3", "Git"],
        },
        {
          period: "2023 bis 2024",
          title: "Entwickelt",
          organization: "Ventry",
          location: "Bremen",
          bullets: [
            "Ventry entstand, weil ich Dateien unkompliziert über Links teilen wollte, die von selbst ablaufen.",
          ],
          technologies: ["TypeScript", "Next.js"],
        },
        {
          period: "Privat",
          title: "Betreibe mein",
          organization: "Homelab",
          location: "Bremen",
          bullets: [
            "Ich halte einen Proxmox-Node und mein Heimnetz am Laufen, rüste Hardware auf und suche heraus, was diesmal kaputtgegangen ist.",
          ],
          technologies: ["Proxmox", "Linux", "Windows"],
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
      heading: "Mein Jahr auf GitHub",
      desktopAria: "Meine GitHub-Beiträge im letzten Jahr",
      mobileAria: "Meine GitHub-Beiträge im letzten Jahr",
      less: "Weniger",
      more: "Mehr",
      contribution: "Beitrag",
      contributions: "Beiträge",
    },
    connect: {
      heading: "Wo du mich findest",
      xAria: "X",
      githubAria: "GitHub",
      linkedinAria: "LinkedIn",
      emailAria: "E-Mail",
      shareAria: "Diese Seite teilen",
      shareTooltip: "Diese Seite teilen",
      linkCopied: "Kopiert",
      copyEmail: "E-Mail kopieren",
      emailCopied: "Kopiert",
    },
    finny: {
      linkAria: "Finny öffnen",
      previewAria: "Vorschau von Finny",
      receiptTitle: "BELEG",
      receiptVendor: "dm · 24,90",
      receiptDetail: "Garantie: 2 Jahre",
      warrantyTitle: "GARANTIE",
      warrantyDetail: "noch gültig",
      warrantyUntil: "bis 08.2028",
      description: {
        lead: "Mit Finny habe ich meine ",
        first: "Belege",
        middle: ", ",
        second: "Kaufdetails",
        join: " und ",
        third: "Garantien",
        end: " endlich an einem Ort. Die App erinnert mich, bevor ich ein Ablaufdatum verpasse.",
      },
      cta: { prefix: "", label: "Finny öffnen ↗" },
    },
    ventry: {
      linkAria: "Ventry öffnen",
      previewAria: "Vorschau von Ventry",
      panelTitle: "LETZTE DATEIEN",
      panelCount: "2 DATEIEN",
      fileStatus: "bereit zum Teilen",
      shareLabel: "Link mit Ablaufdatum",
      shareStatus: "löscht sich automatisch",
      shareAction: "bereit",
      description: {
        lead: "Mit Ventry kann ich eine Datei teilen, ohne sie dauerhaft online zu lassen. Sobald die Zeit abgelaufen ist, verschwinden ",
        keyword: "Link",
        end: " und Datei.",
      },
      cta: { prefix: "", label: "Ventry öffnen ↗" },
    },
  },
};

const dict = { en, de };

export function tr(locale: Locale): Strings {
  return dict[locale];
}
