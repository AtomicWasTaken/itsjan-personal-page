# itsjan.dev

Personal portfolio for Jan-Marlon Leibl. Built with Astro, Tailwind CSS, and
the Cloudflare adapter; deployed as a server-rendered Cloudflare Worker.

## Requirements

- Bun 1.x
- Node.js 22.12 or newer

## Local development

```sh
bun install
bun run dev
```

The local site runs at [http://localhost:4321](http://localhost:4321).

```sh
bun run build
bun run preview
```

`bun run build` produces the Cloudflare Worker and static assets in `dist/`.

## Project structure

```text
src/
  layouts/Layout.astro    Document head, metadata, JSON-LD, WebMCP context
  pages/index.astro       Portfolio markup and browser interactions
  pages/[lang].astro      `/en` and `/de` routing
  lib/i18n.ts             English and German content
  lib/portfolio.ts        GitHub activity, technology, and sticker helpers
  lib/site.ts             Canonical URLs, contact details, social links
  middleware.ts           Markdown content negotiation for agents
  styles/global.css       Design tokens and responsive styles

public/
  llms.txt                Curated AI-agent entry point
  llms-full.txt           Expanded public profile content
  *.md                    Markdown representations of portfolio pages
  .well-known/            Agent discovery documents
  skills/                 Public Agent Skill definitions
```

## Agent-readable content

The site exposes public Markdown and discovery resources:

- `/llms.txt` and `/llms-full.txt`
- `/index.md`, `/en.md`, and `/de.md`
- `/.well-known/agent-skills/index.json`
- `/skills/itsjan-profile/SKILL.md`
- `/auth.md`

Requests to `/`, `/en`, or `/de` with `Accept: text/markdown` receive the
matching Markdown representation. `robots.txt` permits search and real-time
agent use while opting out of model training.

## Deployment

The site uses the configuration in `wrangler.toml`.

Do not publish OAuth, MCP, or API-discovery metadata unless the matching
service actually exists.
