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
    buttons: { email: string; github: string; linkedin: string };
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
  opinions: {
    eyebrow: string;
    heading: string;
    sub: string;
    items: string[];
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
    direct: string; // HTML allowed — contains the mailto anchor
    say: string;    // "say hi" — short
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
    title: "Jan-Marlon Leibl — developer in Bremen",
    description: (years, article) =>
      `I'm ${article} ${years}-year-old PHP and TypeScript developer in Bremen. Apprenticing at team neusta, free for hire from June 2026 — full-time or freelance.`,
  },
  topPill: "open for hire — jun '26",
  hero: {
    hey: "Hey there.",
    iAm: "I'm Jan-Marlon",
    aka: "everyone just calls me Jan.",
    ageBefore: (article) => `I'm ${article}`,
    ageAfter: "year old developer at",
    proseBeforeBold: ", working in PHP and TypeScript by day, Next.js by night. Wrapping my apprenticeship in ",
    bold: "June 2026",
    proseAfterBold: " and looking for what's next — full-time or freelance, German or English.",
    origin: "Started coding at 11 with C# — a friend showed me a tiny app he'd built and I had to figure out how it worked. That was the start.",
    buttons: { email: "Email me", github: "GitHub", linkedin: "LinkedIn" },
    aux: {
      statusLabel: "status", statusValue: "open for offers from June 2026",
      basedLabel: "based",   basedValue: "Bremen, Germany · UTC+1",
      replyLabel: "reply",   replyValue: "usually same day",
    },
  },
  stack: {
    eyebrow: "› stack",
    heading: "what I work with",
    sub: "Day to day, in roughly that order. I'd rather pick the boring tool that fits than the hot one that doesn't.",
    items: [
      { name: "PHP",            note: "day job, services & TYPO3" },
      { name: "TypeScript",     note: "end to end, type-led API design" },
      { name: "React",          note: "default for app frontends" },
      { name: "Next.js",        note: "side projects & client builds" },
      { name: "TYPO3",          note: "a lot of what team neusta ships" },
      { name: "Angular & Vue",  note: "shipped when the job needs it" },
    ],
  },
  opinions: {
    eyebrow: "› opinions",
    heading: "lightly held",
    sub: "Things I'd argue for over a coffee. Cheap to change.",
    items: [
      "TypeScript pays for itself by lunchtime.",
      "Boring tech beats hot tech most days of the week.",
      "Commit messages are for the person reading them in 18 months, not for you right now.",
      "If a tool needs a 90-minute setup video, something is wrong.",
      "Shipping is part of the job. Code that never reaches a user is a sketch.",
    ],
  },
  arc: {
    eyebrow: "› arc",
    heading: "how I got here",
    sub: "Short version. The longer one's over coffee.",
    items: [
      { year: "'19", title: "First taste.",            body: "Age 11. A friend showed me a tiny app he'd built in <strong>C#</strong>. I had to figure out how it worked, then build my own. The hook never came out." },
      { year: "'23", title: "team neusta, Bremen.",    body: "Started a three-year apprenticeship. Real client work in <strong>PHP</strong>, <strong>TypeScript</strong>, and <strong>TYPO3</strong> alongside training at Schulzentrum SII Utbremen." },
      { year: "'26", title: "Open for what's next.",   body: "Apprenticeship wraps in June. Looking for full-time or freelance — either fine, both German and English." },
    ],
  },
  contact: {
    eyebrow: "› contact",
    heading: "let's talk",
    sub: "Tell me what you're working on. Same-day reply, German or English.",
    nameLabel: "Name",
    nameHint: "optional",
    namePlaceholder: "who's writing?",
    emailLabel: "Email",
    emailPlaceholder: "so I can reply",
    messageLabel: "Message",
    messagePlaceholder: "apprenticeship, freelance gig, an idea you want to talk through — all fine.",
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
    sending:      "Sending…",
    sent:         "Sent ✓",
    success:      "Got it — I'll reply same day to that email.",
    networkError: "Network error. Please try again or email hi@itsjan.dev.",
    genericError: "Something went wrong. Please try again.",
  },
  peers: {
    none: "no one else here",
    one:  "1 other here",
    many: (n) => `${n} others here`,
  },
  topPillAria:  "Open for hire from June 2026 — email me",
  backToTopAria: "Back to top",
};

const de: Strings = {
  htmlLang: "de",
  meta: {
    title: "Jan-Marlon Leibl — Entwickler in Bremen",
    description: (years) =>
      `Ich bin ein ${years}-jähriger PHP- und TypeScript-Entwickler aus Bremen. Auszubildender bei team neusta, ab Juni 2026 verfügbar — Festanstellung oder freiberuflich.`,
  },
  topPill: "verfügbar — juni '26",
  hero: {
    hey: "Hi.",
    iAm: "Ich bin Jan-Marlon",
    aka: "alle nennen mich einfach Jan.",
    ageBefore: () => "Ich bin",
    ageAfter: "Jahre alter Entwickler bei",
    proseBeforeBold: ", arbeite tagsüber mit PHP und TypeScript, abends mit Next.js. Meine Ausbildung endet im ",
    bold: "Juni 2026",
    proseAfterBold: " und ich suche, was als Nächstes kommt — Festanstellung oder freiberuflich, deutsch oder englisch.",
    origin: "Mit 11 habe ich angefangen zu programmieren — in C#. Ein Freund hat mir eine kleine App gezeigt, die er gebaut hatte, und ich musste herausfinden, wie sie funktioniert. So fing alles an.",
    buttons: { email: "Schreib mir", github: "GitHub", linkedin: "LinkedIn" },
    aux: {
      statusLabel: "status",  statusValue: "ab Juni 2026 verfügbar",
      basedLabel: "ort",      basedValue: "Bremen, Deutschland · UTC+1",
      replyLabel: "antwort",  replyValue: "meist am selben Tag",
    },
  },
  stack: {
    eyebrow: "› stack",
    heading: "Womit ich arbeite",
    sub: "Im Alltag, in etwa dieser Reihenfolge. Lieber das langweilige Tool, das passt, als das angesagte, das nicht passt.",
    items: [
      { name: "PHP",            note: "Tagesgeschäft, Services & TYPO3" },
      { name: "TypeScript",     note: "End-to-End, typgetriebene APIs" },
      { name: "React",          note: "Standard für App-Frontends" },
      { name: "Next.js",        note: "Side Projects & Kundenprojekte" },
      { name: "TYPO3",          note: "viel davon liefert team neusta" },
      { name: "Angular & Vue",  note: "wenn der Job es verlangt" },
    ],
  },
  opinions: {
    eyebrow: "› meinungen",
    heading: "locker gemeint",
    sub: "Dinge, die ich bei einem Kaffee verteidigen würde. Lassen sich leicht ändern.",
    items: [
      "TypeScript hat sich bis zur Mittagspause amortisiert.",
      "Langweilige Technik schlägt angesagte Technik an den meisten Tagen.",
      "Commit-Messages sind für die Person, die sie in 18 Monaten liest — nicht für dich jetzt.",
      "Wenn ein Tool ein 90-minütiges Setup-Video braucht, läuft was schief.",
      "Ausliefern gehört zum Job. Code, der nie zum Nutzer kommt, ist eine Skizze.",
    ],
  },
  arc: {
    eyebrow: "› werdegang",
    heading: "wie ich hier gelandet bin",
    sub: "Die Kurzfassung. Die lange Version gibt's bei einem Kaffee.",
    items: [
      { year: "'19", title: "Erster Kontakt.",        body: "Mit 11. Ein Freund zeigte mir eine kleine App, die er in <strong>C#</strong> gebaut hatte. Ich musste verstehen, wie sie funktioniert, und dann selbst eine bauen. Der Haken saß seitdem." },
      { year: "'23", title: "team neusta, Bremen.",   body: "Beginn einer dreijährigen Ausbildung. Echte Kundenprojekte in <strong>PHP</strong>, <strong>TypeScript</strong> und <strong>TYPO3</strong>, parallel zur Berufsschule am Schulzentrum SII Utbremen." },
      { year: "'26", title: "Offen für das, was kommt.", body: "Ausbildung endet im Juni. Auf der Suche nach Festanstellung oder freiberuflichen Projekten — beides passt, deutsch und englisch." },
    ],
  },
  contact: {
    eyebrow: "› kontakt",
    heading: "lass uns reden",
    sub: "Erzähl mir, woran du arbeitest. Antwort meist am selben Tag, deutsch oder englisch.",
    nameLabel: "Name",
    nameHint: "optional",
    namePlaceholder: "wer schreibt?",
    emailLabel: "E-Mail",
    emailPlaceholder: "damit ich antworten kann",
    messageLabel: "Nachricht",
    messagePlaceholder: "Ausbildung, freiberuflicher Auftrag, eine Idee, über die du sprechen willst — alles passt.",
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
    sending:      "Wird gesendet…",
    sent:         "Gesendet ✓",
    success:      "Angekommen — ich antworte heute noch an diese Adresse.",
    networkError: "Netzwerkfehler. Versuch es noch mal oder schreib direkt an hi@itsjan.dev.",
    genericError: "Etwas ist schiefgelaufen. Versuch es noch mal.",
  },
  peers: {
    none: "niemand sonst hier",
    one:  "1 weitere Person hier",
    many: (n) => `${n} weitere Personen hier`,
  },
  topPillAria:  "Ab Juni 2026 verfügbar — schreib mir",
  backToTopAria: "Zurück nach oben",
};

const dict = { en, de };

export function tr(locale: Locale): Strings {
  return dict[locale];
}
