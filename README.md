# itsjan.dev

[![CI](https://github.com/AtomicWasTaken/itsjan-personal-page/actions/workflows/ci.yml/badge.svg)](https://github.com/AtomicWasTaken/itsjan-personal-page/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Source code for [itsjan.dev](https://itsjan.dev), Jan-Marlon Leibl's bilingual
portfolio. The site is server-rendered with Astro and deployed as a Cloudflare
Worker.

## Highlights

- English and German routes with language negotiation
- Responsive, accessible interactions without a client framework
- GitHub contribution data cached at Cloudflare's edge
- Locally served images, technology logos, banners, and fonts
- Consent-gated PostHog analytics
- Markdown and Agent Skill representations for machine-readable access
- Automated type checks, linting, formatting, tests, content validation, and builds

## Tech stack

- [Astro](https://astro.build/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Bun](https://bun.sh/)

## Local development

Requirements:

- Bun 1.3 or newer
- Node.js 22.12 or newer

```sh
git clone https://github.com/AtomicWasTaken/itsjan-personal-page.git
cd itsjan-personal-page
bun install
bun run dev
```

The development server is available at <http://localhost:4321>.

Analytics is disabled during local development by default. To test the consent
and analytics integration with your own PostHog project, copy `.env.example` to
`.env` and replace its placeholder values. Never commit `.env`.

## Quality checks

```sh
bun run check       # types, lint, formatting, tests, and content integrity
bun run build       # production Cloudflare build
bun run test:browser # browser integration checks against a local preview
bun run ci          # full local equivalent of CI
bun audit           # dependency vulnerability audit (requires network access)
```

Run `bun run format` before committing if formatting fails.

## Project structure

```text
.github/                 CI and repository automation
scripts/                 Repository integrity checks
src/
  assets/                Optimized local images, logos, banners, and fonts
  components/            Reusable Astro UI and client runtimes
  content/resources/     Markdown, LLM context, policy, and profile skill sources
  data/                  Static technology catalog
  layouts/               Document head, metadata, and shared page shell
  lib/                   Locale, GitHub, profile, and presentation helpers
  pages/                 Portfolio, privacy, locale, and 404 routes
  styles/                Font declarations and global design system
  middleware.ts          Markdown negotiation and response security headers
public/
  _headers               MIME and cache policy for static assets
```

## Architecture notes

- GitHub contributions are fetched with a five-second timeout and cached for 15
  minutes. The page falls back to an empty contribution grid if GitHub is
  unavailable.
- Client behavior is implemented with small, typed DOM runtimes. Astro ships no
  component-framework runtime to the browser.
- Fonts are bundled from Fontsource and served from the same origin. The site
  does not depend on Google Fonts or an icon CDN at runtime.
- PostHog loads only after explicit consent. Without configuration or consent,
  analytics remains disabled.
- Requests to `/`, `/en`, `/de`, or `/privacy` with `Accept: text/markdown`
  receive the corresponding localized Markdown document.
- Direct `.md` and `.txt` resources declare UTF-8 explicitly so German content
  is decoded consistently by browsers, crawlers, and agents.

## Machine-readable resources

- [`/llms.txt`](https://itsjan.dev/llms.txt) indexes the public resources.
- [`/llms-full.txt`](https://itsjan.dev/llms-full.txt) contains expanded profile
  and project context.
- [`/en.md`](https://itsjan.dev/en.md) and
  [`/de.md`](https://itsjan.dev/de.md) provide localized portfolio content.
- [`/privacy.en.md`](https://itsjan.dev/privacy.en.md) and
  [`/privacy.de.md`](https://itsjan.dev/privacy.de.md) mirror the privacy page.
- [The public profile skill](https://itsjan.dev/skills/itsjan-profile/SKILL.md)
  is discoverable through `/.well-known/agent-skills/index.json`.

## Deployment

Cloudflare configuration lives in [`wrangler.jsonc`](wrangler.jsonc). The
PostHog values in that file are public browser configuration, not secrets.
Run `bun run types:cloudflare` after changing bindings or variables; CI checks
that the committed `src/worker-configuration.d.ts` still matches the config.

Response policy has two explicit owners:

- `src/middleware.ts` applies CSP, HSTS, other security headers, and `no-store`
  to dynamic HTML and negotiated resources.
- `public/_headers` defines MIME types and caching only for static assets.

Fingerprint-named Astro assets use a one-year immutable cache. The stable
ransom-letter set uses a one-week cache; mutable public image filenames use a
one-day cache with stale-while-revalidate. No HTML route is cached.

Build the Worker with:

```sh
bun run build
```

Validate the generated deployment bundle without uploading it:

```sh
bun run check:deploy
```

Deployment credentials and other secrets must be configured in Cloudflare or
the CI environment. They do not belong in the repository.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow. Security
issues should follow [SECURITY.md](SECURITY.md), not a public issue.

## License

Released under the [MIT License](LICENSE).
