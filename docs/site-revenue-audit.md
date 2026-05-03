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

## Next 10 Highest-ROI Tasks

1. **Borough landing pages** — Create `/handyman-manhattan/`, `/handyman-brooklyn/`, `/handyman-queens/` with unique content targeting local keywords
2. **Review count update** — Schema shows `reviewCount: 97` — verify and update to current count
3. **Before/after photo pairs** — Add real before/after images to high-traffic service pages
4. **Google Business Profile deep link** — Add direct booking link from GBP to quote modal
5. **Price anchors on service pages** — Add "Starting from $XX" to all 9 hub pages
6. **Seasonal AC landing page** — "Window AC Installation NYC" peaks May-August — optimize now
7. **Blog content cadence** — 2 posts/month targeting long-tail service + neighborhood keywords
8. **Call tracking number** — Consider separate tracking number for website vs GBP to measure channel performance
9. **A/B test hero CTA copy** — Test "Get Your Free Quote" vs "Book Your Handyman" vs "Schedule Today"
10. **Exit-intent popup** — Show quote offer when user moves to leave the page (desktop only)

---

## Files Changed

| File | Change |
|------|--------|
| `_headers` | CSP fixes: YouTube frame-src, remove old proxy |
| `index.html` | Mobile sticky CTA, SMS links, FAQ schema, contact links, form CTA |
| `main.js` | GA4 conversion events, sticky CTA scroll behavior |
| `styles.css` | Mobile sticky CTA bar styles |
| `docs/site-revenue-audit.md` | This audit document |
