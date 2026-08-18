# Webmaster monitoring runbook

This runbook records the search-engine setup for `itsjan.dev`, the initial
measurement baseline, and the recurring review process. It contains no account
identifiers, verification records, OAuth tokens, cookies, or recovery details.

## Ownership and sitemap state

State verified on 18 August 2026 (Europe/Berlin):

| Service                      | Property               | Verification and sitemap state                                                                                                                                     |
| ---------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Google Search Console        | `sc-domain:itsjan.dev` | Domain ownership is verified. `https://itsjan.dev/sitemap-index.xml` was submitted on 18 August 2026 and Search Console reported `Successful` with no fetch error. |
| Bing Webmaster Tools         | `https://itsjan.dev/`  | The property was added through the Search Console import with view-only access. Only `itsjan.dev` was selected for import.                                         |
| Bing Webmaster Tools sitemap | `itsjan.dev`           | `https://itsjan.dev/sitemap-index.xml` was submitted directly. Bing accepted it for processing with no submission error; the initial row was `Submitted`.          |

Google initially reported zero recognized pages immediately after submission.
Bing initially showed no last crawl or discovered-URL count while processing.
These are asynchronous crawler states, not submission failures; the monthly
review records when each count changes.

The public crawl contract is:

- `https://itsjan.dev/robots.txt` references the sitemap index;
- the sitemap index references `https://itsjan.dev/sitemap-0.xml`;
- the child sitemap contains only canonical, indexable production routes;
- legacy paths such as `/privacy` redirect to a localized canonical route and
  do not appear in the sitemap.

## Initial Search Console baseline

The performance range available during setup was 29 July–15 August 2026.

| Signal                  | Initial value                     |
| ----------------------- | --------------------------------- |
| Clicks                  | 0                                 |
| Impressions             | 21                                |
| Click-through rate      | 0%                                |
| Average position        | 2.6                               |
| Most frequent query     | `Jan Leibl` — 8 impressions       |
| Indexed pages           | 1                                 |
| Not-indexed pages       | 3 across 3 reported reasons       |
| Mobile Core Web Vitals  | Not enough 90-day field data      |
| Desktop Core Web Vitals | No usable field baseline reported |

The three exclusion reasons present at setup were one page with a redirect,
one alternate page with a correct canonical, and one duplicate for which Google
selected a different canonical. These counts describe Google's previously
crawled set; they do not yet include all routes added immediately before this
baseline.

## URL inspection baseline

Inspection was performed on 18 August 2026 after the sitemap submission.
“Unknown” means Search Console returned no crawl or canonical detail yet.

| URL                   | Google state             | Canonical or follow-up note                                                                                                                   |
| --------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                   | On Google                | Indexed root and current `x-default`.                                                                                                         |
| `/en`                 | Not on Google            | Last crawled 10 August 2026. User canonical: `/en`; Google selected `/`. Recheck after Google crawls the new self-canonical and hreflang set. |
| `/de`                 | Not on Google — unknown  | No crawl detail reported yet.                                                                                                                 |
| `/privacy`            | Not on Google — expected | Legacy redirect to `/en/privacy`; it must remain absent from the sitemap.                                                                     |
| `/en/privacy`         | Not on Google — unknown  | No crawl detail reported yet.                                                                                                                 |
| `/de/datenschutz`     | Not on Google — unknown  | No crawl detail reported yet.                                                                                                                 |
| `/en/projects`        | Not on Google — unknown  | Newly published canonical route.                                                                                                              |
| `/de/projekte`        | Not on Google — unknown  | Newly published canonical route.                                                                                                              |
| `/en/projects/finny`  | Not on Google — unknown  | Newly published canonical route.                                                                                                              |
| `/de/projekte/finny`  | Not on Google — unknown  | Newly published canonical route.                                                                                                              |
| `/en/projects/ventry` | Not on Google — unknown  | Newly published canonical route.                                                                                                              |
| `/de/projekte/ventry` | Not on Google — unknown  | Newly published canonical route.                                                                                                              |

Do not treat “not on Google” as an implementation failure by itself. Confirm
that the route returns `200`, is in the sitemap, self-canonicalizes, and is
internally linked before requesting another crawl. The sitemap submission is
the primary discovery mechanism; manual indexing requests are reserved for a
canonical route that remains undiscovered after the next review.

## Rendered canonical and hreflang contract

The production HTML was checked separately from Search Console because URL
Inspection does not provide a complete hreflang report. Every row below returns
`200`, self-canonicalizes without a trailing slash, and declares reciprocal
`en`, `de`, and `x-default` links.

| Page group    | English route         | German route          | `x-default`           |
| ------------- | --------------------- | --------------------- | --------------------- |
| Homepage      | `/en`                 | `/de`                 | `/`                   |
| Privacy       | `/en/privacy`         | `/de/datenschutz`     | `/en/privacy`         |
| Project index | `/en/projects`        | `/de/projekte`        | `/en/projects`        |
| Finny         | `/en/projects/finny`  | `/de/projekte/finny`  | `/en/projects/finny`  |
| Ventry        | `/en/projects/ventry` | `/de/projekte/ventry` | `/en/projects/ventry` |

The root also self-canonicalizes to `/` and points to `/en`, `/de`, and `/` as
its `en`, `de`, and `x-default` alternates. A language switcher is intentionally
not part of this contract.

## Submission workflow

When a canonical route is added or removed:

1. Update the route's metadata, self-canonical, reciprocal hreflang set,
   structured data, internal links, sitemap coverage, and browser tests in the
   same pull request.
2. Run `bun run ci` and the representative Lighthouse audit before deployment.
3. Confirm the deployed route and sitemap return `200`; confirm legacy routes
   redirect in one hop.
4. Check the existing sitemap-index row in Search Console. Resubmit only if the
   sitemap URL changed or Google reports a fetch error.
5. Check the Bing sitemap row for the same URL and submit it if it is absent.
6. Inspect the new canonical URL after deployment and record the first crawl,
   index state, user canonical, and Google-selected canonical below the monthly
   snapshot.

Never add a verification token, DNS credential, account email, browser profile,
API key, OAuth response, or exported webmaster data to the repository.

## Monthly review checklist

Review monthly, and additionally 30, 60, and 90 days after publishing a new
case study or technical article.

- [ ] Search Console sitemap remains `Successful`; record recognized pages and
      the last-read date.
- [ ] Bing sitemap has completed processing without a fetch or parsing error;
      record discovered URLs and the last crawl.
- [ ] Indexed-page count is compared with the canonical URLs in the sitemap.
- [ ] Every new or changed route is inspected for crawl status and selected
      canonical; investigate cross-locale canonical selection.
- [ ] Excluded-page reasons are reviewed for new redirects, soft 404s,
      duplicates, blocked resources, or accidental `noindex` directives.
- [ ] Hreflang pairs are sampled from rendered production HTML and checked for
      self-reference, reciprocity, `x-default`, and `200` targets.
- [ ] Clicks, impressions, CTR, average position, top queries, and top pages are
      recorded for the same comparison range.
- [ ] Branded and non-branded queries are evaluated separately; titles or copy
      are changed only when the query intent and page evidence support it.
- [ ] Mobile and desktop Core Web Vitals are reviewed when sufficient field data
      becomes available; repository Lighthouse results remain a lab guardrail,
      not a substitute for field data.
- [ ] Security/manual-action reports and webmaster notifications contain no new
      issue.
- [ ] The snapshot date, notable changes, and any follow-up issue are appended
      to the operations log below.

## Operations log

| Date       | Event                                                                                                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-18 | Verified Search Console ownership, submitted the sitemap successfully, recorded the initial performance/index/CWV baseline, and inspected all current canonical route groups. |
| 2026-08-18 | Added only `itsjan.dev` to Bing through the Search Console import and submitted the sitemap index directly; Bing accepted it for processing without an error.                 |
