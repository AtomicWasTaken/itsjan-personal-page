# itsjan.dev

_a small note to future me (and anyone else reading this)_

This is my personal website.
Built with Astro + Tailwind, deployed with Cloudflare.

It is intentionally simple:
- one page
- clear layout
- fast load
- easy to maintain

## local setup

```sh
npm install
npm run dev
```

Dev server runs at `http://localhost:4321`.

## build

```sh
npm run build
npm run preview
```

The build output goes to `dist/`.

## quick structure

```text
src/
  pages/index.astro      # the page
  layouts/Layout.astro   # head/meta/fonts
  styles/global.css      # design system + global styles
  components/Button.astro
```

## deployment notes

- Hosting target: Cloudflare (Astro Cloudflare adapter)
- `prebuild` writes a placeholder worker file used during build
- Wrangler config lives in `wrangler.toml`

---

If something looks off on mobile first, check:
1. panel spans in `index.astro`
2. shared tokens in `global.css`
3. image fit/crop classes in the hero block
