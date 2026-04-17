# AGENTS — asap.repair

> **This is a static marketing site + a thin layer of Cloudflare Pages
> Functions for edge forwarders.** It is NOT the application. The application
> is `bazas-crm` (Next.js, Railway).

## Repos in this ecosystem

| Repo | Purpose | Status |
|------|---------|--------|
| `bazas-crm` | Next.js app, all business logic, AI, DB, dashboards | **Active — main repo for any new logic** |
| `bazas-proxy` | Tiny Express HTTP forwarder for legacy vendor URLs | **Decommissioning — DO NOT extend** |
| `asap.repair` (you are here) | Static site + edge forwarders for vendor webhooks registered against the asap.repair domain | **Active (frontend + edge proxies only)** |

## What this repo is

1. **Static marketing site** for the Repair ASAP white-label brand — HTML/CSS/JS assets served from Cloudflare Pages at https://asap.repair.
2. **Embedded chat widget** that talks to the CRM (`crm.asap.repair/api/widget/*`) — never calls anything in this repo.
3. **Cloudflare Pages Functions** under `functions/` for edge forwarding of webhooks whose vendor URLs are registered against the `asap.repair` domain and cannot be moved.

## Edge forwarders

Cloudflare Pages Functions live in `functions/api/...`. Each one is a thin
proxy that takes an incoming request to `https://asap.repair/api/...` and
forwards it to the corresponding endpoint on `crm.asap.repair`, preserving
method, body, and relevant headers.

| Path on asap.repair | Forwards to | Why it exists |
|---------------------|-------------|---------------|
| `POST /api/webhooks/thumbtack` | `https://crm.asap.repair/api/webhooks/thumbtack` | Thumbtack API access was approved against the asap.repair domain. Vendor does not allow easy webhook URL change after approval. |

To add a new edge forwarder, model it after `functions/api/webhooks/thumbtack.js`
(uses Web Fetch API, copies safe headers, returns upstream response verbatim).

## Recent changes (April 2026)

This repo was lightly modified during the proxy decommissioning sprint:

- **#15** — Frontend rewired to call `crm.asap.repair/api/widget/*` instead of the legacy `repair-asap-proxy-production.up.railway.app/api/*`. Touched `chat.js`, `main.js`, `quote-modal.js`, `photo-drop.js`, `reviews/index.html`.
- **#16** — Added `functions/api/webhooks/thumbtack.js` Cloudflare Pages Function so Thumbtack's registered webhook URL keeps working without contacting Thumbtack support.

## What to do here vs in bazas-crm

| Change category | Where it goes |
|-----------------|---------------|
| Marketing copy, page layout, branding, CSS, marketing JS | **Here** (`*.html`, `*.css`, top-level JS) |
| Chat widget UI / behavior | **Here** (`chat.js`) — but ONLY UI/UX. The actual chat logic (LLM, KB, conversation persistence) lives in CRM. |
| New edge forwarder for a vendor webhook tied to asap.repair domain | **Here** (`functions/api/...`) |
| Adding a new lead source, AI behavior, calendar feature, dashboard | **bazas-crm**, never here |
| New backend API for the widget | **bazas-crm** at `app/api/widget/...`, then call it from here |

## Hard rules

1. **No business logic in `functions/`.** Edge forwarders must remain dumb proxies. If a webhook needs custom processing, do it in `bazas-crm` and have the function forward there.
2. **CSP**: the static site's `_headers` file enforces a strict CSP. Any new external script/iframe needs to be allowlisted there.
3. **Frontend never calls `bazas-proxy`.** All API calls go to `crm.asap.repair` directly. If you find a leftover `repair-asap-proxy-production.up.railway.app` URL anywhere in `*.js`/`*.html`, replace it.
4. **Cloudflare Pages auto-deploys** on push to `main`. There is no separate deploy step.

## Open user actions related to this repo

None — the asap.repair side of the proxy migration is complete. Pending
actions are in vendor dashboards and the `bazas-proxy` Railway service. See
`bazas-proxy/MIGRATION-PATH.md` for the full checklist.

## Quick commands

```bash
# Local preview (any static server works)
npx serve .

# After push to main, watch Cloudflare Pages deploy:
# https://dash.cloudflare.com → Pages → asap-repair → Deployments
```
