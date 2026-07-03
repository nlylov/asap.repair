# Repair ASAP analytics/source inventory

Last verified: 2026-07-03, after production commit `60a3643`, live 102-URL sitemap verification, Ahrefs/Bing follow-up, legacy AC redirect verification, and 102-URL IndexNow resubmission.

Scope: `https://asap.repair/`, `https://api.asap.repair/`, and the connected CRM/organic tooling used for Repair ASAP lead and revenue measurement.

## Live on-site tags

| Source | Current status | Evidence | Primary use |
| --- | --- | --- | --- |
| Google Analytics 4 | Installed on public HTML pages | `gtag.js?id=G-1ZRVGCMZ43` in 102 live public HTML pages | Page views, CTA events, quote/chat lead events, paid conversion measurement from CRM |
| Microsoft Clarity | Installed on public HTML pages | Clarity tag id `wyzjzrud6n` in 102 live public HTML pages | Session recordings, heatmaps, smart events, bot/session quality, AI Visibility beta |
| Trustindex reviews widget | Installed on homepage | `https://cdn.trustindex.io/loader.js?e086e0f6537a0927ee66b407e2f` on `/` | Review/social proof rendering; not primary conversion analytics |
| Cloudflare Browser Insights / Web Analytics beacon | Not currently injected in live HTML | Live `/` did not include `static.cloudflareinsights.com` or `beacon.min.js`; CSP only allows it | Cloudflare zone/server analytics still exist separately, but no client beacon was confirmed |
| Google Tag Manager container | Not installed | No `GTM-...` container found; site uses direct `gtag.js` | Not applicable unless a future GTM migration is planned |
| Microsoft Ads UET / Bing Ads pixel | Not installed | No `uetq`, UET tag, or `bat.bing.com` script found in public source | Would be needed only if Microsoft Ads conversion tracking is required |
| Meta/Facebook Pixel | Not installed | No `fbq` or Meta pixel script found in public source | Not applicable unless Meta ads are launched |
| CallRail / call tracking script | Not installed | No CallRail/calltracking script found in public source | Phone clicks are tracked by site events; dynamic number insertion is not active |
| Hotjar / PostHog / Plausible / FullStory / Segment / Mixpanel | Not installed | No matching tags found in public source | Not applicable |

## Website event flow

Frontend event bridge: `main.js` exposes `window.repairAsapTrackEvent(eventName, params)`, sends the event to GA4 through `gtag('event', ...)`, and mirrors the event name to Clarity with `clarity('event', ...)`.

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

- Live sitemap/custom-domain check after contrast deployment: 102 canonical HTML URLs returned `200`, included GA4, Clarity, `/components/loader.js?v=20260703p`, and `/main.js?v=20260703p`, with no `noindex` on sitemap pages.
- IndexNow: updated 102-URL sitemap set resubmitted on 2026-07-03 and returned HTTP `200 OK`; Bing IndexNow shows latest submitted URLs at `Today 10:27`, source `Self`.
- Lighthouse contrast re-check: refrigerator installation and window AC installation mobile runs are now Accessibility `100`, SEO `100`, and `color-contrast` score `1` after the calculator UI contrast fix.
- Ahrefs crawl: completed `Today 04:51 AM` to `05:42 AM`, crawled 1,442 URLs, billed 96 pages, and showed 8 actual issue rows. The only redirect rows were canonical root/protocol redirects with no redirect loops and no redirect inlinks; content-change rows are expected from the SEO copy/meta/H1 updates.
- Bing Sitemaps: 2 known sitemaps, 0 errors, 0 warnings, 191 discovered URLs. Canonical `https://asap.repair/sitemap.xml` was resubmitted on 2026-07-03 and is processing; the previous Bing crawl still showed 97 URLs discovered before it reprocessed the new 102-URL sitemap.
- Bing Site Explorer: 112 URLs known over the last 6 months, 109 indexed, 0 errors, 2 warnings, 1 excluded, 7 clicks, 115 impressions, 5 backlinks. The two live 404 warning URLs were old AC slugs (`/ac_install`, `/ac-installation-cleaning`) and production now redirects them to `/services/ac-installation-cleaning/` with one hop and final `200`.
- Bing AI Performance beta: 0 citations and 0 cited pages in the visible report window.
- Bing Search Performance: visible report window showed 0 clicks/impressions, while Site Explorer still shows 7 clicks and 115 impressions over the last 6 months.
- Bing Site Scan: old `ASAP full site scan 2026-07-02` was stopped after being queued for 22+ hours; new `ASAP full site scan 2026-07-03 post-api-routing` is still `Queued 5 hours ago` with no pages/errors/warnings available yet.

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
- Bing Site Scan is queue-dependent; re-check the 2026-07-03 scan before treating Bing's site-audit state as known.
- Bing must recrawl the old AC warning URLs before its `2 warnings` Site Explorer count clears.
- Cloudflare Pages custom domain `api.asap.repair` is live-working but still `pending` in the Pages domain API; re-check until the panel shows `active`.
