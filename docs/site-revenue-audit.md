# Repair ASAP — Site Revenue Audit

> **Date:** 2026-05-02
> **Auditor:** AI Revenue Audit Agent
> **Site:** https://asap.repair
> **Branch:** `site-revenue-audit-improvements`

---

## Executive Summary

The website is well-built, visually professional, and functionally solid. The dark/gold brand is premium-feeling, the form + quote modal + chat widget + calendar booking integration is far beyond typical handyman sites. No critical breakage found. The focus areas are: **missing GA4 conversion events** (biggest revenue blindspot), **missing mobile sticky CTA bar** (lost mobile leads), **CSP blocking YouTube embeds** (broken portfolio videos), **no SMS/text option** (popular contact method for NYC customers), and **homepage FAQ missing schema markup** (missed SERP feature opportunity).

---

## Findings by Priority

### P0 — Critical Issues (Directly Block Leads/Revenue)

| # | Page | Problem | Business Impact | Fix | Status |
|---|------|---------|-----------------|-----|--------|
| 1 | All pages | **No GA4 conversion event tracking** — zero `gtag('event', ...)` calls in the entire codebase. Form submissions, phone clicks, quote modal opens, SMS clicks are invisible to analytics. | Cannot measure which traffic sources produce leads. Cannot optimize ad spend. Flying blind on ROI. | Add GA4 events: `form_submit`, `phone_click`, `quote_modal_open`, `chat_open`, `sms_click` | ✅ Implemented |
| 2 | Homepage | **CSP `frame-src` blocks YouTube embeds** — Portfolio section uses YouTube iframes via lightbox, but `frame-src` only allows `https://apps.elfsight.com`. YouTube videos silently fail. | Portfolio videos that build trust and showcase real work do not play. | Add `https://www.youtube.com` to `frame-src` in `_headers` | ✅ Implemented |
| 3 | All pages | **CSP `connect-src` still references decommissioned proxy** — `repair-asap-proxy-production.up.railway.app` in CSP. While no JS calls this anymore, it's a stale entry. | Security hygiene / confusion. No active breakage but violates migration completion. | Remove old proxy from CSP, ensure `crm.asap.repair` is present | ✅ Implemented |

### P1 — High-Impact Revenue Issues

| # | Page | Problem | Business Impact | Fix | Status |
|---|------|---------|-----------------|-----|--------|
| 4 | Mobile (all pages) | **No mobile sticky CTA bar** — On mobile, the only persistent CTA is the chat widget bubble (bottom-right). No Call/Text/Quote sticky bar. | Mobile users who scroll past the hero have no easy way to call or request a quote. Mobile is 60-70% of traffic for local services. | Add a fixed bottom CTA bar on mobile with Call + Text + Quote buttons | ✅ Implemented |
| 5 | All pages | **No SMS/Text option anywhere** — No `sms:` links on the entire site. Many NYC customers prefer texting photos over calling. | Lost leads from text-preferring customers. "Text us photos for a fast estimate" is a proven high-conversion CTA for handyman services. | Add SMS link (`sms:+17753107770`) in hero, contact section, and mobile sticky bar | ✅ Implemented |
| 6 | Homepage | **Homepage FAQ section has no FAQPage schema** — Service spoke pages all have FAQPage schema, but the homepage FAQ section (6 questions) has zero structured data. | Missing FAQ rich results on the main landing page — highest traffic page. | Add FAQPage JSON-LD to homepage | ✅ Implemented |
| 7 | Homepage | **Inline form "Send Request" button** is generic — doesn't create urgency or clarify the value prop. | Weaker conversion signal. "Send Request" doesn't tell the user what they get. | Change to "Get Your Free Quote" with a reinforcement micro-copy below | ✅ Implemented |
| 8 | Homepage hero | **No "Send photos for estimate" CTA** — The hero has "Request a Free Quote" and phone, but no mention of photo estimates. | Missing the highest-intent conversion path: customers with photos ready to send. | Add "Text Photos for Fast Estimate" as tertiary CTA in hero | ✅ Implemented |

### P2 — SEO / UX Improvements

| # | Page | Problem | Business Impact | Fix | Status |
|---|------|---------|-----------------|-----|--------|
| 9 | Homepage | Stats bar shows "5+ Years Hands-On Experience" — the "5+" feels low and undermines trust. If the company truly has 5+ years, consider whether this number is being undersold or if it's better to use a different framing. | Perception of inexperience. Competitors claim 10-20+ years. | — | Needs owner input |
| 10 | All pages | **Bronx missing from FAQ service area answer** — FAQ says "Manhattan, Brooklyn, Queens, Staten Island, and Western Long Island" but schema and footer include Bronx. | Inconsistent NAP/service area signals for local SEO. | Add Bronx to FAQ answer text | ✅ Implemented |
| 11 | Homepage | Contact section phone/email are not clickable links — they're plain `<span>` elements | Cannot tap to call/email from contact info section (although other phone links on page work) | Wrap in `<a href="tel:">` and `<a href="mailto:">` | ✅ Implemented |
| 12 | All pages | Google Maps Places API deprecation warning — `Autocomplete` class is deprecated in favor of `PlaceAutocompleteElement` | Not broken now but will eventually stop working | — | Documented for future |

### P3 — Nice-to-Have

| # | Page | Problem | Business Impact | Fix | Status |
|---|------|---------|-----------------|-----|--------|
| 13 | Homepage | Review widget (Trustindex) is lazy-loaded well, but the section looks empty until scrolled into view | Minor — good for performance | — | No action needed |
| 14 | Service pages | Some service spoke pages use different HTML structures (some minified, some formatted) | Maintenance difficulty | — | Not revenue-impacting |
| 15 | All pages | `styles.css` is 103KB unminified | Could improve load time marginally | Consider CSS minification in deploy pipeline | Documented |
| 16 | Blog | Only 3 blog posts | More content = more SEO surface area | Create seasonal/neighborhood content | Documented |

---

## Changes Implemented

### 1. GA4 Conversion Event Tracking (`main.js`)
Added comprehensive event tracking:
- `phone_click` — any `tel:` link tap
- `sms_click` — any `sms:` link tap
- `quote_form_submit` — inline form submission
- `quote_modal_open` — quote modal opened
- `quote_modal_submit` — modal form submission
- `chat_open` — chat widget opened

### 2. CSP Header Fixes (`_headers`)
- Added `https://www.youtube.com` to `frame-src` (fixes portfolio video playback)
- Removed stale `repair-asap-proxy-production.up.railway.app` from `connect-src`

### 3. Mobile Sticky CTA Bar (`index.html` + `styles.css`)
- Added fixed bottom bar on mobile (≤768px) with 3 buttons: Call, Text Photos, Get Quote
- Auto-hides when footer is visible (avoids double-footer feeling)
- Properly z-indexed below modals but above content

### 4. SMS/Text Links
- Added "Text Photos for Fast Estimate" CTA in hero section
- Added SMS link in contact details section
- Mobile sticky CTA includes Text button

### 5. Homepage FAQ Schema (`index.html`)
- Added FAQPage JSON-LD for all 6 FAQ questions on the homepage

### 6. Contact Section UX
- Made phone number and email clickable (`tel:` and `mailto:` links)
- Added Bronx to the FAQ service area answer for NAP consistency

### 7. Form CTA Improvement
- Changed "Send Request" to "Get Your Free Quote"
- Added micro-copy: "Free estimate · No obligation · Response within 30 min"

---

## Not Implemented (Requires Owner Decision)

| Item | Why |
|------|-----|
| Change "5+ Years Experience" stat | Need to confirm actual years — cannot invent a number |
| Borough-specific landing pages | High SEO value but requires unique content per borough |
| Before/after photo gallery on homepage | Need real project photos paired as before/after |
| Google Business Profile link in header | Need to confirm correct GBP URL |
| Price range additions to service pages | Need to confirm current pricing is accurate |
| CSS minification | Requires build pipeline change |

---

## Testing Notes

| Test | Result |
|------|--------|
| Phone buttons (`tel:` links) | Working across hero, header, footer, contact section |
| SMS links (`sms:` links) | Added and functional |
| Quote form (inline) | Submits to `crm.asap.repair/api/widget/quote` |
| Quote modal | Opens, validates, submits correctly |
| Chat widget | Loads, connects to CRM |
| Mobile layout | Responsive, sticky CTA visible |
| Counter animations | Animate on scroll, show correct numbers |
| YouTube lightbox | Will work after CSP fix deployed |
| Console errors | No errors (1 deprecation warning for Google Places) |
| GA4 events | `gtag()` calls fire on all conversion actions |
| FAQ schema | Valid FAQPage JSON-LD added |
| SEO metadata | Title, description, canonical, OG tags all present |
| Structured data | LocalBusiness, WebSite, FAQPage schemas present |

---

## 2026-07-03 Follow-up

The mobile sticky CTA is now truly global instead of homepage-only. The Call/Text/Free Quote bar lives in `components/footer.html`, and `main.js` binds its footer-visibility behavior after the shared components load. Local mobile browser smoke at 390x844 confirmed exactly one sticky CTA on `/` and `/services/electrical/outlet-installation/`, correct `tel:`/`sms:` targets, quote modal open from the sticky button, and no browser console errors.

The services directory and smart device page were strengthened for SEO/AI answer visibility. `/services/` now includes visible planning/pricing FAQ content plus FAQPage JSON-LD covering handyman cost, quote-prep details, five-borough service area, and move-in service bundles. `/services/electrical/smart-device-installation/` now covers smart thermostat/lock/doorbell/device cost intent without promising fixed pricing. `llms.txt` and `llms-full.txt` now include smart device setup pricing guidance.

Borough service-area landing pages were added for Manhattan, Brooklyn, Queens, the Bronx, Staten Island, and Western Long Island/Nassau. Each page has a canonical URL, FAQPage JSON-LD, Service JSON-LD with area-specific `areaServed`, priority service links, neighborhood coverage, quote-prep copy, and proof/case-study links where available. The global footer now links to these area pages, `sitemap.xml` lists them, and `facts.json`, `llms.txt`, and `llms-full.txt` expose the exact URLs for AI/search citation.

Current local audit status after this pass: 147 HTML files in the repo, 102 indexable pages, 102 unique sitemap URLs, 77 service pages. No indexable page is missing from sitemap, no sitemap URL lacks a local page, no indexable page is missing canonical/meta description/JSON-LD, no indexable title is over 65 characters, no indexable meta description is over 155 characters, and all 77 service pages now carry FAQ/service schema, price-or-estimate intent, service-area language, and quote-prep guidance.

Dashboard follow-up on 2026-07-03: Search Console shows the site has demand but low CTR: 165 clicks from 29,331 impressions over 3 months, average position 21.8, CTR 0.6%. The highest-current opportunity pages are homepage, furniture assembly, appliance services, projector installation, bed assembly, toilet installation, caulking, blinds, lock installation, and flooring. GA4 shows 87 active users, 507 events, and only 1 key event over the last 7 days; all lead/key events are configured, but CRM/QuickBooks paid stages (`purchase`, `qualify_lead`, `close_convert_lead`) still show no active stream before new CRM events occur. CRM production is now verified at `d95b4e6bf6694a63b64106e4464d87f10023ee9c`, which includes PR #463 lead-stage event emission and PR #479 safer QuickBooks invoice/job linking plus a dry-run-first historical backfill script. The next revenue priority is therefore not more raw traffic alone, but tightening paid-conversion plumbing from website/GBP/Yelp/Thumbtack/Service Direct lead -> CRM lead/job -> QuickBooks paid invoice -> GA4 offline `purchase`.

Technical cleanup from the same dashboard pass: `/reviews/` no longer emits individual self-serving `Review` JSON-LD, page-level `AggregateRating` JSON-LD, or `schema.org/Review` microdata after GSC validation showed the reviews page was still affected. Visible customer reviews remain in HTML, but the business-owned reviews page is no longer trying to qualify for review-snippet rich results. Live Googlebot checks confirm the review markup is gone, and GSC validation for both review-snippet issues started on 2026-07-03. All public HTML now loads GA4/Clarity through `/analytics.js?v=20260703q`, which blocks external analytics tags on localhost/127.0.0.1. Cloudflare Pages deployment `53f1a6dd` from source `35d8261` is live on the custom domain for the analytics-loader cleanup. Existing local test sessions will remain in historical Clarity ranges until the date window moves forward, but new local previews should stop polluting production analytics.

Commercial snippet cleanup on 2026-07-03: the high-opportunity general-repair pages for blind installation, lock installation, and caulking were tightened for search/AI answer quality. Generic hero phrasing was replaced with apartment/door-specific intent, hard/broad claims such as `Licensed, insured`, `all other brands`, hardwired blind installation, and fixed caulk life were replaced with scope-reviewed language, and visible FAQ answers were aligned with the safer JSON-LD answers. Cloudflare Pages served the updated live HTML on all three URLs, and the 102-URL canonical sitemap set was resubmitted to IndexNow with HTTP `200 OK`.

Sitewide snippet/metadata cleanup on 2026-07-03: homepage/about Open Graph and AboutPage JSON-LD, service Open Graph descriptions, selected service H1s, and gallery captions were swept for old broad-claim phrases such as `Licensed, insured`, `any type`, `all other brands`, and `many types`. Public snippets now describe insured, scope-reviewed work, COI support, product/photo review, subfloor/wall/access review, or specific compatible scope instead of broad license/all-scope promises. Live custom-domain checks confirmed the updated homepage/about/washer/flooring/gallery surfaces, and the 102-URL canonical sitemap set was resubmitted to IndexNow with HTTP `200 OK`.

Mobile conversion UI follow-up on 2026-07-03: while screenshot-checking the edited service H1s, the mobile sticky CTA bar was found to crop the quote button in narrow headless captures. The shared footer CTA now uses shorter `Quote` text with an accessible label, grid-based three-column sizing, explicit `100vw` bounds, and updated footer trust copy that no longer says `Licensed, insured`. Component and stylesheet cache-busting was bumped to `20260703s`. Local mobile screenshots confirmed the shortened H1s fit; Lighthouse mobile on the local homepage scored Performance `84`, Accessibility `100`, Best Practices `100`, SEO `100`, CLS `0.028`. Live custom-domain checks confirmed the `20260703s` HTML/CSS/component markers, updated washer and bathroom H1s, and a visible three-button sticky CTA; the 102-URL canonical sitemap set was resubmitted to IndexNow with HTTP `200 OK`.

Entity/AI copy follow-up on 2026-07-03: remaining business-owned entity copy was checked across `facts.json`, `llms.txt`, `llms-full.txt`, components, JSON-LD, gallery JSON, homepage/about, and service pages. Blind-installation `all types`, homepage quality-guarantee phrasing, and gallery `many ...` captions were replaced with compatible-scope, workmanship-policy, and product/wall/hardware review wording. Remaining scan hits are testimonial text, ordinary `paint has bonded` wording, or explicit warranty/parts-guarantee policy language. Live custom-domain checks confirmed the homepage FAQ, blind-installation copy/schema, `web_gallery.json`, and `website_picks_final.json` updates; the 102-URL canonical sitemap set was resubmitted to IndexNow with HTTP `200 OK`.

Gallery image/AI caption follow-up on 2026-07-03: generic gallery strings such as `Professional service completed by Repair ASAP LLC`, `Professional installation photo`, `Professional caulking and sealing service`, and `Cleaning and maintenance service` were removed from the touched high-intent image surfaces. `website_picks_final.json` now uses specific final alt text for the affected assets, and AC deep cleaning, caulking, washer installation, washer/dryer installation, refrigerator installation, and microwave installation pages now expose specific image captions/alt text. AC deep cleaning gallery badges were also aligned with photo metadata (`Before`, `In Progress`, `After`, `Detail`, `Result`) instead of defaulting dirty/process photos to `After`. Local validation passed: JSON parse, structured-data validator, review-schema validator, `git diff --check`, service URL coverage against sitemap/facts/llms/llms-full, and targeted generic-caption scan. Production commit `5e9592d` was live-verified on all 6 changed service URLs with HTTP `200`, visible new captions, and no targeted generic caption strings; the 102-URL canonical sitemap set was resubmitted to IndexNow with HTTP `200 OK`.

## 2026-07-04 Follow-up

Self-serving rating schema cleanup on 2026-07-04: all remaining `AggregateRating` JSON-LD was removed from business-owned homepage, service, borough, and category pages. Visible review proof remains in copy and `facts.json`, but the site no longer asks Google for review-snippet rich results from LocalBusiness-owned review/rating markup. `scripts/validate-review-schema.mjs` now enforces no individual `Review` JSON-LD, no `AggregateRating` JSON-LD, and no review microdata. Local validation passed: review-schema validator, structured-data validator (`291` JSON-LD blocks, `10` Article blocks), JSON parse for `facts.json` / gallery data, and targeted scans for `AggregateRating`, `schema.org/Review`, `itemprop="author"`, and old overclaiming phrases.

Performance/analytics follow-up on 2026-07-04: all 102 active runtime pages now reference deferred `/analytics.js?v=20260704b`. The loader still defines `gtag()` and `clarity()` immediately so lead events can queue, but external GA4 and Microsoft Clarity vendor scripts now load on first user interaction, lead-event demand, or delayed post-load idle on production hostnames only. Homepage `room-services.css` was moved off the render-blocking path because that module is below the fold. Local Lighthouse on the changed homepage scored Performance `89`, Accessibility `100`, Best Practices `100`, SEO `100`, LCP `3.6s`, FCP `2.1s`, TBT `0ms`, CLS `0.028`, compared with the live pre-change baseline of Performance `69`, Best Practices `77`, and LCP about `6.5s`.

## 2026-07-05 Follow-up

Revenue-priority AI/search routing was strengthened on six high-intent pages: window AC installation, projector mounting, toilet installation, lock installation, blind installation, and caulking. The changed pages now include clearer "best match" routing language, quote-prep details, five-borough/Western Long Island service-area language, richer Service JSON-LD descriptions where they were thin, and safer scope boundaries for plumbing/electrical/hidden-leak cases. `llms.txt`, `llms-full.txt`, and `facts.json` now expose the same revenue-priority route map so AI answer engines can choose the specific service page instead of the generic services directory.

Local validation passed after this pass: `facts.json` parsed, structured-data validation passed with `291` JSON-LD blocks and `10` Article blocks, review-schema validation found no Review/AggregateRating markup, `git diff --check` passed, and a targeted audit confirmed all 6 edited priority pages are in sitemap, `llms.txt`/`llms-full.txt`, and `facts.json`, with priority-routing copy present and visible word counts at or above 700 words.

Dashboard/indexing recheck on 2026-07-05: Search Console overview now shows `170` web-search clicks, `44` indexed pages, and `77` not indexed as of the 2026-06-29 coverage update. The not-indexed reasons remain `5` old 404 rows, `2` redirect rows, `48` discovered-not-indexed, and `22` crawled-currently-not-indexed. Current live technical crawl across all `102` sitemap URLs found `0` status/canonical/title/meta/H1/JSON-LD/version/preload issues, so the remaining GSC work is recrawl monitoring plus strengthening pages that Google has discovered or crawled but not yet chosen to index. Bing Sitemaps is healthy (`0` errors, `0` warnings, canonical sitemap `Success`, `102` canonical URLs), and IndexNow shows the 2026-07-05 self-submission of `102` URLs. Bing Search Performance and Bing AI Performance remain effectively zero, and Bing's only real strategic recommendation is inbound-link authority; its IndexNow recommendation is stale because IndexNow is already active.

Internal-linking fix on 2026-07-05: the six borough/Long Island landing pages were in the sitemap but had `0` raw-HTML inlinks because area navigation was not exposed as static links. Homepage, `/services/`, `/about/`, and `/faq/` now include visible static links to Manhattan, Brooklyn, Queens, Bronx, Staten Island, and Long Island pages; live link-graph validation shows each area page now has `4` static inlinks and no sitemap URL has 0 or 1 inlink. The FAQ page also now includes Bronx in both visible service-area copy and LocalBusiness/FAQPage schema. The post-deploy live crawl covered all `102` sitemap URLs with `0` status/canonical/title/meta/H1/JSON-LD/analytics issues, and IndexNow accepted the updated `102` URL set with HTTP `200 OK`.

Service-area consistency pass on 2026-07-05: 35 service HTML pages were updated where old visible copy said service covered only Manhattan, Brooklyn, Queens, and Staten Island. The revised copy includes the Bronx plus Western Long Island or Nassau County when scope and travel fit. Local validation found `0` remaining lines that mention Manhattan, Brooklyn, Queens, and Staten Island together while omitting Bronx.

## 2026-07-06 Follow-up

AI/LLM citation coverage was tightened after a fresh live crawl. The public 102-URL sitemap set returned 0 live technical issues for status, canonical, title/meta/H1 counts, JSON-LD parsing, analytics-loader presence, noindex, or self-serving review-rich-result signals. `llms.txt` now explicitly cites the three indexable blog guides for furniture-assembly cost, NYC apartment TV mounting, and Queens handyman comparison intent; `llms-full.txt` now cites `/about/` as the trust, insurance, COI, and service-standards page. A coverage check confirms every sitemap URL except intentionally noncommercial `/privacy-policy/` and `/terms-of-service/` is referenced from the AI-readable files, and IndexNow accepted the 102-URL set with HTTP `200 OK`.

---

## Next 10 Highest-ROI Tasks

1. **Review count update** — Verify current Google/Yelp/Thumbtack count before changing schema again
2. **Before/after photo pairs** — Add real before/after images to high-traffic service pages
3. **Google Business Profile deep link** — Add direct booking link from GBP to quote modal
4. **Price anchors on service pages** — Add "Starting from $XX" to all 9 hub pages only after confirming current pricing
5. **Seasonal AC landing page** — "Window AC Installation NYC" peaks May-August — optimize now
6. **Blog content cadence** — 2 posts/month targeting long-tail service + neighborhood keywords
7. **Call tracking number** — Consider separate tracking number for website vs GBP to measure channel performance
8. **A/B test hero CTA copy** — Test "Get Your Free Quote" vs "Book Your Handyman" vs "Schedule Today"
9. **Exit-intent popup** — Show quote offer when user moves to leave the page (desktop only)
10. **Dedicated borough proof photos** — Add Manhattan/Brooklyn/Queens/Staten Island/Long Island project photos to the new service-area pages as real local proof accumulates

---

## Files Changed

| File | Change |
|------|--------|
| `_headers` | CSP fixes: YouTube frame-src, remove old proxy |
| `index.html` | SMS links, FAQ schema, contact links, form CTA |
| `components/footer.html` | Global mobile sticky CTA bar shared across pages |
| `main.js` | GA4 conversion events, sticky CTA scroll behavior after component load |
| `styles.css` | Mobile sticky CTA bar styles |
| `docs/site-revenue-audit.md` | This audit document |
