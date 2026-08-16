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
  data/                  Static technology catalog
  layouts/               Document head, metadata, and shared page shell
  lib/                   Locale, GitHub, profile, and presentation helpers
  pages/                 Portfolio, privacy, locale, and 404 routes
  styles/                Font declarations and global design system
  middleware.ts          Markdown negotiation and response security headers
public/
  .well-known/           Agent Skill discovery metadata
  skills/                Public Agent Skill content
  *.md                   Machine-readable page representations
  llms*.txt              Curated agent entry points
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
- Requests to `/`, `/en`, or `/de` with `Accept: text/markdown` receive the
  corresponding Markdown document.

## Deployment

Cloudflare configuration lives in [`wrangler.toml`](wrangler.toml). The
PostHog values in that file are public browser configuration, not secrets.

Build the Worker with:

```sh
bun run build
```

Deployment credentials and other secrets must be configured in Cloudflare or
the CI environment. They do not belong in the repository.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow. Security
issues should follow [SECURITY.md](SECURITY.md), not a public issue.

## License

Released under the [MIT License](LICENSE).
