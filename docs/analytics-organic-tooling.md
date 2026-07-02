# Repair ASAP analytics + organic tooling setup

Scope: `https://asap.repair/` static marketing site for the Repair ASAP tenant/customer. Do not mix these accounts or metrics with the Bazas platform property unless explicitly doing cross-site reporting.

## Current live baseline

- GA4 is installed on all generated HTML pages with measurement ID `G-1ZRVGCMZ43`.
- Public discovery files are live: `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`.
- Sitemap currently lists 97 unique URLs.
- Microsoft Clarity is installed with project ID `wyzjzrud6n`.
- GA4 is linked to the Search Console domain property `asap.repair` for the web stream `asap.repair` (`13645884964`).
- Bing Webmaster Tools has the `asap.repair` property and a successful canonical sitemap submission.
- Ahrefs Site Audit project exists for `asap.repair/` and is verified in Ahrefs.

## 2026-07-02 implementation log

Live site source of truth:

- Repository/worktree: `/Users/nikita/Developer/sitehandy`.
- Cloudflare Pages project: `asap-repair`.
- GitHub remote still accepts pushes at `nlylov/sitehandy`, while GitHub reports the repository moved to `nlylov/asap.repair`.
- Check the current production source with `npx wrangler pages deployment list --project-name asap-repair`; do not treat this document as a static deployment pointer.

Implemented and verified:

- Widget visit tracking no longer posts `/api/widget/visit` before a real chat thread exists.
- Quote submissions now carry attribution context from the browser: page URL, referrer, language, timezone, visitor ID, UTM/click IDs where present, and GA client ID from the `_ga` cookie.
- `www.asap.repair` canonicalizes to `https://asap.repair/...`.
- Old Tadelakt/decorative plaster URLs 301 to `/services/painting/decorative-plaster-tadelakt/`; moved HTML fallbacks are `noindex, follow`.
- `/labs/*` redirects to `/services/` and is covered by `X-Robots-Tag: noindex, nofollow`.
- Service JSON-LD now uses explicit area coverage for NYC boroughs plus Western Long Island/Nassau County where scope and travel fit.
- 77 live service pages now include visible service-area and quote-prep copy; the two remaining service HTML files are noindex/meta-refresh moved Tadelakt fallbacks.
- `/services/` has a top-level Service JSON-LD block with `hasOfferCatalog`.
- `facts.json`, `llms.txt`, and `llms-full.txt` include Nassau County scope and quote-prep details by service category.
- Cloudflare Redirect Rule `Redirect api.asap.repair to canonical site` is active. It matches `http.host eq "api.asap.repair"` and returns a 301 redirect to `concat("https://asap.repair", http.request.uri.path)` while preserving the query string.

Validation performed:

- `facts.json` parsed successfully.
- 266 JSON-LD blocks across the site parsed successfully.
- `node scripts/validate-structured-data.mjs` passed: 266 JSON-LD blocks parsed and 10 `Article` blocks checked for `spatialCoverage` as a schema.org `Place`.
- Indexable HTML meta descriptions were checked locally; no indexable page has a meta description over 155 characters.
- Indexable HTML titles were checked locally; no indexable page has a `<title>` over 65 characters.
- Case-study internal links were checked locally; each case-study detail page now has 4 incoming internal links.
- `node --check` passed for `main.js`, `chat.js`, `components/loader.js`, and `components/quote-modal.js`.
- Sitemap verified live and local at 97 URLs / 97 unique URLs.
- `wrangler pages dev` parsed 70 redirect rules and 13 header rules; only ordering performance warnings were reported.
- Cloudflare Pages production deployment for commit `5a7b649` completed successfully.
- Live `asap.repair` verified for `/services/`, `/services/appliance-services/dishwasher-installation/`, `/services/painting/decorative-plaster-tadelakt/`, `/facts.json`, and `/llms.txt`.
- Live `api.asap.repair` verified: `/` redirects to `https://asap.repair/`, `/services/plumbing/` redirects to `https://asap.repair/services/plumbing/`, query strings are preserved, and following the redirect returns `200`.
- `crm.asap.repair` was checked after the redirect rule and remains on the CRM/Railway login flow; it is not affected by the `api.asap.repair` host-only rule.
- GA4 key events were configured for high-intent business actions: `generate_lead`, `quote_form_submit`, `quote_modal_submit`, `phone_click`, `sms_click`, `chat_open`, and existing CRM/GA4 events `purchase`, `qualify_lead`, `close_convert_lead`.
- GA4 Search Console integration was created and verified: Search Console property `asap.repair`, property type `Домен`, web stream `asap.repair`, stream ID `13645884964`, linked by `repairasap.bot@gmail.com` on 2026-07-02.
- Bing Webmaster Tools sitemap status was verified: `https://asap.repair/sitemap.xml` was submitted on 2026-05-30, last crawled on 2026-06-30, status `Success`, 97 URLs discovered. Bing also discovered `https://www.asap.repair/sitemap.xml` with status `Success`, 95 URLs discovered; this is duplicate discovery from the `www` surface and should be treated as noise while canonical/301 handling remains correct.
- IndexNow support was added with root key file `/e5308b759e880acb8173dd3d6d755ddc.txt` and submission helper `scripts/submit-indexnow.mjs`.
- Live IndexNow verification passed: `https://asap.repair/e5308b759e880acb8173dd3d6d755ddc.txt` returned `200` with the expected key. The first bulk IndexNow submission sent 97 canonical sitemap URLs and returned HTTP `202 Accepted`.
- Bing Site Explorer status was checked: 112 URLs known over the last 6 months, 109 indexed, 0 errors, 2 warnings, 1 excluded, 7 clicks, 115 impressions, 5 backlinks. The two warning URLs are old canonical-source paths (`/minor-home-repairs`, `/minor-tiling-backsplash`) that now live-redirect with 301 to `/services/general-repairs/`. The single excluded URL is the old HTTP version `http://asap.repair/about`, not the indexed HTTPS `/about/` page.
- Bing AI Performance beta currently reports 0 total citations, 0 average cited pages, and no grounding-query/page rows for the visible 3-month period.
- Clarity privacy hardening was added in source with explicit `data-clarity-mask="True"` on the inline quote form, quote modal surface, photo-drop forms, and chat window.
- Live production verification passed for Clarity masks on `https://asap.repair/`, `https://asap.repair/chat.js`, and `https://asap.repair/components/quote-modal.html` after deployment `9872369`.
- Clarity dashboard was verified for project `Repair ASAP` (`wyzjzrud6n`): last 3 days show 33 sessions, 29 unique users, 14 bot sessions excluded, 1.45 pages/session, 56.48% average scroll depth, 28s active time, 0 JavaScript errors, performance score 95/100 from the available page-view sample, and smart events including `phone_click`, `form_start`, `generate_lead`, `quote_modal_open`, and `quote_modal_submit`.
- Clarity dashboard masking mode is currently `Balanced`; source-level masks now cover quote/chat surfaces. Clarity AI Visibility beta was activated for `asap.repair`; initial 7-day dashboard shows 0 citations, no Share of Authority data, no grounding-query/page rows, and AI referral traffic `<1%`.
- Ahrefs Site Audit was checked for project `Asap` / `asap.repair/`: latest completed crawl is 2026-06-27 05:45 PM, Health Score `100%`, 193 internal URLs crawled, 0 internal URL errors, 16 warnings, 78 notices.
- Ahrefs `Indexable page not in sitemap` issue is stale for `https://asap.repair/case-studies/custom-wooden-flower-bed-built-in-bench/`; the URL is present in both local and live `sitemap.xml` and returns `200`.
- Ahrefs structured data issue root cause was identified: case-study `Article.spatialCoverage` was emitted as a string, while schema.org expects a `Place`. The case-study generator now emits `spatialCoverage` as `{"@type":"Place","name":"..."}` and `scripts/validate-structured-data.mjs` checks this regression.
- Ahrefs long meta-description warning was addressed in source: case-study pages now support short `metaDescription` values for HTML/OG snippets while preserving longer `Article.description`, and 10 borderline service meta descriptions were shortened.
- Ahrefs page/SERP title mismatch warning was addressed in source for case studies by shortening `seoTitle` values; local validation now has no indexable page titles over 65 characters.
- Ahrefs "only one dofollow incoming internal link" warning was addressed for case-study detail pages: the generator now adds cross-links to other completed projects, raising each case-study detail page to 4 local incoming internal links.
- Lighthouse baseline was run for 7 key URLs. SEO scored `100` on every tested desktop/mobile page. The lowest mobile performance pages were `/services/tv-wall-mounting/` and `/services/furniture-assembly/` at `72` with LCP around `6.2-6.3s`; hero image preload priority and lazy footer-logo loading improved them to `85` and `82` with LCP `3.6-4.0s` on retest.

Dashboard/API items completed:

- CRM paid-conversion pipeline was activated on 2026-07-02:
  - PR #448 (`Link QuickBooks payments to CRM invoices`) was merged into `bazas-crm` `main` at `bf6ad64e`.
  - `crm.asap.repair` production is Railway service `bazas-crm`, not the Vercel preview/production domain.
  - Railway production env now has `GA4_MEASUREMENT_ID=G-1ZRVGCMZ43` and `GA4_API_SECRET` from the GA4 Measurement Protocol API secret named `CRM paid invoice conversions`.
  - The new `MarketingConversionEvent` table/indexes were applied directly with targeted SQL via `prisma db execute --file` inside the Railway production service.
  - Railway deployment `2c7b2edf-02d0-4dab-9cda-edbcbf29743a` completed successfully on current `main` commit `35483ee6768bf8abe1f636b47ebdc6d4765cc43c`; that commit includes PR #448 plus later PR #449.
  - Live smoke passed: `/api/version` returned commit `35483ee6768bf8abe1f636b47ebdc6d4765cc43c`, `/login` returned `200`, `/` returned the expected auth redirect, and runtime logs showed Next.js ready without startup errors.

Important CRM DB note:

- Do not run plain `prisma migrate deploy` against production yet. `prisma migrate status` reports many historical migrations as not applied, which means production has likely been advanced with `db push`/manual schema changes instead of a fully baselined migration ledger. For future migrations, either baseline the existing production schema into `_prisma_migrations` first or apply narrow, reviewed, idempotent SQL for each additive change.

## GA4 key events

Configured Repair ASAP key events:

- `generate_lead` — normalized lead event fired after successful inline or modal quote submit.
- `quote_form_submit` — successful inline homepage/contact quote form submit.
- `quote_modal_submit` — successful quote modal submit.
- `phone_click` — click on `tel:` links.
- `sms_click` — click on `sms:` links.
- `chat_open` — opening the embedded chat widget.
- `purchase` — CRM paid invoice/payment event sent server-side through GA4 Measurement Protocol.
- `qualify_lead` and `close_convert_lead` — existing GA4 lead-stage key events already present in the property.

Tracked but intentionally not marked as key events:

- `form_start`, `cta_click`, `quote_modal_open`, `click`, `scroll`, `page_view`, `session_start`, `user_engagement`.

Privacy rule: do not send customer phone, email, address, message text, uploaded photo data, or CRM IDs to GA4/Clarity. Event parameters should stay limited to service/category/form type/page path.

Recommended GA4 funnel/exploration:

1. Build a funnel/exploration:
   - page_view → `cta_click` or `quote_modal_open` → `form_start` → `generate_lead`.
2. Add a revenue view once CRM paid invoice volume appears:
   - key event `purchase`;
   - source/medium and landing page dimensions;
   - value from Measurement Protocol `value`/`currency`.

## GA4 Search Console link

Configured link:

- Search Console property: `asap.repair`.
- Property type: domain property (`Домен`).
- GA4 web stream: `asap.repair`.
- GA4 stream ID: `13645884964`.
- Linked by: `repairasap.bot@gmail.com`.
- Link date shown in GA4: `2 июл. 2026 г.`.

Use this link to review organic Google search queries and landing pages inside GA4 alongside high-intent events and, once volume exists, the CRM `purchase` key event. Data may take time to appear after link creation.

## Microsoft Clarity onboarding

Clarity is useful for mobile funnel QA, heatmaps, and session recordings. It must be configured with strict masking because this site collects phone numbers, addresses, messages, and photos.

Recommended setup:

1. Create Clarity project:
   - Site name: `Repair ASAP`
   - Website URL: `https://asap.repair/`
   - Industry: Home services / local services.
2. Settings → Masking:
   - Use Strict masking.
   - Confirm form inputs, phone, email, address, and message areas are masked.
   - Do not enable any feature that records typed text in quote/chat forms.
3. Get project ID from the Clarity install snippet.
4. Add the Clarity snippet to the global `<head>` after GA4.
5. Keep CSP allowances for Clarity:
   - `script-src`: `https://www.clarity.ms`, `https://*.clarity.ms`
   - `connect-src`: `https://www.clarity.ms`, `https://*.clarity.ms`, `https://c.bing.com`
6. Live-verify after deployment:
   - Browser DevTools Network has requests to `www.clarity.ms/tag/<project-id>` plus Clarity collection hosts (`*.clarity.ms` / `c.bing.com`).
   - Clarity dashboard shows the site as receiving data.
   - Test a quote form session and confirm sensitive fields are masked in the recording.

The Clarity project ID currently installed in source is `wyzjzrud6n`. Keep dashboard masking at least `Balanced`, keep explicit source-level masks on quote/chat surfaces, and verify future recordings do not expose quote/chat form contents.

Dashboard status checked on 2026-07-02:

- Project: `Repair ASAP`.
- Project ID: `wyzjzrud6n`.
- Website URL: `https://asap.repair`.
- Industry: B2C services.
- Dashboard masking mode: `Balanced`.
- Last 3 days: 33 sessions, 29 unique users, 14 bot sessions excluded.
- Engagement: 1.45 pages/session, 56.48% average scroll depth, 28s average active time from 1.1 min total average session time.
- Friction: 0% rage clicks, 18.18% dead clicks (6 sessions), 0% excessive scrolling, 9.09% quick backs (3 sessions).
- Smart/API events visible: form submit/contact/outbound click, `phone_click`, `form_start`, `cta_click`, `generate_lead`, `quote_modal_open`, `quote_modal_submit`.
- Referrers include `www.google.com` and `gemini.google.com`.
- JavaScript errors: 0.
- Performance widget: 95/100 from the available sample; LCP 1.4s, INP 110ms, CLS 0.
- Clarity AI Visibility beta is active for `asap.repair`; initial 7-day citation dashboard shows 0 citations, no grounding-query/page data, and AI referral traffic `<1%`.

Source-level privacy hardening:

- `data-clarity-mask="True"` is applied to `#quoteForm`.
- `data-clarity-mask="True"` is applied to `#quoteModal`, covering modal fields and post-submit booking details.
- `data-clarity-mask="True"` is applied to generated photo-drop forms.
- `data-clarity-mask="True"` is applied to `#repair-asap-chat-window`, covering user/bot chat messages and the chat input surface.

## Bing Webmaster Tools

Current status:

- Property: `asap.repair/`.
- Search Performance homepage report currently shows `0` clicks and `0` impressions for the visible period.
- Site Explorer reports last-6-month totals: 112 URLs, 109 indexed, 0 errors, 2 warnings, 1 excluded, 7 clicks, 115 impressions, 5 backlinks.
- Root page detail: indexed, 5 clicks, 95 impressions, last crawled 2026-06-24, HTTP `200`, 3 backlinks.
- Bing AI Performance beta: 0 citations and no grounding-query/page rows for the visible 3-month period.
- Top recommendations visible in Bing:
  - Set up IndexNow.
  - Improve inbound links from high-quality domains.
- Canonical sitemap: `https://asap.repair/sitemap.xml`; status `Success`; 97 URLs discovered.
- Duplicate discovered sitemap: `https://www.asap.repair/sitemap.xml`; status `Success`; 95 URLs discovered.
- Warning details:
  - `/minor-home-repairs` and `/minor-tiling-backsplash` are old canonical-source warnings from older crawls; both now return live `301` redirects to `/services/general-repairs/`.
  - `http://asap.repair/about` is the only excluded/not-yet-crawled URL; treat this as stale HTTP-surface noise while HTTPS `/about/` remains indexed.

IndexNow setup:

- Key file: `https://asap.repair/e5308b759e880acb8173dd3d6d755ddc.txt`.
- First submission: 97 canonical sitemap URLs sent on 2026-07-02; IndexNow API returned `202 Accepted`.
- Submit sitemap URLs after the key file is live:

```bash
node scripts/submit-indexnow.mjs --dry-run
node scripts/submit-indexnow.mjs
```

Submit key URLs for manual indexing checks if Bing still shows low discovery:

- `/`
- `/services/`
- High-intent service pages such as TV mounting, furniture assembly, plumbing, electrical, appliance services, painting, flooring.

## Ahrefs Webmaster Tools

Current status:

- Project: `Asap`, verified for `asap.repair/`.
- Latest completed crawl: 2026-06-27 05:45 PM.
- Next scheduled crawl: 2026-07-04, 4-5 PM.
- Health Score: `100%`.
- Internal URLs crawled: 193.
- Internal URLs with errors: 0.
- Issues: 94 total, 0 errors, 16 warnings, 78 notices.
- HTTP status distribution: 2,862 success `2xx`, 2 redirect `3xx`.
- Image references without alt text: 0.
- Links to `4xx`: 0.
- Robots-blocked links: 0.

Issues checked on 2026-07-02:

- `Indexable page not in sitemap`: stale. The flagged custom planter bench case study exists in current live and local sitemap.
- `Structured data has schema.org validation error`: fixed in source. The affected case-study pages had string `Article.spatialCoverage`; the generator now emits a schema.org `Place` object.
- `Pages to submit to IndexNow`: likely stale after the first 97-URL IndexNow submission returned HTTP `202 Accepted`.

Remaining Ahrefs warnings/notices to work next:

- Long meta descriptions: fixed in source; wait for the next Ahrefs crawl to clear the warning.
- Page/SERP title mismatch: fixed in source for long case-study titles; wait for the next Ahrefs crawl to confirm.
- Case-study pages with only one dofollow incoming internal link: fixed in source; wait for the next Ahrefs crawl to confirm.
- Link-building notice: few high-quality referring domains.

## PageSpeed / Lighthouse automation

PageSpeed Insights API currently returns 429 on this environment, so the no-API fallback is local Lighthouse.

Baseline checked on 2026-07-02:

- Reports were generated locally under `reports/lighthouse/20260702-asap-audit/`; `reports/` is intentionally ignored by git.
- Tested URLs: `/`, `/services/`, `/services/tv-wall-mounting/`, `/services/furniture-assembly/`, `/services/plumbing/`, `/services/electrical/`, `/services/appliance-services/`.
- SEO score: `100` on every tested desktop/mobile URL.
- Desktop performance: `96-100`.
- Mobile performance before fix:
  - `/`: `98`, LCP `2.0s`.
  - `/services/`: `94`, LCP `2.6s`.
  - `/services/plumbing/`: `97`, LCP `2.4s`.
  - `/services/electrical/`: `91`, LCP `2.8s`.
  - `/services/appliance-services/`: `90`, LCP `2.9s`.
  - `/services/tv-wall-mounting/`: `72`, LCP `6.2s`.
  - `/services/furniture-assembly/`: `72`, LCP `6.3s`.
- Fix applied: `fetchpriority="high"` on the hero image preload for TV mounting and furniture assembly, plus lazy/async loading for the footer logo.
- Mobile retest after fix:
  - `/services/tv-wall-mounting/`: performance `85`, LCP `3.6s`.
  - `/services/furniture-assembly/`: performance `82`, LCP `4.0s`.
- Remaining performance limits: render-blocking `styles.css`/component loader on mobile and third-party analytics scripts. These should be handled carefully because GA4/Clarity are business-critical tracking surfaces.

Suggested URL baseline:

- `https://asap.repair/`
- `https://asap.repair/services/`
- `https://asap.repair/services/tv-wall-mounting/`
- `https://asap.repair/services/furniture-assembly/`
- `https://asap.repair/services/plumbing/`
- `https://asap.repair/services/electrical/`
- `https://asap.repair/services/appliance-services/`

Use `scripts/lighthouse-baseline.sh` on a machine with Lighthouse installed. Keep mobile as the primary score for this tenant site.

## Deployment boundaries

- Pull requests are safe for review.
- Do not add production Clarity/Bing verification IDs unless they come from the provider dashboards and Nikita approves the exact ID/source.
