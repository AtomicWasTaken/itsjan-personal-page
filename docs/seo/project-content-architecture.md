# Localized project content architecture

Project content uses explicit locale routes and stable brand slugs. A page is added to the sitemap only when its English or German main content is complete; empty case-study routes are never published.

## Routes

| Content           | English               | German                |
| ----------------- | --------------------- | --------------------- |
| Project index     | `/en/projects`        | `/de/projekte`        |
| Finny case study  | `/en/projects/finny`  | `/de/projekte/finny`  |
| Ventry case study | `/en/projects/ventry` | `/de/projekte/ventry` |

Every page self-canonicalizes without a trailing slash and declares reciprocal `en`, `de`, and `x-default` hreflang links. `x-default` points to the English page. Brand slugs stay identical across locales; only the index segment is translated.

## Content model

`ProjectCaseStudy` in `src/data/project-content.ts` is the source contract. Every localized case study must provide:

- identity, locale, canonical route, alternate route, and external product URL;
- page title, search metadata, summary, development period, and current status;
- the problem, Jan's role, architecture, technologies, decisions, challenges, and outcomes;
- responsive images with intrinsic dimensions and meaningful alt text, or an accessible diagram with a text description.

Claims must be supported by repository history, the public product, or material supplied by Jan. Metrics, customers, and outcomes must not be inferred.

## Search and linking rules

- Project indexes use `CollectionPage`; case studies use `Article`, connected to the stable site `Person` and `WebSite` entities.
- Metadata is written independently in each locale and describes visible page content.
- A complete page is included in the canonical sitemap and covered by browser and Lighthouse checks.
- Homepage project headings link descriptively into the matching localized project content. Product CTAs remain separate external links.
- Case studies link back to the localized project index and to the external product using the canonical product URL.
- The site exposes localized URLs through links, hreflang, and the sitemap. It intentionally does not add a language switcher.
