# Evidence-led technical writing strategy

The site should earn non-branded visibility by publishing material Jan can support with code, product behavior, screenshots, diagrams, logs, or first-hand delivery experience. It must not launch an empty writing index or fill gaps with generic AI-generated tutorials.

## Editorial principles

1. Start with a real implementation, failure, trade-off, or measured observation.
2. State what was built or observed separately from general guidance.
3. Remove confidential client details and never infer users, customers, metrics, or outcomes.
4. Include the artifact that makes the article distinct: tested code, request traces, an architecture diagram, a reproducible setup, or an anonymized debugging timeline.
5. Publish only when the article is useful without depending on search-engine traffic.

## Prioritized topic map

| Priority | Topic pillar                      | Audience and search intent                                                                                                                | Evidence available                                                                                                                    | Related page                             | Distinctive angle                                                                                                                                 |
| -------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | Astro and Cloudflare delivery     | Web developers and technical SEOs looking for canonical redirects, hreflang, sitemap, content negotiation, or Workers deployment guidance | This repository's middleware, Astro configuration, schema builder, browser tests, Lighthouse workflow, and deployed hostname behavior | Portfolio and project index architecture | Show one production URL model enforced at the edge and verified as a system, including the failure modes caught by CodeQL and browser tests       |
| 2        | Human-reviewed receipt processing | Product engineers and frontend developers researching receipt OCR UX, warranty tracking, review flows, and deadline reminders             | Finny's public workflow, English/German product resources, and the localized Finny case study                                         | Finny case study and `fnny.app`          | Treat OCR as a draft in a human-in-the-loop product rather than presenting extraction as an infallible AI result                                  |
| 3        | Time-bounded file lifecycles      | TypeScript and web developers looking for expiring upload, signed-link, retention, or automatic cleanup architecture                      | The documented Ventry 2023–2024 workflow, the live public feature description, and the Ventry case study                              | Ventry case study and `ventry.host`      | Explain why expiry is a state transition across both access and storage, not merely a timestamp displayed beside a link                           |
| 4        | PHP and TYPO3 delivery            | PHP, Symfony, and TYPO3 developers seeking practical implementation and upgrade lessons                                                   | Jan's 2023–2026 apprenticeship and repository-safe examples that can be recreated without client code                                 | Experience section                       | Focus on one reproducible integration or debugging lesson at a time; publication waits until a sanitized code sample or local reproduction exists |
| 5        | Proxmox and homelab reliability   | Self-hosters troubleshooting Proxmox, Linux, networking, backups, or service recovery                                                     | Jan's running Proxmox node and home network; future command output, diagrams, and incident notes                                      | Homelab experience entry                 | Use small, honest postmortems with the observed symptom, wrong turns, diagnosis, fix, and prevention instead of generic setup lists               |

The first three pillars are launch-ready because public, reviewable evidence already exists. PHP/TYPO3 and homelab ideas stay in the research queue until a concrete artifact is available.

## Launch article briefs

### 1. One canonical URL model for a bilingual Astro site on Cloudflare

- **Primary intent:** implementation guidance for Astro canonical URLs, locale hreflang, trailing-slash redirects, and Cloudflare Workers.
- **Audience:** developers responsible for an Astro site with multiple locales or legacy URLs.
- **Promise:** a tested way to make redirects, canonical tags, hreflang, sitemap entries, and structured data agree.
- **First-hand material:** `src/middleware.ts`, `astro.config.mjs`, `src/layouts/Layout.astro`, schema tests, browser sitemap assertions, and the deployed `www` redirect.
- **Unique angle:** treat canonicalization as one invariant spanning edge middleware, rendered HTML, XML, and JSON-LD rather than as a collection of unrelated meta tags.
- **Outline:** define the route matrix; normalize host/path/query in one hop; render self-canonicals and reciprocal alternates; filter legacy routes from the sitemap; test the whole contract; document the `Content-Signal` Lighthouse exception.
- **Required proof:** a request/response matrix captured from the production domain, focused code excerpts linked to exact repository revisions, and passing browser-test output.
- **Internal links:** portfolio root, localized project index, privacy canonical example, and the source repository.
- **Avoid:** claiming that hreflang controls ranking or that a Lighthouse score proves indexation.

### 2. Receipt OCR should produce a draft, not a decision

- **Primary intent:** product and UX guidance for receipt OCR review flows and warranty-reminder data quality.
- **Audience:** product engineers building extraction-assisted consumer workflows.
- **Promise:** show where a human review step belongs between automatic extraction and a deadline-dependent action.
- **First-hand material:** Finny's public receipt flow, reviewable fields, warranty dates, and email-reminder behavior; the receipt-to-reminder diagram in the Finny case study.
- **Unique angle:** the important architecture boundary is not OCR accuracy in isolation but whether unreviewed suggestions can trigger later actions.
- **Outline:** define the purchase record; distinguish source image, extracted draft, reviewed fields, and saved deadline; design correction states; connect reminders only to reviewed data; explain the boundary between date organization and legal advice.
- **Required proof:** localized screenshots or a diagram from the public flow, exact public product wording for supported inputs and fields, and no private receipt data.
- **Internal links:** English/German Finny case study and the matching public Finny product page.
- **Avoid:** publishing extraction-accuracy numbers, model details, or user outcomes unless measured evidence is supplied.

### 3. An expiring link is a file-retention state machine

- **Primary intent:** architecture guidance for expiring file uploads and automatic cleanup.
- **Audience:** TypeScript and web developers designing temporary file-sharing systems.
- **Promise:** model access expiry and stored-file removal as one lifecycle so dead links do not leave forgotten data behind.
- **First-hand material:** Ventry's documented 2023–2024 behavior, TypeScript/Next.js stack, public self-deleting-upload description, and case-study lifecycle diagram.
- **Unique angle:** start from the product promise and derive the states and failure cases without inventing Ventry's private infrastructure.
- **Outline:** define uploaded, shareable, expired, and removed states; identify idempotent cleanup requirements; discuss clock and retry concerns as general design considerations; separate historical implementation facts from recommended production hardening.
- **Required proof:** the public feature description, an explicit fact-versus-recommendation legend, and a framework-neutral state diagram.
- **Internal links:** English/German Ventry case study and `ventry.host`.
- **Avoid:** claiming specific storage providers, queue systems, cleanup schedules, scale, or current active development.

### 4. Serving HTML and Markdown from one Astro/Cloudflare route safely

- **Primary intent:** technical guidance for HTTP content negotiation and machine-readable site resources.
- **Audience:** developers exposing Markdown or agent-readable representations beside normal web pages.
- **Promise:** keep one canonical page URL while serving an explicit Markdown representation without accidental locale variance or cache confusion.
- **First-hand material:** `acceptsMarkdown`, `contentResponseFor`, `Vary` handling, stable root-language behavior, Markdown resources, and middleware tests in this repository.
- **Unique angle:** combine negotiation correctness, cache headers, canonical discovery, and security headers in one executable example.
- **Outline:** parse `Accept` with quality values; map only known routes; keep `x-default` deterministic; set `Vary` precisely; test `HEAD`; keep text resources and HTML security policy aligned.
- **Required proof:** runnable tests and example `curl` requests for HTML, Markdown, disabled quality, and explicit locale routes.
- **Internal links:** portfolio root, `llms.txt`, source repository, and the canonicalization article.
- **Avoid:** presenting experimental agent discovery conventions as universal standards.

## Localization policy

- Choose the primary language from the query vocabulary and available first-hand material, not from a fixed English-first rule.
- A translation is a full editorial pass: headings, examples, terminology, metadata, captions, alt text, and internal anchors must read naturally in that locale.
- Publish reciprocal hreflang only when both versions are complete. `x-default` points to the English version under the site's existing URL policy.
- A useful article may launch in one language first. Do not publish a thin machine translation merely to create a pair.
- Technical identifiers and code stay unchanged; prose explains locale-specific terminology where useful.

## Metadata and internal-link conventions

- Use a descriptive, page-specific title that leads with the problem or implementation, followed by Jan's name only when it improves context.
- Keep meta descriptions between roughly 120 and 160 characters, match visible content, and avoid unverified superlatives.
- Every article self-canonicalizes, uses the stable slashless route, and enters the sitemap only after the publishing gate passes.
- Use `Article` structured data connected to the site's stable `Person` author and `WebSite` entities. Include publication/modification dates and a meaningful preview image.
- Link from the relevant case study or experience entry using an anchor that describes the article's subject. Link back to the evidence page from the article.
- Add one or two contextual links to related articles where they genuinely continue the reader's task; do not create keyword-heavy sitewide link blocks.

## Publishing gate

An article is ready only when all of these are true:

- a named first-hand artifact is stored, linked, or reproducible;
- factual claims and recommendations are visibly distinguishable;
- private or client-specific information has been removed;
- code samples run against the stated versions and have a test or reproduction command;
- diagrams, screenshots, captions, and alt text explain the same system as the prose;
- metadata, canonical, hreflang, structured data, sitemap, browser tests, and Lighthouse checks pass;
- a native-quality review is complete for every published locale.

Do not add a public writing index until at least three articles have passed this gate. This prevents an empty section and gives the initial index enough internal-link value to be useful.

## Measurement and review

Record a baseline when Search Console is available, then review monthly and at 30, 60, and 90 days after each publication.

| Signal                  | Source                                                 | What to evaluate                                                                                                  |
| ----------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Indexed canonical       | Search Console URL Inspection                          | Google-selected canonical matches the page, rendered content is available, and no unintended duplicate is indexed |
| Non-branded impressions | Search Console page/query report                       | Relevant implementation and problem queries appear; irrelevant broad queries trigger title/content review         |
| Qualified visits        | Search Console clicks plus consented site analytics    | Readers land on the article and continue to the linked case study, source code, or product evidence               |
| Click-through rate      | Search Console                                         | Compare query/title fit over time; do not optimize CTR before the page has meaningful impressions                 |
| Earned references       | Search Console links report and manual referrer review | Relevant technical pages cite the article or its original artifact                                                |
| Content freshness       | Repository review                                      | Versions, product status, screenshots, external links, and recommendations still match reality                    |

No traffic target is set before a baseline exists. Success is a sustained rise in relevant non-branded impressions, qualified visits, or earned links—not raw page count.

## Initial execution order

1. Draft and technically review the Astro/Cloudflare canonicalization article.
2. Produce the receipt-OCR draft article with Finny evidence and a privacy review.
3. Produce the expiring-file lifecycle article with an explicit historical-fact boundary.
4. Publish the writing index only after all three pass the gate.
5. Keep PHP/TYPO3 and homelab topics in research until a reproducible artifact is attached to each brief.
