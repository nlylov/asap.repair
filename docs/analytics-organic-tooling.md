# Repair ASAP analytics + organic tooling setup

Scope: `https://asap.repair/` static marketing site for the Repair ASAP tenant/customer. Do not mix these accounts or metrics with the Bazas platform property unless explicitly doing cross-site reporting.

## Current live baseline

- GA4 is installed on all generated HTML pages with measurement ID `G-1ZRVGCMZ43`.
- Public discovery files are live: `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`.
- Sitemap currently lists 89 URLs.
- Microsoft Clarity, Bing Webmaster Tools verification, and Ahrefs Webmaster Tools are not visible in source yet.

## GA4 key events

Recommended Repair ASAP key events:

- `generate_lead` — normalized lead event fired after successful inline or modal quote submit.
- `quote_form_submit` — successful inline homepage/contact quote form submit.
- `quote_modal_submit` — successful quote modal submit.
- `form_start` — first interaction with a form, without capturing field values.
- `phone_click` — click on `tel:` links.
- `sms_click` — click on `sms:` links.
- `chat_open` — opening the embedded chat widget.
- `quote_modal_open` — opening the quote modal.
- `cta_click` — quote/contact CTA click before modal open.

Privacy rule: do not send customer phone, email, address, message text, uploaded photo data, or CRM IDs to GA4/Clarity. Event parameters should stay limited to service/category/form type/page path.

GA4 dashboard steps:

1. GA4 → Admin → Data display → Events.
2. Wait for events to appear after deployment and test traffic.
3. Mark as key events:
   - `generate_lead`
   - `quote_form_submit`
   - `quote_modal_submit`
   - optionally `phone_click` and `sms_click` if calls/texts are primary conversion actions.
4. Build a funnel/exploration:
   - page_view → `cta_click` or `quote_modal_open` → `form_start` → `generate_lead`.

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

This PR only prepares the CSP and Clarity-compatible event helper. It does not add the live Clarity project ID because that ID must come from the Clarity dashboard.

## Bing Webmaster Tools

Recommended setup:

1. Go to Bing Webmaster Tools.
2. Add site `https://asap.repair/` or import from Google Search Console if available.
3. Submit sitemap: `https://asap.repair/sitemap.xml`.
4. If Bing requires HTML meta verification, add the provided `msvalidate.01` meta tag to every page head or use a static verification file if Bing offers one.
5. Submit key URLs for indexing:
   - `/`
   - `/services/`
   - high-intent service pages such as TV mounting, furniture assembly, plumbing, electrical, appliance services, painting, flooring.

## Ahrefs Webmaster Tools

Recommended setup:

1. Add project for `asap.repair`.
2. Prefer GSC import/verification when possible.
3. Crawl scope:
   - include subfolders under `/services/`, `/blog/`, `/case-studies/`;
   - respect robots.txt;
   - use canonical URLs.
4. Initial checks to watch:
   - broken internal links;
   - missing/duplicate titles and meta descriptions;
   - orphan service pages;
   - 404s from old service URLs;
   - slow/heavy pages flagged by crawl.

## PageSpeed / Lighthouse automation

PageSpeed Insights API currently returns 429 on this environment, so the no-API fallback is local Lighthouse.

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
- Do not merge to `main` without explicit GO because Cloudflare Pages auto-deploys `main`.
- Do not add production Clarity/Bing verification IDs unless they come from the provider dashboards and Nikita approves the exact ID/source.
