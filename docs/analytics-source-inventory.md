# Repair ASAP analytics/source inventory

Last verified: 2026-07-03, after GSC/Bing/GA4/Clarity/GBP dashboard audit, review-schema cleanup, and localhost analytics-noise fix.

Scope: `https://asap.repair/`, `https://api.asap.repair/`, and the connected CRM/organic tooling used for Repair ASAP lead and revenue measurement.

## Live on-site tags

| Source | Current status | Evidence | Primary use |
| --- | --- | --- | --- |
| Google Analytics 4 | Installed through shared production-only loader | 102 source HTML pages reference `/analytics.js?v=20260703q`; loader injects `gtag.js?id=G-1ZRVGCMZ43` only on `asap.repair` / `www.asap.repair` | Page views, CTA events, quote/chat lead events, paid conversion measurement from CRM |
| Microsoft Clarity | Installed through shared production-only loader | 102 source HTML pages reference `/analytics.js?v=20260703q`; loader injects Clarity project `wyzjzrud6n` only on `asap.repair` / `www.asap.repair` | Session recordings, heatmaps, smart events, bot/session quality, AI Visibility beta |
| Trustindex reviews widget | Installed on homepage | `https://cdn.trustindex.io/loader.js?e086e0f6537a0927ee66b407e2f` on `/` | Review/social proof rendering; not primary conversion analytics |
| Cloudflare Browser Insights / Web Analytics beacon | Not currently injected in live HTML | Live `/` did not include `static.cloudflareinsights.com` or `beacon.min.js`; CSP only allows it | Cloudflare zone/server analytics still exist separately, but no client beacon was confirmed |
| Google Tag Manager container | Not installed | No `GTM-...` container found; site uses direct `gtag.js` | Not applicable unless a future GTM migration is planned |
| Microsoft Ads UET / Bing Ads pixel | Not installed | No `uetq`, UET tag, or `bat.bing.com` script found in public source | Would be needed only if Microsoft Ads conversion tracking is required |
| Meta/Facebook Pixel | Not installed | No `fbq` or Meta pixel script found in public source | Not applicable unless Meta ads are launched |
| CallRail / call tracking script | Not installed | No CallRail/calltracking script found in public source | Phone clicks are tracked by site events; dynamic number insertion is not active |
| Hotjar / PostHog / Plausible / FullStory / Segment / Mixpanel | Not installed | No matching tags found in public source | Not applicable |

## Website event flow

Frontend event bridge: `main.js` exposes `window.repairAsapTrackEvent(eventName, params)`, sends the event to GA4 through `gtag('event', ...)`, and mirrors the event name to Clarity with `clarity('event', ...)`. `/analytics.js` defines the analytics globals for all hosts, but it only loads external GA4/Clarity network tags on production hostnames. This prevents local `127.0.0.1` / localhost sessions from polluting production analytics while keeping site JS safe in local previews.

High-intent frontend events found in source:

- `form_start`
- `phone_click`
- `sms_click`
- `chat_open`
- `quote_form_submit`
- `quote_modal_open`
- `quote_modal_submit`
- `photo_quote_submit`
- `generate_lead`
- `calculator_result`
- `calculator_quote_click`

Attribution fields captured on quote/chat flows include page URL, referrer, timezone/language, visitor id, UTM/click ids, and GA client id from `_ga` or GA4 `gtag('get')` where available.

## CRM/revenue measurement

| Source | Current status | Primary use |
| --- | --- | --- |
| `crm.asap.repair` | Active CRM/backend for website leads and invoice/payment reconciliation | Lead capture, chat threads, customer matching, quote/photo submissions, calendar slots |
| QuickBooks -> CRM | Active integration, still needs business-process tightening | Invoice/payment status source for paid jobs |
| CRM -> GA4 Measurement Protocol | Active | Sends server-side `purchase` / paid-conversion events once invoices/payments reconcile |
| `api.asap.repair` | Technical API/webhook host, not an indexable website | Serves Pages Functions under `/api/*`; non-API paths redirect to canonical `asap.repair` |

Live API-host checks on 2026-07-03:

- `https://api.asap.repair/services/plumbing/?probe=2` returns `301` to `https://asap.repair/services/plumbing/?probe=2`.
- `OPTIONS https://api.asap.repair/api/webhooks/thumbtack` returns `204` with `access-control-allow-methods: GET, POST, OPTIONS`.
- `OPTIONS https://api.asap.repair/api/widget/visit` returns `204` with `access-control-allow-methods: POST, OPTIONS`.
- No Vercel headers were present on the checked `/api/*` responses.

## Organic/search/AI tooling

| Tool/source | Current status | Primary use |
| --- | --- | --- |
| Google Search Console | Connected to GA4 stream `asap.repair` | Indexing, search performance, sitemap health |
| Bing Webmaster Tools | Property active; sitemap resubmitted on 2026-07-03; Site Scan still queued | Bing indexing, Site Scan, IndexNow, AI Performance beta |
| IndexNow | Active | Fast URL submission for Bing/Yandex-compatible consumers |
| Ahrefs Site Audit | Active; new crawl started on 2026-07-03 at 04:51 AM New York time | External technical SEO crawl, redirect/title/link warnings |
| Local Lighthouse | Active fallback because PageSpeed API hit 429 in this environment | Performance/SEO/accessibility/best-practices baselines |
| `llms.txt` / `llms-full.txt` | Live and discoverable | LLM/AI-crawler service facts, priority service URLs, borough landing page URLs, quote-prep details |
| `facts.json` | Live and discoverable through LLM files, not XML sitemap | Structured business/service facts, priority service URLs, and service-area page URLs for AI/search use |

Crawler status at this verification point:

- Google Search Console sitemap: canonical `https://asap.repair/sitemap.xml` was resubmitted and processed on 2026-07-03 with status `Success` and 102 discovered pages.
- Google Search Console indexing: 44 pages indexed and 77 not indexed as of the 2026-06-29 coverage update. Not-indexed reasons were 5 old 404 rows, 2 redirects, 48 discovered-not-indexed, and 22 crawled-currently-not-indexed. Live checks showed the old 404 service slugs now redirect, except `email.email.asap.repair`, which has no DNS record and should be treated as subdomain/DNS hygiene.
- Google Search Console performance, last 3 months: 165 clicks, 29,331 impressions, 0.6% CTR, average position 21.8. Top landing pages by clicks were `/` (53 / 3,346 impressions), `/services/furniture-assembly/` (27 / 6,432), `/services/appliance-services/` (14 / 5,178), `/services/tv-wall-mounting/projector-installation/` (11 / 340), `/services/furniture-assembly/bed-assembly/` (8 / 1,093), `/services/plumbing/toilet-installation/` (6 / 649), and `/services/general-repairs/caulking/` (5 / 400).
- Google Search Console review snippets: 97 invalid elements, last updated 2026-07-01. Reported issues were missing `itemReviewed` and invalid `author` object type. Deployment `53f1a6dd` from source `35d8261` removed the 63 individual self-serving `Review` JSON-LD entries from live `/reviews/`, but the first GSC validation attempt still failed because `/reviews/` kept a self-serving `AggregateRating` block. The source now removes both individual `Review` and `AggregateRating` JSON-LD from `/reviews/` while keeping visible customer reviews in HTML; local checks find 0 `Review` JSON-LD nodes sitewide, no `AggregateRating` on `/reviews/`, and 85 remaining service/page `AggregateRating` blocks. GSC will only clear after the follow-up deployment, recrawl, and validation.
- Live deployment check after analytics-loader deployment: representative custom-domain URLs (`/`, `/reviews/`, furniture assembly, appliance services, projector installation, toilet installation) returned `200`, referenced `/analytics.js?v=20260703q`, had no old inline GA4/Clarity tags, and `/reviews/` had no individual `Review` JSON-LD. Live `/analytics.js` returned `200` and includes the production-host guard.
- IndexNow: updated 102-URL sitemap set resubmitted on 2026-07-03 and returned HTTP `200 OK`; Bing IndexNow shows latest submitted URLs at `Today 10:27`, source `Self`.
- Lighthouse contrast re-check: refrigerator installation and window AC installation mobile runs are now Accessibility `100`, SEO `100`, and `color-contrast` score `1` after the calculator UI contrast fix.
- Ahrefs crawl: completed `Today 04:51 AM` to `05:42 AM`, crawled 1,442 URLs, billed 96 pages, and showed 8 actual issue rows. The only redirect rows were canonical root/protocol redirects with no redirect loops and no redirect inlinks; content-change rows are expected from the SEO copy/meta/H1 updates.
- Bing Sitemaps: 2 known sitemaps, 0 errors, 0 warnings, 196 discovered URLs. Canonical `https://asap.repair/sitemap.xml` was submitted/crawled on 2026-07-03 with status `Success` and 102 discovered URLs. Duplicate `https://www.asap.repair/sitemap.xml` remains discovered with status `Success`, last crawled 2026-06-28, 95 discovered URLs.
- Bing Site Explorer: 112 URLs known over the last 6 months, 109 indexed, 0 errors, 2 warnings, 1 excluded, 7 clicks, 115 impressions, 5 backlinks. The two live 404 warning URLs were old AC slugs (`/ac_install`, `/ac-installation-cleaning`) and production now redirects them to `/services/ac-installation-cleaning/` with one hop and final `200`.
- Bing AI Performance beta: 0 citations and 0 cited pages in the visible report window.
- Bing Search Performance: visible report window showed 0 clicks/impressions, while Site Explorer still shows 7 clicks and 115 impressions over the last 6 months.
- Bing Recommendations: `No pages found`.
- Bing Site Scan: old `ASAP full site scan 2026-07-02` was stopped with 0 scanned pages / 0 errors / 0 warnings; new `ASAP full site scan 2026-07-03 post-api-routing` is still queued with no pages/errors/warnings available yet.
- Microsoft Clarity dashboard, last 3 days: 94 sessions, 84 unique users, 47 bot sessions excluded, 2.67 pages/session, 58.02% average scroll depth, 42s active time, 0 rage-click sessions, 5 dead-click sessions, 3 quick-back sessions, 0 JavaScript errors, performance score 95/100 from the available page-view sample, LCP 1.4s, INP 110ms, CLS 0. Smart events visible: `chat_open` 3, form submit 2, request quote 2, contact 1, outbound click 1, `phone_click` 1, `form_start` 1. Top referrers include `www.google.com` 7, `asap.repair` 6, and `chatgpt.com` 1.
- Microsoft Clarity AI Visibility beta: 0 citations, no Share of Authority data, no grounding-query rows, no cited-page rows, and AI referral sessions `<1%`.
- Google Analytics 4 dashboard, last 7 days: 87 active users, 81 new users, 507 events, 1 key event. Channel sessions: Direct 97, Organic Search 18, AI Assistant 7, Organic Social 1. GA4 recommendation: import offline CRM lead/conversion data for lead generation.
- GA4 key-event admin table: `chat_open`, `generate_lead`, `phone_click`, `quote_form_submit`, `quote_modal_submit`, and `sms_click` have active stream `asap.repair`; `purchase`, `qualify_lead`, and `close_convert_lead` are configured as key events but show no active stream in the last 28 days, confirming the CRM/QuickBooks paid-conversion flow still needs end-to-end business-process completion.
- Google Business Profile: 1 profile, 100% verified. Store code `18156736253281874039`, business `Repair ASAP LLC`, status `Verified`. Search management surface showed 27 customer interactions, full profile quality, 3 new reviews, 5.0 rating with 13 Google reviews, and a prompt that recent photos were last added 408 days ago. GBP also prompts booking, posts/news, chat, and review-request actions.

## Lead/marketplace sources outside site code

These are business acquisition sources and should be reconciled in CRM/GA4 by lead source, not treated as on-page analytics tags:

- Google Business Profile
- Yelp
- Thumbtack
- Service Direct
- Google Local Services Ads, planned/re-enable candidate
- Organic SEO / direct website traffic
- AI referral traffic from ChatGPT, Claude, Gemini, Perplexity, and similar assistants where referrers are exposed

## Immediate gaps to keep tracking

- CRM business workflow should make paid conversion measurement deterministic: website/chat lead -> CRM lead/contact -> scheduled job/appointment -> estimate/invoice -> QuickBooks paid status -> CRM paid state -> GA4 `purchase`.
- GSC recrawl/validation must happen before the review-snippet invalid count clears. Existing `127.0.0.1` sessions remain in historical Clarity windows until the date range rolls forward.
- Bing Site Scan is queue-dependent; re-check the 2026-07-03 scan before treating Bing's site-audit state as known.
- Bing must recrawl the old AC warning URLs before its `2 warnings` Site Explorer count clears.
- Cloudflare Pages custom domain `api.asap.repair` is live-working but still `pending` in the Pages domain API; re-check until the panel shows `active`.
