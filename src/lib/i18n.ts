// Bilingual content + locale detection from Accept-Language header.

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

type ArcRow = { year: string; title: string; body: string };

interface Strings {
  htmlLang: string;
  meta: {
    title: string;
    description: (years: number, article: string) => string;
    imageAlt: string;
    jobTitle: string;
  };
  topPill: string;
  hero: {
    hey: string;
    iAm: string;
    aka: string;
    ageBefore: (article: string) => string;
    ageAfter: string;
    /** Plain-text segment after the company pill, up to but not including the bold date. */
    proseBeforeBold: string;
    bold: string; // bold span text (e.g., "June 2026")
    proseAfterBold: string;
    origin: string;
    buttons: { email: string; github: string; linkedin: string; x: string };
    aux: {
      statusLabel: string; statusValue: string;
      basedLabel: string;  basedValue: string;
      replyLabel: string;  replyValue: string;
    };
  };
  stack: {
    eyebrow: string;
    heading: string;
    sub: string;
    items: { name: string; note: string }[];
  };
  arc: {
    eyebrow: string;
    heading: string;
    sub: string;
    items: ArcRow[];
  };
  contact: {
    eyebrow: string;
    heading: string;
    sub: string;
    nameLabel: string;
    nameHint: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    direct: string; // HTML allowed, contains the mailto anchor
    say: string;    // "say hi", short
  };
  footer: { site: string; sig: string };
  formMessages: {
    required: string;
    sending: string;
    sent: string;
    success: string;
    networkError: string;
    genericError: string;
  };
  peers: {
    none: string;
    one: string;
    many: (n: number) => string;
  };
  topPillAria: string;
  backToTopAria: string;
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
      cardLabel: string;
      visitLabel: (name: string) => string;
      hoverHint: string;
      items: { name: string; logo: string; href: string; darkModeLight?: boolean; detail: { en: string; de: string } }[];
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

const technologyLogos = [
  { name: "PHP", logo: "https://cdn.simpleicons.org/php/777BB4", href: "https://www.php.net/", detail: { en: "The backend work I do every day: services and APIs.", de: "Backend-Arbeit für jeden Tag: Services und APIs." } },
  { name: "TypeScript", logo: "https://cdn.simpleicons.org/typescript/3178C6", href: "https://www.typescriptlang.org/", detail: { en: "For APIs and interfaces that should stay easy to change.", de: "Für APIs und Oberflächen, die sich später leicht ändern lassen." } },
  { name: "React", logo: "https://cdn.simpleicons.org/react/61DAFB", href: "https://react.dev/", detail: { en: "My usual choice for app interfaces and reusable UI.", de: "Meine Standardwahl für App-Oberflächen und wiederverwendbare UI." } },
  { name: "Next.js", logo: "https://cdn.simpleicons.org/nextdotjs/000000", href: "https://nextjs.org/", darkModeLight: true, detail: { en: "For side projects and client work when frontend and backend live together.", de: "Für Neben- und Kundenprojekte, bei denen Frontend und Backend zusammengehören." } },
  { name: "TYPO3", logo: "https://cdn.simpleicons.org/typo3/FF8700", href: "https://typo3.org/", detail: { en: "Client CMS work, from templates to the occasional integration.", de: "CMS-Arbeit für Kunden, von Templates bis zu gelegentlichen Integrationen." } },
  { name: "Angular", logo: "https://cdn.simpleicons.org/angular/DD0031", href: "https://angular.dev/", detail: { en: "A good fit when a project needs a more structured frontend.", de: "Passt gut, wenn ein Projekt ein stärker strukturiertes Frontend braucht." } },
  { name: "Vue", logo: "https://cdn.simpleicons.org/vuedotjs/4FC08D", href: "https://vuejs.org/", detail: { en: "For smaller interfaces and projects that already use it.", de: "Für kleinere Oberflächen und Projekte, die Vue schon einsetzen." } },
  { name: "GitHub", logo: "https://cdn.simpleicons.org/github/181717", href: "https://github.com/", darkModeLight: true, detail: { en: "Where I keep code, review changes, and publish open-source work. The graph here comes from GitHub too.", de: "Hier liegen mein Code und meine Open-Source-Projekte. Auch der Beitragsgraph kommt von hier." } },
  { name: "GitLab", logo: "https://cdn.simpleicons.org/gitlab/FC6D26", href: "https://gitlab.com/", detail: { en: "Useful when a project needs its repository and CI in one place.", de: "Praktisch, wenn Repository und CI an einem Ort bleiben sollen." } },
  { name: "Gitea", logo: "https://cdn.simpleicons.org/gitea/609926", href: "https://about.gitea.com/", detail: { en: "A small self-hosted Git server for projects I want to keep under my control.", de: "Ein kleiner selbst gehosteter Git-Server für Projekte, die ich selbst verwalten will." } },
  { name: "Docker", logo: "https://cdn.simpleicons.org/docker/2496ED", href: "https://www.docker.com/", detail: { en: "Keeps local services predictable from one machine to the next.", de: "Hält lokale Services von einer Maschine zur nächsten gleich." } },
  { name: "Proxmox", logo: "https://cdn.simpleicons.org/proxmox/E57000", href: "https://www.proxmox.com/", detail: { en: "For the virtual machines and services I run myself.", de: "Für virtuelle Maschinen und Services, die ich selbst betreibe." } },
  { name: "Linux", logo: "https://cdn.simpleicons.org/linux/FCC624", href: "https://www.linux.org/", detail: { en: "What I pick when I want a close look at what the system is doing.", de: "Meine Wahl, wenn ich genau sehen will, was das System macht." } },
  { name: "macOS", logo: "https://cdn.simpleicons.org/apple/000000", href: "https://www.apple.com/macos/", darkModeLight: true, detail: { en: "My everyday desktop for coding, design checks, and shipping.", de: "Mein täglicher Desktop zum Coden, für Design-Checks und Releases." } },
  { name: "Astro", logo: "https://cdn.simpleicons.org/astro/FF5D01", href: "https://astro.build/", detail: { en: "For fast content pages like this one.", de: "Für schnelle Inhaltsseiten wie diese." } },
  { name: "Cloudflare", logo: "https://cdn.simpleicons.org/cloudflare/F38020", href: "https://www.cloudflare.com/", detail: { en: "For DNS, edge hosting, and small services in front of a site.", de: "Für DNS, Edge-Hosting und kleine Services vor einer Website." } },
  { name: "Bun", logo: "https://cdn.simpleicons.org/bun/000000", href: "https://bun.sh/", darkModeLight: true, detail: { en: "Runs scripts and manages packages without much ceremony.", de: "Führt Skripte aus und verwaltet Pakete ohne viel Aufwand." } },
  { name: "Claude", logo: "https://cdn.simpleicons.org/claude/D97757", href: "https://claude.ai/", detail: { en: "For thinking through ideas, reviewing code, and tightening up copy.", de: "Zum Durchdenken von Ideen, Prüfen von Code und Schärfen von Texten." } },
  { name: "Codex", logo: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/openai.svg", href: "https://openai.com/codex", darkModeLight: true, detail: { en: "When a rough idea needs to become a real code change.", de: "Wenn aus einer groben Idee eine echte Code-Änderung werden soll." } },
  { name: "Cursor", logo: "https://cdn.simpleicons.org/cursor/000000", href: "https://cursor.com/", darkModeLight: true, detail: { en: "Useful when I am moving quickly through a codebase and want context close by.", de: "Praktisch, wenn ich schnell durch ein Projekt gehe und den Kontext direkt zur Hand haben will." } },
  { name: "Gemini", logo: "https://cdn.simpleicons.org/googlegemini/8E75B2", href: "https://gemini.google.com/", detail: { en: "A second opinion for research, comparisons, and things with images.", de: "Eine zweite Meinung bei Recherche, Vergleichen und Dingen mit Bildern." } },
  { name: "Perplexity", logo: "https://cdn.simpleicons.org/perplexity/20B8CD", href: "https://www.perplexity.ai/", detail: { en: "When I want a quick answer with sources I can follow up on.", de: "Wenn ich schnell eine Antwort brauche und die Quellen prüfen will." } },
  { name: "VS Code", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg", href: "https://code.visualstudio.com/", detail: { en: "The editor I open for everyday coding, debugging, and extensions.", de: "Der Editor für den Alltag, Debugging und Erweiterungen." } },
  { name: "PhpStorm", logo: "https://cdn.simpleicons.org/phpstorm/000000", href: "https://www.jetbrains.com/phpstorm/", darkModeLight: true, detail: { en: "I use it when a PHP project gets big enough for serious navigation and refactoring.", de: "Ich nutze es, wenn ein PHP-Projekt groß genug für gründliche Navigation und Refactoring wird." } },
  { name: "Windows", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/windows11/windows11-original.svg", href: "https://www.microsoft.com/windows", detail: { en: "The platform I started on and still use for Windows-first work.", de: "Die Plattform, mit der ich angefangen habe und die ich für Windows-Projekte weiter nutze." } },
  { name: "Tailwind CSS", logo: "https://cdn.simpleicons.org/tailwindcss/06B6D4", href: "https://tailwindcss.com/", detail: { en: "I use it to keep spacing and styling decisions close to the markup.", de: "Damit halte ich Abstände und Styling-Entscheidungen nah am Markup." } },
];

const en: Strings = {
  htmlLang: "en",
  meta: {
    title: "Jan-Marlon Leibl, developer in Bremen",
    description: (years, article) =>
      `I'm ${article} ${years}-year-old software developer from Bremen. I finished a three-year apprenticeship and I'm building Finny, an app for receipts and warranty reminders.`,
    imageAlt: "Preview of Jan-Marlon Leibl's personal page",
    jobTitle: "Software Developer",
  },
  topPill: "building Finny",
  hero: {
    hey: "Hey.",
    iAm: "I'm Jan-Marlon",
    aka: "everyone just calls me Jan.",
    ageBefore: (article) => `I'm ${article} `,
    ageAfter: "-year-old developer building",
    proseBeforeBold: ", an app that keeps receipt details in one place and reminds you before warranties run out. I finished my ",
    bold: "three-year apprenticeship",
    proseAfterBold: " and still spend most of my time in PHP, TypeScript, and Next.js.",
    origin: "Started coding at 11 in C#. A friend showed me a tiny app he'd built, and I wanted to know how it worked. That was enough.",
    buttons: { email: "Email me", github: "GitHub", linkedin: "LinkedIn", x: "X" },
    aux: {
      statusLabel: "status", statusValue: "building Finny",
      basedLabel: "based",   basedValue: "Bremen, Germany",
      replyLabel: "reply",   replyValue: "same day most of the time",
    },
  },
  stack: {
    eyebrow: "› stack",
    heading: "what I work with",
    sub: "Usually in this order. I'd rather use the boring tool that fits than the shiny one that doesn't.",
    items: [
      { name: "PHP",            note: "day job, services, TYPO3" },
      { name: "TypeScript",     note: "APIs the type checker can help with" },
      { name: "React",          note: "usual pick for app frontends" },
      { name: "Next.js",        note: "side projects and client builds" },
      { name: "TYPO3",          note: "client CMS work" },
      { name: "Angular & Vue",  note: "when the project calls for them" },
    ],
  },
  arc: {
    eyebrow: "› arc",
    heading: "how I got here",
    sub: "Short version. The longer one's over coffee.",
    items: [
      { year: "'19", title: "First taste.",            body: "Age 11. A friend showed me a tiny app he'd built in <strong>C#</strong>. I had to know how it worked, then tried to build my own. The hook stayed." },
      { year: "'23", title: "team neusta, Bremen.",    body: "Started a three-year apprenticeship. Real client work in <strong>PHP</strong>, <strong>TypeScript</strong>, and <strong>TYPO3</strong>, with school at Schulzentrum SII Utbremen on the side." },
      { year: "'26", title: "Finny.",                  body: "Finished the apprenticeship and started <strong>Finny</strong>: take a photo of a receipt, save the useful bits, and get reminded before the warranty runs out." },
    ],
  },
  contact: {
    eyebrow: "› contact",
    heading: "let's talk",
    sub: "Tell me what you're working on. I usually reply the same day, in German or English.",
    nameLabel: "Name",
    nameHint: "optional",
    namePlaceholder: "who's writing?",
    emailLabel: "Email",
    emailPlaceholder: "so I can reply",
    messageLabel: "Message",
    messagePlaceholder: "Finny, freelance work, or an idea you want to talk through. All fine.",
    submit: "Send a note",
    direct: 'or <a href="mailto:hi@itsjan.dev">email hi@itsjan.dev directly</a>',
    say: "say hi",
  },
  footer: {
    site: "itsjan.dev",
    sig:  "jan-marlon leibl · bremen · '26",
  },
  formMessages: {
    required:     "Email and message are required.",
    sending:      "Sending...",
    sent:         "Sent",
    success:      "Got it. I'll reply to that email today.",
    networkError: "Network error. Please try again or email hi@itsjan.dev.",
    genericError: "Something went wrong. Please try again.",
  },
  peers: {
    none: "no one else here",
    one:  "1 other here",
    many: (n) => `${n} others here`,
  },
  topPillAria:  "Building Finny, email me",
  backToTopAria: "Back to top",
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
      cardLabel: "how I use it",
      visitLabel: (name) => `Click to visit ${name} ↗`,
      hoverHint: "hover me",
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
    title: "Jan-Marlon Leibl, Entwickler in Bremen",
    description: (years) =>
      `Ich bin ${years} Jahre alt, Softwareentwickler aus Bremen und baue Finny. Nach meiner dreijährigen Ausbildung arbeite ich meist mit PHP und TypeScript.`,
    imageAlt: "Vorschau der persönlichen Website von Jan-Marlon Leibl",
    jobTitle: "Softwareentwickler",
  },
  topPill: "baue Finny",
  hero: {
    hey: "Hi.",
    iAm: "Ich bin Jan-Marlon",
    aka: "alle nennen mich einfach Jan.",
    ageBefore: () => "Ich bin ",
    ageAfter: " Jahre alt und baue",
    proseBeforeBold: ", eine App, die Belegdetails speichert und dich vor Ablauf der Garantie erinnert. Ich habe meine ",
    bold: "dreijährige Ausbildung",
    proseAfterBold: " abgeschlossen und baue meistens mit PHP, TypeScript und Next.js.",
    origin: "Mit 11 habe ich in C# angefangen. Ein Freund zeigte mir eine kleine App, die er gebaut hatte, und ich wollte wissen, wie sie funktioniert. Das hat gereicht.",
    buttons: { email: "Schreib mir", github: "GitHub", linkedin: "LinkedIn", x: "X" },
    aux: {
      statusLabel: "status",  statusValue: "baue Finny",
      basedLabel: "ort",      basedValue: "Bremen, Deutschland",
      replyLabel: "antwort",  replyValue: "meist am selben Tag",
    },
  },
  stack: {
    eyebrow: "› stack",
    heading: "Womit ich arbeite",
    sub: "Meistens in dieser Reihenfolge. Lieber das langweilige Tool, das passt, als das gehypte, das nicht passt.",
    items: [
      { name: "PHP",            note: "Alltag, Services, TYPO3" },
      { name: "TypeScript",     note: "APIs, bei denen Typen helfen" },
      { name: "React",          note: "meine Standardwahl für App-Frontends" },
      { name: "Next.js",        note: "Nebenprojekte und Kundenprojekte" },
      { name: "TYPO3",          note: "CMS-Arbeit für Kunden" },
      { name: "Angular & Vue",  note: "wenn ein Projekt sie braucht" },
    ],
  },
  arc: {
    eyebrow: "› werdegang",
    heading: "Wie ich hier gelandet bin",
    sub: "Die Kurzfassung. Die lange Version gibt's bei Kaffee.",
    items: [
      { year: "'19", title: "Erster Kontakt.",        body: "Mit 11. Ein Freund zeigte mir eine kleine App, die er in <strong>C#</strong> gebaut hatte. Ich wollte verstehen, wie sie funktioniert, und dann selbst eine bauen. Danach war ich drin." },
      { year: "'23", title: "team neusta, Bremen.",   body: "Ich habe eine dreijährige Ausbildung angefangen. Echte Kundenprojekte in <strong>PHP</strong>, <strong>TypeScript</strong> und <strong>TYPO3</strong>, dazu Berufsschule am Schulzentrum SII Utbremen." },
      { year: "'26", title: "Finny.",                 body: "Ausbildung fertig und <strong>Finny</strong> gestartet. Beleg fotografieren, wichtige Daten speichern, rechtzeitig vor Ablauf der Garantie eine Erinnerung bekommen." },
    ],
  },
  contact: {
    eyebrow: "› kontakt",
    heading: "Lass uns reden",
    sub: "Erzähl mir, woran du arbeitest. Ich antworte meistens am selben Tag, auf Deutsch oder Englisch.",
    nameLabel: "Name",
    nameHint: "optional",
    namePlaceholder: "wer schreibt?",
    emailLabel: "E-Mail",
    emailPlaceholder: "damit ich antworten kann",
    messageLabel: "Nachricht",
    messagePlaceholder: "Finny, ein freiberuflicher Auftrag oder eine Idee, über die du sprechen willst. Passt alles.",
    submit: "Nachricht senden",
    direct: 'oder schreib direkt an <a href="mailto:hi@itsjan.dev">hi@itsjan.dev</a>',
    say: "sag hi",
  },
  footer: {
    site: "itsjan.dev",
    sig:  "jan-marlon leibl · bremen · '26",
  },
  formMessages: {
    required:     "E-Mail und Nachricht sind Pflicht.",
    sending:      "Wird gesendet...",
    sent:         "Gesendet",
    success:      "Angekommen. Ich antworte heute noch an diese Adresse.",
    networkError: "Netzwerkfehler. Versuch es noch mal oder schreib direkt an hi@itsjan.dev.",
    genericError: "Etwas ist schiefgelaufen. Versuch es noch mal.",
  },
  peers: {
    none: "niemand sonst hier",
    one:  "1 weitere Person hier",
    many: (n) => `${n} weitere Personen hier`,
  },
  topPillAria:  "Jan baut Finny, schreib mir",
  backToTopAria: "Zurück nach oben",
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
      cardLabel: "wofür ich es nutze",
      visitLabel: (name) => `${name} besuchen ↗`,
      hoverHint: "Maus hier halten",
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
