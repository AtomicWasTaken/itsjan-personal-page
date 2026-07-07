// Bilingual content + locale detection from Accept-Language header.

export type Locale = "en" | "de";

export function detectLocale(request: Request): Locale {
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
}

const en: Strings = {
  htmlLang: "en",
  meta: {
    title: "Jan-Marlon Leibl, developer in Bremen",
    description: (years, article) =>
      `I'm ${article} ${years}-year-old PHP and TypeScript developer in Bremen. I finished my three-year apprenticeship and I'm building Finny, an app for receipts and warranty reminders.`,
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
};

const de: Strings = {
  htmlLang: "de",
  meta: {
    title: "Jan-Marlon Leibl, Entwickler in Bremen",
    description: (years) =>
      `Ich bin ein ${years}-jähriger PHP- und TypeScript-Entwickler aus Bremen. Ich habe meine dreijährige Ausbildung abgeschlossen und baue Finny, eine App für Belege und Garantie-Erinnerungen.`,
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
};

const dict = { en, de };

export function tr(locale: Locale): Strings {
  return dict[locale];
}
