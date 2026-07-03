# Repair ASAP analytics + organic tooling setup

Scope: `https://asap.repair/` static marketing site for the Repair ASAP tenant/customer. Do not mix these accounts or metrics with the Bazas platform property unless explicitly doing cross-site reporting.

## Current live baseline

- GA4 is installed on all generated HTML pages with measurement ID `G-1ZRVGCMZ43`.
- Public discovery files are live: `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`.
- Sitemap currently lists 96 unique HTML URLs.
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
- Successful quote/photo submissions now build one normalized lead-event parameter set. When the CRM response includes opaque ids, website analytics events include `crm_contact_id`, `crm_conversation_id`, `crm_appointment_id`, `crm_job_id`, `booking_status`, and `appointment_start` so lead events can be reconciled with CRM jobs and paid invoices without sending customer phone, email, address, message text, or photo data.
- `www.asap.repair` canonicalizes to `https://asap.repair/...`.
- Old Tadelakt/decorative plaster URLs 301 to `/services/painting/decorative-plaster-tadelakt/`; moved HTML fallbacks are `noindex, follow`.
- `/labs/*` redirects to `/services/` and is covered by `X-Robots-Tag: noindex, nofollow`.
- Service JSON-LD now uses explicit area coverage for NYC boroughs plus Western Long Island/Nassau County where scope and travel fit.
- 77 live service pages now include visible service-area and quote-prep copy; the two remaining service HTML files are noindex/meta-refresh moved Tadelakt fallbacks.
- `/services/` has a top-level Service JSON-LD block with `hasOfferCatalog`.
- `facts.json`, `llms.txt`, and `llms-full.txt` include Nassau County scope and quote-prep details by service category.
- Cloudflare Redirect Rules are active for legacy/canonical host cleanup:
  - `Redirect api.asap.repair to canonical site` matches `http.host eq "api.asap.repair"` and returns a 301 redirect to `concat("https://asap.repair", http.request.uri.path)` while preserving the query string.
  - `Redirect www.asap.repair to canonical site` matches `http.host eq "www.asap.repair"` and returns a 301 redirect to `concat("https://asap.repair", http.request.uri.path)` while preserving the query string.
- Pages middleware mirrors canonical behavior for `www.asap.repair` and the old Netlify host, including direct trailing-slash normalization for extensionless URLs. Source commit `4494cb0` also lets `api.asap.repair/api/*` reach Pages Functions, but the live Cloudflare zone-level redirect rule still intercepts `api.asap.repair` before Pages. To make `api.asap.repair/api/*` work as an API host, update that Cloudflare Redirect Rule to exclude `/api/*`.

Validation performed:

- `facts.json` parsed successfully.
- 266 JSON-LD blocks across the site parsed successfully.
- `node scripts/validate-structured-data.mjs` passed: 266 JSON-LD blocks parsed and 10 `Article` blocks checked for `spatialCoverage` as a schema.org `Place`.
- Indexable HTML meta descriptions were checked locally; no indexable page has a meta description over 155 characters.
- Indexable HTML titles were checked locally; no indexable page has a `<title>` over 65 characters.
- Case-study internal links were checked locally; each case-study detail page now has 4 incoming internal links.
- `node --check` passed for `main.js`, `chat.js`, `components/loader.js`, and `components/quote-modal.js`.
- Sitemap verified live and local at 96 HTML URLs / 96 unique URLs after removing `facts.json` from XML discovery.
- `wrangler pages dev` parsed 70 redirect rules and 13 header rules; only ordering performance warnings were reported.
- Cloudflare Pages production deployment for commit `5a7b649` completed successfully.
- Live `asap.repair` verified for `/services/`, `/services/appliance-services/dishwasher-installation/`, `/services/painting/decorative-plaster-tadelakt/`, `/facts.json`, and `/llms.txt`.
- Live `api.asap.repair` verified: `/` redirects to `https://asap.repair/`, `/services/plumbing/` redirects to `https://asap.repair/services/plumbing/`, query strings are preserved, and following the redirect returns `200`.
- Live `www.asap.repair` verified after the Cloudflare redirect rule was added: `http://www.asap.repair/?x=3`, `http://www.asap.repair/services/plumbing/?x=3`, and `https://www.asap.repair/services/plumbing/?x=3` each resolve to canonical `https://asap.repair/...` with one redirect and preserved query string.
- `crm.asap.repair` was checked after the redirect rule and remains on the CRM/Railway login flow; it is not affected by the `api.asap.repair` host-only rule.
- GA4 key events were configured for high-intent business actions: `generate_lead`, `quote_form_submit`, `quote_modal_submit`, `phone_click`, `sms_click`, `chat_open`, and existing CRM/GA4 events `purchase`, `qualify_lead`, `close_convert_lead`.
- Live analytics instrumentation was verified with a browser probe: `dataLayer`, `gtag`, and `clarity` are present; `phone_click`, `cta_click`, `quote_modal_open`, and `chat_open` events appeared in `dataLayer` without console errors.
- Runtime JS references use a single asset version for `/components/loader.js`, `/main.js`, dynamically loaded quote-modal/module scripts, chat, and related-content. This avoids stale Cloudflare/browser cache serving mixed analytics builds after deploy. Production deployment `638eda1` was previously verified live with asset version `20260702e`: HTML references matched the source version, the live loader hash matched source, and browser network smoke loaded `/components/header`, `/components/footer`, and `/components/quote-modal` directly as `200` responses with no `.html` redirect waterfall. The loader keeps a `.html` fallback for local static-server smoke tests. The current source version is `20260703b`.
- Mobile sticky CTA was moved from homepage-only markup into the shared footer component. `main.js` now binds the footer-intersection behavior after `components-loaded`, while click tracking remains delegated for `phone_click`, `sms_click`, and quote-modal CTA clicks. Local mobile browser smoke at 390x844 confirmed one sticky CTA on `/` and `/services/electrical/outlet-installation/`, `tel:+17753107770`, `sms:+17753107770`, quote modal open from `Free Quote`, asset version `20260703a`, and no console errors.
- Cloudflare Pages production deployment `2abfbb54` from source `4a382dc` activated the global mobile sticky CTA. Custom-domain checks confirmed `/` and `/services/electrical/outlet-installation/` reference `/components/loader.js?v=20260703a` and `/main.js?v=20260703a`; `/components/footer` contains `mobileStickyCtaBar`; `/main.js?v=20260703a` contains `bindMobileStickyCta`; live mobile browser smoke at 390x844 confirmed one visible sticky CTA on both checked pages with no browser console errors. The updated 96-URL sitemap set was submitted to IndexNow and returned HTTP `200 OK`.
- Chat widget visit cleanup was hardened in source version `20260703b`: the widget no longer logs a startup `console.log`, validates a stored `repair_asap_thread_id` through the visit endpoint before reusing it for a sent message, and silently removes the stored thread if `/api/widget/visit` returns `404 Thread not found`. This prevents one stale browser thread ID from generating a repeated `Visit notification failed` warning and CRM 404 noise on every new session; non-404 visit failures still warn without blocking chat.
- Cloudflare Pages production deployment `cc304d25` from source `742cc8b` activated chat visit cleanup. Custom-domain checks confirmed `/` references `/components/loader.js?v=20260703b` and `/main.js?v=20260703b`; `/components/loader.js?v=20260703b` sets `ASSET_VERSION = '20260703b'`; `/chat.js?v=20260703b` has no `Chat Widget v5` startup log and contains `threadValidationPromise` plus `404` stale-thread cleanup. A local VM smoke confirmed a stale `repair_asap_thread_id` is removed after a `404` visit response without emitting a `Visit notification failed` warning. The updated 96-URL sitemap set was submitted to IndexNow and returned HTTP `200 OK`.
- Appliance/gas service copy was hardened in deployment `943c971`: `/services/appliance-services/`, `/services/appliance-services/dryer-installation/`, and `/services/appliance-services/range-installation/` keep the money keywords for gas dryer/range demand, but now qualify gas work with code-ready setup, Licensed Master Plumber/DOB scope checks, and pre-scheduling photo/model/building screening. This aligns with NYC guidance that a Licensed Master Plumber must handle gas appliance or gas piping permit scope (`https://portal.311.nyc.gov/article/?kanumber=KA-02106`) and that plumbing/gas piping work is limited to licensed plumbers (`https://www.nyc.gov/site/buildings/property-or-business-owner/plumbing-permits-applications.page`). Live custom-domain verification confirmed the updated snippets after Pages alias propagation.
- Plumbing/electrical compliance and AI-visibility copy was hardened in source after reviewing NYC DOB guidance. NYC DOB says most electrical wire-handling work requires an electrical permit and DOB-licensed electrical contractor (`https://www.nyc.gov/site/buildings/property-or-business-owner/electrical-permit.page`), and DOB owner guidance says electrical installation/modification generally requires a permit and Licensed Master Electrician (`https://www.nyc.gov/site/buildings/property-or-business-owner/project-requirements-owner-electrical.page`). DOB plumbing guidance says permits are issued only to Licensed Master Plumbers/LFSCs for piping-system work, while simple repairs or replacing existing faucets/toilets/sinks can be cosmetic/no-permit scope (`https://www.nyc.gov/site/buildings/property-or-business-owner/plumbing-permits-applications.page`). Source now keeps the money keywords for outlets, switches, light fixtures, fans, plumbing fixtures, and gas-appliance demand, but visible HTML, JSON-LD FAQ, `facts.json`, `llms.txt`, `llms-full.txt`, gallery JSON, and the stray live gas gallery caption now route regulated work through photo-based scope review rather than unconditional licensed electrician/plumber/gas-connection claims. Local validation passed: public JSON parsed, structured-data validator passed, review-schema validator passed, `git diff --check` passed, and local smoke checks on electrical/plumbing/AI URLs returned `200`.
- Cloudflare Pages production deployment `31f972f` completed and was verified on the custom domain. Live `curl` checks confirmed the new electrical/plumbing/gas-scope language on `/services/electrical/outlet-installation/`, `/services/electrical/light-fixture-installation/`, `/services/plumbing/`, `/services/ac-installation-cleaning/through-wall-ac-installation/`, `/facts.json`, and `/llms.txt`; the old unconditional claims such as "run new wiring and install outlets in any location", "fully licensed and carry all required permits", and "connects gas appliances" no longer appeared on those checked live pages.
- Follow-up compliance and AI-visibility cleanup was deployed in `54f037f`: PTAC, through-wall AC, dishwasher, dryer, range, appliance hub, electrical hub, general-repair/drywall gallery captions, and gallery JSON metadata were tightened from broad "electrical hookup", "run new water supply", "dedicated outlet", "electrician", and "professional electrical work" claims to existing-hookup compatibility checks, photo-based scope review, and Licensed Master Electrician/Plumber/DOB escalation where appropriate. Local validation passed, Cloudflare Pages production activated `54f037f`, live custom-domain checks confirmed the new snippets on the changed pages after propagation, and the updated 96-URL sitemap set was submitted to IndexNow with HTTP `200 OK`.
- GA4 Search Console integration was created and verified: Search Console property `asap.repair`, property type `Домен`, web stream `asap.repair`, stream ID `13645884964`, linked by `repairasap.bot@gmail.com` on 2026-07-02.
- Bing Webmaster Tools sitemap status was verified: `https://asap.repair/sitemap.xml` was submitted on 2026-05-30, last crawled on 2026-06-30, status `Success`, 97 URLs discovered. Bing also discovered `https://www.asap.repair/sitemap.xml` with status `Success`, 95 URLs discovered; this is duplicate discovery from the `www` surface and should be treated as noise while canonical/301 handling remains correct.
- IndexNow support was added with root key file `/e5308b759e880acb8173dd3d6d755ddc.txt` and submission helper `scripts/submit-indexnow.mjs`.
- Live IndexNow verification passed: `https://asap.repair/e5308b759e880acb8173dd3d6d755ddc.txt` returned `200` with the expected key. The first bulk IndexNow submission sent 97 canonical sitemap URLs and returned HTTP `202 Accepted`.
- Bing Site Explorer status was checked: 112 URLs known over the last 6 months, 109 indexed, 0 errors, 2 warnings, 1 excluded, 7 clicks, 115 impressions, 5 backlinks. The two warning URLs are old canonical-source paths (`/minor-home-repairs`, `/minor-tiling-backsplash`) that now live-redirect with 301 to `/services/general-repairs/`. The single excluded URL is the old HTTP version `http://asap.repair/about`, not the indexed HTTPS `/about/` page.
- Bing AI Performance beta currently reports 0 total citations, 0 average cited pages, and no grounding-query/page rows for the visible 3-month period.
- Clarity privacy hardening was added in source with explicit `data-clarity-mask="True"` on the inline quote form, quote modal surface, photo-drop forms, and chat window.
- Live production verification passed for Clarity masks on `https://asap.repair/`, `https://asap.repair/chat.js`, and `https://asap.repair/components/quote-modal.html` after deployment `9872369`.
- Technical component/helper surfaces such as `/components/*` and `/assets/rooms/_*` are intentionally excluded from organic indexing via `X-Robots-Tag: noindex, nofollow`; they should not be treated as missing standalone analytics surfaces.
- Clarity dashboard was verified for project `Repair ASAP` (`wyzjzrud6n`): last 3 days show 33 sessions, 29 unique users, 14 bot sessions excluded, 1.45 pages/session, 56.48% average scroll depth, 28s active time, 0 JavaScript errors, performance score 95/100 from the available page-view sample, and smart events including `phone_click`, `form_start`, `generate_lead`, `quote_modal_open`, and `quote_modal_submit`.
- Clarity dashboard masking mode is currently `Balanced`; source-level masks now cover quote/chat surfaces. Clarity AI Visibility beta was activated for `asap.repair`; initial 7-day dashboard shows 0 citations, no Share of Authority data, no grounding-query/page rows, and AI referral traffic `<1%`.
- Ahrefs Site Audit was checked for project `Asap` / `asap.repair/`: latest completed crawl is 2026-07-02 03:24 AM, Health Score `100%`, 1,443 internal URLs crawled, 0 internal URL errors, 3 warnings, 122 notices.
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

CRM attribution rollout completed:

- PR #456 (`Fix website quote booking attribution`) was merged into `bazas-crm` `main` on 2026-07-03 at merge commit `7f22479e96bb917d604baf60782eda36e229e11d`.
- Pre-merge validation passed in a clean worktree: `npx tsx --test tests/unit/quickbooks-payment-invoice-link.test.ts tests/unit/marketing-conversion-pipeline.test.ts tests/unit/widget-session-context-attribution.test.ts` (9/9) and `npx tsc --noEmit`.
- Production `crm.asap.repair/api/version` now reports `service=bazas-crm`, `branch=main`, `environment=production`, commit `7f22479e96bb917d604baf60782eda36e229e11d`.
- Business result: website quote submissions can carry attribution context, calculator custom fields, photo attachments, booking/job identifiers, and opaque CRM IDs; manual QuickBooks payments and cron-synced QuickBooks payments can now reconcile back to website leads for GA4 paid-conversion measurement.

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

- `form_start`, `cta_click`, `quote_modal_open`, `calculator_result`, `calculator_quote_click`, `click`, `scroll`, `page_view`, `session_start`, `user_engagement`.

Calculator event meanings:

- `calculator_result` — a visitor changed a calculator option and saw a priced estimate range.
- `calculator_quote_click` — a visitor clicked the calculator CTA to continue into the quote modal.

Privacy rule: do not send customer phone, email, address, message text, uploaded photo data, or other human-readable PII to GA4/Clarity. Opaque CRM ids returned by the CRM quote endpoint may be sent only for source-of-truth reconciliation of lead and paid-invoice events; do not replace them with customer-visible identifiers.

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
- Post-deploy submission after support-page SEO fixes: 97 canonical sitemap URLs sent on 2026-07-02; IndexNow API returned `200 OK`.
- Post-deploy submission after support-page internal-link strengthening: 97 canonical sitemap URLs sent on 2026-07-02; IndexNow API returned `200 OK`.
- Post-deploy submission after priority service-page detail expansion: 97 canonical sitemap URLs sent on 2026-07-02; IndexNow API returned `200 OK`.
- Post-deploy submission after removing `facts.json` from the XML sitemap and after plumbing/electrical/gas scope hardening: 96 canonical HTML URLs sent on 2026-07-02; IndexNow API returned `200 OK`.
- Post-deploy submission after appliance/PTAC/dishwasher/electrical metadata compliance cleanup: 96 canonical HTML URLs sent on 2026-07-02; IndexNow API returned `200 OK`.
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
- Latest completed crawl: 2026-07-02 04:41 AM.
- Next scheduled crawl: 2026-07-04, 4-5 PM.
- Health Score: `100%`.
- Internal URLs crawled: 1,442.
- Internal URLs with errors: 0.
- Issues distribution: 0 errors, 3 warnings, 24 notices.
- Crawled URL distribution: 1,440 crawled URLs in the overview chart, including 99 internal HTML URLs and 1,341 resources; redirect notices remain only for canonical host/protocol variants.
- Image references without alt text: 0.
- Links to `4xx`: 0.
- Robots-blocked links: 0.

Issues checked on 2026-07-02:

- `Indexable page not in sitemap`: stale. The flagged custom planter bench case study exists in current live and local sitemap.
- `Structured data has schema.org validation error`: fixed in source. The affected case-study pages had string `Article.spatialCoverage`; the generator now emits a schema.org `Place` object.
- `Pages to submit to IndexNow`: likely stale after the first 97-URL IndexNow submission returned HTTP `202 Accepted`.

Follow-up crawl check on 2026-07-02:

- Ahrefs crawl started at 01:38 AM and was still `Now Crawling` when checked; intermediate data is not a final audit result.
- Bing Site Scan still showed `Queued 56 minutes ago` after a page refresh; no pages/errors/warnings were available yet.
- Ahrefs intermediate `Title too long` and `Meta description too long` rows were stale against the live site. Live `curl` confirmed the case-study index and flagged case-study detail pages now serve short titles and meta descriptions.
- `Open Graph tags incomplete` affected `/privacy-policy/` and `/terms-of-service/`; both pages now include `og:image`, `og:image:alt`, `og:image:width`, `og:image:height`, and `twitter:image`.
- `Structured data has Google rich results validation error` affected `/reviews/`; the reviews page `LocalBusiness` JSON-LD now uses a crawlable PNG image and includes address, price range, area served, and sameAs profiles.
- `Page has only one dofollow incoming internal link` affected support pages and some case studies. Support pages now include static `.site-links` cross-links in source HTML so crawlers do not rely only on JS-loaded header/footer links. `/about/` was strengthened with static links from FAQ, reviews, privacy policy, and terms pages; local link-graph validation shows 6 incoming links. Case-study detail pages already expose static related-project links; wait for the completed crawl to confirm.
- Local validation after the fixes: 101 HTML files checked, no indexable title longer than 65 characters, no indexable meta description longer than 155 characters, structured-data validator passed, review-schema validator passed.
- AI visibility update: `facts.json`, `llms.txt`, and `llms-full.txt` now expose exact high-intent service URLs for appliance installation, plumbing fixtures, electrical fixtures, AC work, mounting, furniture assembly, painting/wall finishes, and general repairs. Local validation confirmed all 39 `facts.json` priority service URLs exist and are present in the sitemap.
- Priority service-page detail pass: 22 high-intent pages from `facts.json` were expanded with visible scope/checklist/quote-prep copy. Local validation shows 0 priority service pages below 500 visible words, structured-data validator passed, review-schema validator passed, and 117 indexable HTML files have no title over 65 characters or meta description over 155 characters. Live production was spot-checked on dishwasher installation, garbage disposal installation, USB outlet installation, and trim painting.
- Full service-page detail pass: the remaining 15 shorter service pages were expanded with visible scope, prep, limitation, and quote-context copy. Local validation now shows 0 service pages below 500 visible words. Production was spot-checked on peel-stick floor installation, window repair, and wallpaper removal after the `7e94ab0` deployment, and the sitemap URL set was submitted to IndexNow again with HTTP `200 OK` for 97 URLs.
- Ahrefs follow-up crawl started at 02:33 AM on 2026-07-02 and was still running when checked at 02:51 AM: 468 URLs crawled, 969 scheduled, 96 billed pages. Do not treat intermediate Ahrefs issue counts as final until this crawl completes.
- Bing Site Scan `ASAP full site scan 2026-07-02` was still `Queued` when checked at 02:48 AM / 89 minutes after creation; pages/errors/warnings were still unavailable.
- Ahrefs follow-up crawl completed at 03:24 AM on 2026-07-02: Health Score `100%`, 1,443 internal URLs crawled, 1,440 `2xx`, 3 `3xx`, 0 errors, 3 warnings, 122 notices, 0 links to `4xx`, 0 robots-blocked links, 0 image references without alt text. Remaining actual issue types were redirect-surface warnings/notices (`3XX redirect`, `HTTP to HTTPS redirect`, `Redirect chain`) plus expected content-change notices from the title/meta/body updates. The remaining `Redirect chain` was `http://www.asap.repair/ -> https://www.asap.repair/ -> https://asap.repair/`.
- Cloudflare Redirect Rule `Redirect www.asap.repair to canonical site` was added after the Ahrefs crawl. Live verification now shows `http://www.asap.repair/`, `http://www.asap.repair/services/plumbing/`, `https://www.asap.repair/services/plumbing/`, and `http://api.asap.repair/services/plumbing/` resolving to canonical `https://asap.repair/...` with one redirect and preserved query strings. Wait for the next Ahrefs crawl to confirm the `Redirect chain` warning clears.
- The 96-URL canonical sitemap set was submitted to IndexNow again after the Ahrefs follow-up crawl; IndexNow returned HTTP `200 OK`.
- Bing Site Scan `ASAP full site scan 2026-07-02` was still `Queued` when checked at 03:31 AM / about 2 hours after creation; pages/errors/warnings were still unavailable.
- Live sitemap audit on 2026-07-02 found all 97 previously submitted URLs returning `200`; the only non-HTML URL was `facts.json`, which created expected missing title/H1/canonical/schema noise in SEO-style checks. `facts.json` was removed from XML sitemap discovery and remains public through `llms.txt` / `llms-full.txt`; live sitemap now has 96 HTML URLs, all returning `200`, and the updated 96-URL set was submitted to IndexNow with HTTP `200 OK`.
- Canonical redirect matrix on 2026-07-02: `www.asap.repair` redirects correctly to canonical `asap.repair`; `api.asap.repair` is a Cloudflare zone-level redirect-only legacy host and is not the live API; `asap-repair.netlify.app` now returns Netlify `404` for `/`, `/sitemap.xml`, and service paths. Netlify redirect/consolidation would require Netlify dashboard access because this host is outside the current Cloudflare Pages repo.
- `api.asap.repair` follow-up on 2026-07-03: Pages production deployed source `4494cb0`, which allows `api.asap.repair/api/*` to fall through to Pages Functions at the middleware layer. Live `OPTIONS https://api.asap.repair/api/webhooks/thumbtack` still returns a zone-level `301` to `https://asap.repair/api/webhooks/thumbtack`, confirming the Cloudflare Redirect Rule is still above Pages. This is not the current live backend; `crm.asap.repair` remains the CRM/API backend, and `https://asap.repair/api/webhooks/thumbtack` remains the active edge forwarder URL.
- Ahrefs manual crawl was started from the dashboard after the redirect fix. It was still `Now Crawling` when checked later on 2026-07-02, with `1,263 scheduled` visible in Crawl log. Because the crawl started before the plumbing/electrical compliance-copy deploy, do not treat it as final evidence for the new copy. Bing Site Scan remained `Queued` at the latest check; no pages/errors/warnings were available yet.
- After deployment `31f972f`, Ahrefs Crawl log still showed `Crawling`, `Stop crawl`, and `1,263 scheduled`. The intermediate crawl log already showed key service URLs returning `200` with response times mostly around 100-250 ms and expected canonical redirects for `http://www`, `https://www`, and `http://asap.repair`; wait for crawl completion before treating issue counts as final. Bing Site Scan `ASAP full site scan 2026-07-02` was still `Queued` at the latest dashboard check.
- Ahrefs manual crawl started at 03:51 AM on 2026-07-02 and completed at 04:41 AM with Health Score `100%`, 1,442 internal URLs, 0 errors, 3 warnings, and 24 notices. No new issues were reported versus the previous crawl.
- Remaining Ahrefs rows after the 04:41 AM crawl: `3XX redirect` has 3 canonical root/protocol variants (`http://www.asap.repair/`, `https://www.asap.repair/`, `http://asap.repair/`) with no redirect loops and no redirect inlinks; `HTTP to HTTPS redirect` has 2 HTTP root variants; `Page and SERP titles do not match` has 16 rows that are mostly Google/Ahrefs title rewrites removing the brand suffix or adding a service category; `Pages to submit to IndexNow` has 3 changed appliance URLs already covered by the post-deploy 96-URL IndexNow submission; `Meta description changed` has 3 expected content-change rows.
- Bing Site Scan `ASAP full site scan 2026-07-02` was still `Queued` when checked on 2026-07-03 after about 22 hours, with no pages/errors/warnings available. Treat this as a Bing dashboard blocker rather than a site finding until the scan produces results.
- Compliance/AI-copy cleanup after the Ahrefs title-mismatch review: microwave, outlet, switch, light-fixture, ceiling-fan, window-AC, projector-screen, and gallery JSON copy were tightened so the site keeps high-intent service keywords while avoiding direct promises around dedicated outlets, wiring, panel/meter/circuit work, fan-rated box upgrades, and recessed-lighting layouts. The copy now routes regulated or uncertain work through photo-based scope review and Licensed Master Electrician/DOB escalation language where needed. Local validation passed: `facts.json`, `web_gallery.json`, and `website_picks_final.json` parsed; structured-data validator passed; review-schema validator passed; 128 HTML files had no indexable title over 65 characters or meta description over 155 characters; `git diff --check` passed. Cloudflare Pages production deployed commit `24b6abe`; live custom-domain checks confirmed the updated outlet, microwave, light-fixture, ceiling-fan, window-AC, and gallery JSON snippets; the 96-URL sitemap set was submitted to IndexNow again with HTTP `200 OK`.
- Ahrefs title/SERP opportunity pass: 16 rows were reviewed as an opportunity list, not a source-code error. Titles and Open Graph titles were tightened on flooring, appliance services, general repairs, cabinet hardware, faucet, sink, toilet, outlet, switch, ceiling fan, TV mounting, mirror mounting, shelf mounting, caulking, and bed assembly pages so the SERP-facing title better reflects the commercial service/category instead of relying on a brand suffix that Google was already removing. Local validation passed: 103 public canonical HTML pages had no title over 65 characters, no meta description over 155 characters, and no duplicate indexable titles; structured-data and review-schema validators passed. Cloudflare Pages production deployed commit `d7e6eeb`; live custom-domain title checks confirmed the updated flooring, outlet, TV mounting, and appliance hub titles; the 96-URL sitemap set was submitted to IndexNow again with HTTP `200 OK`.
- AC money/AI visibility pass on 2026-07-03: the AC Installation & Cleaning hub plus portable AC, AC bracket, AC removal, AC deep cleaning, through-wall AC, and window AC pages were tightened for high-intent NYC summer queries and AI answerability. The pages now expose clearer quote-prep, DOB-guideline-aware bracket language, DSNY CFC/Freon disposal guidance, R32/R600a disposal caveats, portable AC venting limitations, and cleaning-scope limits without overclaiming `Local Law 11`, universal bracket requirements, dryer-vent routing, refrigerant recovery, mold-free certification, mini-split installation, or commercial HVAC service. Local validation passed: structured-data validator, review-schema validator, `git diff --check`, all 77 indexable service pages with valid title/meta lengths and no duplicate titles, plus in-app browser smoke across the 7 changed AC URLs with no console errors and no risky AC phrases. Cloudflare Pages production deployed commit `e25c958` as deployment `bed13f98`; live custom-domain checks confirmed the new AC copy on all 7 URLs and no old risky phrases. The 96-URL sitemap set was submitted to IndexNow again with HTTP `200 OK`.
- Flooring project-value/AI visibility pass on 2026-07-03: the flooring hub plus vinyl, laminate, peel-and-stick, click-lock, subfloor preparation, baseboard, and floor repair pages were tightened for high-intent NYC flooring queries and AI answerability. The pages now expose quote-prep, product/material details, subfloor/flatness/moisture limits, apartment/co-op/condo access considerations, case-study links, and safer peel-and-stick/rental expectations without overclaiming easy removal, universal same-day service, 30-minute quotes, 100% waterproof results, or flat-rate pricing before scope review. Shared quote-modal and photo-drop copy was also changed from hard 30-minute/flat-rate promises to scope-review/business-hours language. Cache-busting was bumped to `20260703c`, and `components/loader.js` now requests versioned component `.html` files directly instead of extensionless paths that create a local 404 fallback. Local validation passed: structured-data validator, review-schema validator, `git diff --check`, all 79 service pages with valid title/meta lengths and no duplicate titles, and in-app browser smoke across the 8 flooring URLs with no console errors, updated modal copy, and no risky flooring phrases. Cloudflare Pages production deployed commit `12b6232` as deployment `b29f9ce6`; live custom-domain checks confirmed the updated flooring copy, shared component copy, `20260703c` assets, and no old risky phrases. The 96-URL sitemap set was submitted to IndexNow again with HTTP `200 OK`.
- Painting project-value/AI visibility pass on 2026-07-03: the painting hub plus interior painting, accent wall painting, cabinet painting, trim/baseboard painting, wallpaper installation, wallpaper removal, checkerboard floor painting, and decorative plaster/Tadelakt-style pages were tightened for high-intent NYC painting and wall-finish queries. The pages now expose quote-prep, surface/substrate/prep limits, paint/material/product details, apartment/building access considerations, case-study links, and safer scope-based pricing language without overclaiming same-day service, 30-minute quotes, flat-rate pricing before review, flawless/perfect finish outcomes, or universal durability. H1 markup was also adjusted so crawlers and assistive tech read split headings with spaces instead of concatenated words. Local validation passed: structured-data validator, review-schema validator, `git diff --check`, all 79 service pages with valid title/meta lengths and no duplicate titles, risk-phrase grep over `services/painting`, and in-app browser smoke across the 9 painting URLs with no console errors, readable H1 text, updated modal copy, and no risky painting phrases. Cloudflare Pages production deployed commit `77b8a8d` as deployment `1f5e8c36`; live custom-domain checks confirmed the updated painting copy on all 9 URLs and no old risky phrases. The 96-URL sitemap set was submitted to IndexNow again with HTTP `200 OK`.
- General repairs project-value/AI visibility pass on 2026-07-03: the handyman/general repairs hub plus drywall repair, door repair, door installation, lock installation, window repair, caulking, blind installation, cabinet hardware installation, and gazebo assembly pages were tightened for high-intent NYC handyman queries and AI answerability. The pages now expose quote-prep, measurements/product-link/building-access requirements, scope limits for glass, electrical/hardwired blinds, hidden moisture/frame issues, gazebo anchoring/site fit, and 2 case-study links per indexable page. Old hard promises around same-day/next-day service, 30-minute quotes, flat-rate pricing before review, no-hidden-fee language, and universal gazebo anchoring were replaced with scope-based estimates and confirmed service-window language. Local validation passed: structured-data validator, review-schema validator, `git diff --check`, all 79 service pages with valid title/meta lengths and no duplicate titles, risk-phrase grep over `services/general-repairs`, and in-app browser smoke across the 10 general-repairs URLs with no console errors, readable H1 text, updated modal copy, and no risky general-repair phrases. Cloudflare Pages production deployed commit `96cbc16` as deployment `7f00c49a`; live custom-domain checks confirmed the updated general-repairs copy on all 10 URLs and no old risky phrases. The 96-URL sitemap set was submitted to IndexNow again with HTTP `200 OK`.
- TV/wall mounting project-value/AI visibility pass on 2026-07-03: the TV & Wall Mounting hub plus TV mounting, shelf installation, mirror installation, art installation, curtain rod installation, projector installation, projector screen installation, and wall cabinet installation pages were tightened for high-intent NYC mounting queries and AI answerability. The pages now expose quote-prep, wall material/stud/anchor/load requirements, cable-path and electrical boundaries, fireplace/tile/masonry/ceiling limits, projector throw-distance context, cabinet load/stud-layout requirements, and 2 case-study links per page. Old hard promises around any wall/any size service, same-day/next-day availability, 30-minute quotes, flat-rate/no-surprise pricing before review, universal cable concealment, power routing, and perfect alignment were replaced with scope-based estimates and confirmed review language. Local validation passed: structured-data validator, review-schema validator, `git diff --check`, all 79 service pages with valid title/meta lengths and no duplicate titles, risk-phrase grep over `services/tv-wall-mounting`, in-app browser smoke across the 9 URLs, and desktop/mobile layout checks with no horizontal or hero overflow. Cloudflare Pages production deployed commit `0ad9a33` as deployment `16e0a933`; live deployment and custom-domain checks confirmed the updated mounting copy on all 9 URLs, no old risky phrases, and clean live browser smoke. The 96-URL sitemap set was submitted to IndexNow again with HTTP `200 OK`.
- Furniture assembly project-value/AI visibility pass on 2026-07-03: the furniture assembly hub plus IKEA assembly, bed assembly, desk assembly, dresser assembly, wardrobe/closet assembly, and Murphy/wall bed assembly pages were tightened for high-intent NYC assembly queries and AI answerability. The pages now expose product-link/model/box-count/room-access quote prep, PAX width/height/door/ceiling-clearance details, standing desk motor/control-box/cable-tray details, dresser anti-tip/wall-material review, and Murphy bed wall/stud/hardware/clearance limits, with 2 static case-study links per page. Old hard promises around any brand/any complexity/any size service, same-day/next-day availability, 30-minute quotes, flat-rate/no-hidden-fee pricing before review, included/free packaging removal, universal wall anchoring, safe Murphy bed operation, and flawless outcomes were replaced with scope-based estimates and confirmed review language. `facts.json`, `llms.txt`, and `llms-full.txt` were updated with furniture-specific quote-prep instructions, and shared header/checklist/comparison copy was tightened so rendered DOM no longer reintroduces the old claims. Cache-busting was bumped to `20260703d`. Local validation passed: `facts.json` parse, structured-data validator, review-schema validator, `git diff --check`, JS syntax checks for loader/checklist/comparison/main/chat/quote-modal, all 79 service pages with valid title/meta lengths and no duplicate titles, risk-phrase grep over furniture/AI/component surfaces, in-app browser smoke across the 7 URLs, and desktop/mobile layout checks with no visible overflow. Cloudflare Pages production deployed commit `55d99f9` as deployment `fd82a6cb`; live custom-domain curl and browser checks confirmed the updated furniture copy on all 7 URLs, `20260703d` assets, no old risky phrases, clean console, and case/CTA/tel/FAQ coverage. The 96-URL sitemap set was submitted to IndexNow again with HTTP `200 OK`.
- Plumbing fixture project-value/AI visibility pass on 2026-07-03: the plumbing hub plus faucet installation, sink installation, toilet installation, garbage disposal installation, shut-off valve installation, leak repair, and bathroom fixture installation pages were tightened for high-intent NYC fixture-level plumbing queries and AI answerability. The pages now expose model/photo/shut-off/under-sink/building-access quote prep, fixture-level scope limits, water shutoff and building-super coordination, drain/dishwasher/switched-power review for disposals, flange/floor/haul-away review for toilets, countertop/drain-alignment review for sinks, active visible leak triage, and 2 case-study links per page. Old hard promises around same-day/next-day availability, emergency plumbing, flat-rate/no-surprise pricing before review, all-brand/all-style coverage, main/riser valve handling, old fixture disposal, and unconditional electrical/plumbing connection work were replaced with scope-based review language and Licensed Master Plumber escalation where appropriate. `facts.json`, `llms.txt`, and `llms-full.txt` were updated with plumbing-specific high-intent pages and quote-prep instructions, `chat.js` status copy was softened from `Online 24/7` to `Online now`, and cache-busting was bumped to `20260703e`. Local validation passed: `facts.json` parse, structured-data validator, review-schema validator, `git diff --check`, JS syntax checks for loader/chat/main/quote-modal/checklist/comparison, all 79 service pages with valid title/meta lengths and no duplicate titles, risk-phrase grep over plumbing/AI/chat surfaces, in-app browser smoke across the 8 plumbing URLs, and desktop/mobile layout checks with no visible text or horizontal overflow. Cloudflare Pages production deployed commit `49dd7d5` as deployment `d69f76ce`; live custom-domain curl and browser checks confirmed the updated plumbing copy on all 8 URLs, `20260703e` assets, no old risky phrases, clean console, safe chat status, and case/CTA/tel/FAQ coverage. The 96-URL sitemap set was submitted to IndexNow again with HTTP `200 OK`.
- Electrical fixture/device project-value/AI visibility pass on 2026-07-03: the electrical hub plus light fixture installation, chandelier installation, ceiling fan installation, outlet installation, USB outlet installation, switch installation, smart device installation, and electrical troubleshooting pages were tightened for high-intent NYC fixture/device queries and AI answerability. The pages now expose photo/model/box/support/fixture-weight/ceiling-height/box-depth/door-fit/WiFi/app/building-rules quote prep, replacement-scope limits, Licensed Master Electrician escalation for added circuits/new locations/service equipment/higher-voltage/permit-level work, and 2 static case-study links per page. Old hard promises around same-day/next-day availability, flat-rate/no-surprise pricing before review, universal brand/fixture coverage, new wiring/circuit/panel work, fire-hazard urgency claims, and guaranteed/permanent repair outcomes were replaced with scope-based review language. `facts.json`, `llms.txt`, and `llms-full.txt` were updated with electrical-specific high-intent pages and quote-prep instructions, and cache-busting was bumped to `20260703f`. Local validation passed: `facts.json` parse, 41 priority service URLs present and in the sitemap, structured-data validator, review-schema validator, `git diff --check`, JS syntax checks for loader/chat/main/checklist/comparison, all 79 service pages with valid title/meta lengths and no duplicate titles, risk-phrase grep over electrical/AI/component surfaces, local Playwright smoke across 9 electrical URLs on desktop/mobile, and desktop/mobile screenshot spot checks with no visible hero/CTA overlap. Cloudflare Pages production deployed commit `e4809d5` as deployment `c1e8fd4c`; live custom-domain curl and browser checks confirmed the updated electrical copy on all 9 URLs, `20260703f` assets, no old risky phrases, clean console, safe chat status, and case/CTA/tel/FAQ coverage. The 96-URL sitemap set was submitted to IndexNow again with HTTP `200 OK`.
- AC installation/cleaning project-value/AI visibility follow-up on 2026-07-03: the AC hub plus window AC installation, AC bracket installation, through-wall AC installation, PTAC installation, portable AC setup, AC removal, and AC deep cleaning pages were tightened after the broader electrical/plumbing/furniture passes. The pages now expose model/BTU/window/sleeve/photo/COI/building-rule/disposal quote prep, existing-sleeve limits for through-wall/PTAC work, portable AC vent-path limits, accessible-cleaning limits, DSNY CFC/Freon disposal guidance, and 2 static case-study links per page. Old hard promises around same-day/next-day availability, flat-rate pricing before review, all-brand/all-window coverage, universal brackets, mold-free/guaranteed/permanent outcomes, mini-split installation, Local Law 11, refrigerant recovery, and broad commercial HVAC scope were removed or reframed as scope review and trade/approval escalation. `facts.json`, `llms.txt`, and `llms-full.txt` were updated with AC removal/deep-cleaning/PTAC/portable URLs and AC-specific scope boundaries; shared calculator/runtime copy now says `Planning Estimate` instead of `Estimated Flat Rate`, and cache-busting was bumped to `20260703g`. Local validation passed: `facts.json` parse, 42 priority service URLs present and in the sitemap, structured-data validator, review-schema validator, `git diff --check`, JS syntax checks for loader/main/chat/checklist/comparison/calculator/photo-drop/quote-modal/related-content, all 79 service pages with valid title/meta lengths, AC risk-phrase grep, and local Playwright smoke across the 8 AC URLs on desktop/mobile with 16 checks and 0 failures. Cloudflare Pages production deployed commit `406edca` as deployment `c965ee9a`; live custom-domain curl checks confirmed all 8 AC URLs, `/facts.json`, and `/llms.txt` return `200`, use `20260703g`, have at least 2 case-study links per AC page, and do not show old risky AC phrases. Live mobile browser smoke across all 8 AC URLs passed with 0 failures. The 96-URL sitemap set was submitted to IndexNow again with HTTP `200 OK`.
- Appliance installation project-value/AI visibility follow-up on 2026-07-03: the appliance hub plus dishwasher, dryer, washer, washer/dryer, range, microwave, and refrigerator pages were tightened for high-intent NYC appliance queries and AI answerability. The pages now expose model, delivery, hookup, vent, shutoff, water-line, gas-ready, building-access, and COI quote-prep details; gas dryer/range, dishwasher, washer/dryer, refrigerator water-line, and microwave scope now route incompatible hookups, new gas/plumbing/electrical lines, hidden piping, hardwired changes, and DOB/permit-level work through Licensed Master Plumber/Electrician review. Old hard promises around same-day/next-day availability, flat-rate/no-surprise pricing before review, all-brand/all-size/all-configuration coverage, quote-upfront language, and trade-license overclaims were removed or reframed as scope review and confirmed appointment windows. `facts.json`, `llms.txt`, and `llms-full.txt` were updated with appliance-specific high-intent pages, quote-prep instructions, and regulated-scope boundaries; shared checklist/comparison defaults now use `Insured setup team` and `Insured Business`; cache-busting was bumped to `20260703h`. Local validation passed: `facts.json` parse, structured-data validator, review-schema validator, `git diff --check`, JS syntax checks for loader/main/chat/checklist/comparison/calculator/photo-drop/quote-modal/related-content, no stale `20260703g` in public files, and local Playwright smoke across the 8 appliance URLs on desktop/mobile with 16 checks and 0 failures. Cloudflare Pages production deployed commit `f251cab` as deployment `9009da38`; live custom-domain fetch and browser checks confirmed all 8 appliance URLs, `/facts.json`, and `/llms.txt` return `200`, use `20260703h` on HTML pages, have at least 2 case-study links per page, and do not show old risky appliance phrases. The first clean custom-domain fetch briefly returned stale edge HTML, but the clean URL revalidated and subsequent no-query checks passed. The 96-URL sitemap set was submitted to IndexNow again with HTTP `200 OK`.
- Sitewide trust/scheduling claim cleanup on 2026-07-03: the homepage, About, FAQ, Services directory, blog index, Queens handyman guide, furniture-cost guide, TV-mounting guide, selected hub CTAs, and explicit service-module overrides were tightened so general business copy now says `insured`, `COI support`, `scope-reviewed quote`, `confirmed appointment window`, and `scheduling after review` instead of broad `licensed and insured`, `fully licensed/bonded`, `same-day/next-day`, `within 30 minutes`, `flat-rate`, `no hidden/no surprise`, `any/all brand`, or `satisfaction guaranteed` claims. Actual customer review text was left intact and excluded from business-promise scans. `facts.json`, `llms.txt`, and `llms-full.txt` were updated so AI tools cite the business as insured with COI support and route trade-license-sensitive work through scope review. Cache-busting was bumped to `20260703i`. Local validation passed: `facts.json` parse, structured-data validator, review-schema validator, `git diff --check`, JS syntax checks for loader/main/chat/checklist/comparison, 101 public HTML title/meta checks, residual source scan with only review/false-positive hits, and local Playwright smoke across 17 representative URLs on desktop/mobile with 34 checks and 0 failures. Cloudflare Pages production deployed commit `7b843e2` as deployment `159daab1`; the deployment alias first returned 404 during propagation and then served the new build, while the custom domain switched from stale `20260703h` HTML to `20260703i` on the second poll. Live custom-domain fetch and browser checks confirmed representative URLs return `200`, render `20260703i`, have no stale `20260703h`, no risky business phrases outside testimonials, and no horizontal overflow. The 96-URL sitemap set was submitted to IndexNow again with HTTP `200 OK`.
- Proof-content and new-apartment setup cleanup on 2026-07-03: `new-apartment-setup/` was tightened from hard same-day/30-minute/no-surprise/any-brand/any-wall/licensed claims to `confirmed scheduling windows`, `scope-reviewed estimate`, `insured & COI ready`, product/wall review, and appointment-window language while preserving the high-intent move-in handyman keywords. Case-study source data and generated pages were synced to remove the unnecessary `perfect wide final photo` phrasing, and all case-study pages were regenerated with cache-busting `20260703j`. Public gallery data files `web_gallery.json` and `website_picks_final.json` had SEO captions and related text cleaned so AI/search surfaces no longer see `perfect`, `flawless`, `guarantee/guaranteed`, `any wall`, `any brand`, `any size/all sizes`, `all types`, or generated replacement artifacts such as `mmany`/`mreviewed`. `components/loader.js` and `scripts/generate-case-studies.py` were updated to `20260703j`. Local validation passed: gallery/case-study/facts JSON parse, structured-data validator, review-schema validator, `git diff --check`, JS syntax check for loader/main, title/meta checks across all changed public pages, residual risk-phrase scan with only actual customer-review text remaining, local Playwright smoke on new-apartment and representative case-study pages, and a local fetch sweep across all case-study URLs. Cloudflare Pages production deployed commit `9024ddc` as deployment `c1a5b6b6`; the custom domain initially served stale `20260703i` HTML, then switched to `20260703j` on the second poll. Live custom-domain fetch checks confirmed all case-study URLs, `new-apartment-setup/`, `/web_gallery.json`, and `/website_picks_final.json` return `200`, have no stale `20260703i`, and do not show old claim/caption residue. Live desktop/mobile browser smoke passed for `new-apartment-setup/`, `case-studies/`, and the custom planter/bench case study with no horizontal overflow. The 96-URL sitemap set was submitted to IndexNow again with HTTP `200 OK`.
- Internal/public surface index hygiene on 2026-07-03: a sitemap-vs-public-file audit found indexable-looking orphan surfaces outside the 96 canonical sitemap URLs, including `previews/one-bedroom-renovation-draft/`, internal Markdown docs, `AGENTS.md`, `_data` JSON, public related-content data, and gallery JSON files. `_headers` was updated so `_data/*`, `assets/data/*`, `previews/*`, `reports/*`, `docs/*`, `deploy/*`, `AGENTS.md`, `web_gallery.json`, and `website_picks_final.json` return `X-Robots-Tag: noindex` while `facts.json`, `llms.txt`, `llms-full.txt`, and `sitemap.xml` remain discoverable. Cloudflare Pages production deployed commit `a039dd2` as deployment `4de93cf6`; live custom-domain checks confirmed the new noindex headers on the internal/draft/data surfaces and no noindex header on `facts.json` or the LLM files. The standard 96-URL canonical sitemap set was submitted to IndexNow again with HTTP `200 OK`; internal noindex URLs were not submitted separately so they are not newly advertised.
- Chat visit/thread analytics flow cleanup on 2026-07-03: `chat.js` no longer posts `/api/widget/visit` on every page load when a stored CRM thread ID exists. The widget now waits until the visitor actually sends a message or photo, confirms the stored thread with `visitSource: stored_thread_user_action`, clears stale stored IDs on 404, creates a new CRM thread when needed, and then awaits a `visitSource: thread_created` visit before sending the first message/photo. This keeps CRM/session analytics tied to real chat intent instead of passive page views and reduces noise from stale localStorage threads. Cache-busting was bumped sitewide to `20260703l` so browsers fetch the updated `components/loader.js` and `chat.js`. Local validation passed: `node --check` for `chat.js`, `components/loader.js`, and `main.js`, `git diff --check`, structured-data validator, review-schema validator, regenerated case-study pages, and Playwright CRM-flow tests for new thread, stored thread, and stale stored thread sequences. Cloudflare Pages production deployed commit `786e828` as deployment `9679e0ca`; the deployment alias first returned 404 and the custom domain initially served stale `20260703i`/`20260703j`, then both switched to the new build on the second poll. Live checks confirmed all 96 sitemap URLs return `200`, HTML pages use `20260703l` with no stale `20260703i`/`20260703j`, live `chat.js` contains `visitSource` and no old `threadValidationPromise`, and Playwright on `https://asap.repair/` verified the new-thread (`thread -> visit -> message`), stored-thread (`visit -> message`), and stale-thread (`visit -> thread -> visit -> message`) sequences. The 96-URL sitemap set was submitted to IndexNow again with HTTP `200 OK`.
- Post-attribution/API audit on 2026-07-03: local and live sitemap checks both passed with 96 unique canonical HTML URLs, 0 duplicate URLs, 0 title/meta/H1/canonical/noindex errors, and 0 live non-200 sitemap URLs. All 96 sitemap pages include GA4 `G-1ZRVGCMZ43`, Clarity `wyzjzrud6n`, `components/loader.js?v=20260703l`, and `main.js?v=20260703l`. Live HTTP response timing from the current network was healthy: 96/96 pages returned `200`, p50 about 43 ms, p90 about 59 ms, and the slowest HTML response was about 139 ms. Fresh Lighthouse baseline is stored under `reports/lighthouse/20260703-post-attribution-api-audit/`: SEO was `100` on every tested desktop/mobile page; desktop performance was `98-99`; mobile performance was `88-91`; mobile LCP was about `2.8-3.2s`; console errors were clean. Lighthouse Best Practices stayed at `77` mostly because Microsoft Clarity/Bing set third-party cookies and Chrome reports cookie issues; treat that as an analytics tradeoff unless Clarity is removed or reconfigured.
- AI guide/data cleanup on 2026-07-03: `llms.txt` was synced with all 43 priority service URLs from `facts.json`, including USB outlets, smart devices, electrical troubleshooting, wall cabinets, trim painting, and cabinet painting. `web_gallery.json` and `website_picks_final.json` were cleaned so AI/data surfaces no longer contain the targeted overclaiming phrases `electrical technicians`, `appliance technicians`, `expert precision`, `safe and secure`, `gas line`, `licensed NYC handyman`, `all major AC`, or `any height`. Validation passed: JSON parse, structured-data validator, review-schema validator, JS syntax checks, `git diff --check`, and a facts-to-LLM/sitemap coverage check.

Remaining Ahrefs warnings/notices to work next:

- Redirect warnings: current Ahrefs rows are canonical host/protocol variants only; monitor, but no source-code fix is needed while live redirects have no loops and no redirect inlinks.
- Page/SERP title mismatch: 16 rows remain. Treat this as a monitoring/opportunity list rather than a direct source-code error; use Search Console/GA4 lead data before removing useful brand/category terms from titles.
- Pages to submit to IndexNow: 3 rows remained in Ahrefs for changed appliance URLs; the current 96-URL sitemap set was already resubmitted to IndexNow with HTTP `200 OK`.
- Bing Site Scan: still queued after about 22 hours; re-check later before creating another scan.
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
- Component redirect fix deployed in `638eda1`: the loader now requests `/components/header`, `/components/footer`, and `/components/quote-modal` directly instead of first requesting `.html` URLs that Cloudflare redirects to pretty URLs.
- Mobile retest after component redirect fix (`reports/lighthouse/20260702-034000-after-loader-redirects/`):
  - `/services/tv-wall-mounting/`: performance `99`, LCP `2.0s`, SEO `100`.
  - `/services/furniture-assembly/`: performance `91`, LCP `2.8s`, SEO `100`.
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
