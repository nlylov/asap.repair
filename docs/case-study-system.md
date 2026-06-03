# Repair ASAP Case Study System

This site uses case studies as proof assets for service SEO and conversion.

## Core rule

One real project = one canonical case-study URL.

Do not publish one page per date, album, individual photo batch, or tiny task. A strong case study should tell a real before/process/after story and link to the services involved.

## Public URL pattern

```text
/case-studies/{project-slug}/
```

Example:

```text
/case-studies/crown-royal-barbershop-renovation-manhattan/
```

## Data source

Published projects live in:

```text
_data/case-studies.json
```

Run the generator after adding or editing records:

```bash
python3 scripts/generate-case-studies.py
```

The generator writes:

- static detail pages under `/case-studies/{slug}/`
- static `/case-studies/index.html`
- public related-content data at `/assets/data/case-studies.json`
- generated sitemap entries

## Image assets

Store optimized WebP files under:

```text
assets/case-studies/{slug}/
```

Recommended public gallery stages:

- `before` — rough/old condition
- `process` — meaningful work progress, not every messy frame
- `detail` — custom finishes or trust-building close-ups
- `after` — final result

Avoid publishing:

- client/private documents or permits
- residential full addresses unless explicitly approved
- faces/reflections when not needed
- repetitive blurry process shots
- messy frames that do not improve the story

## SEO strategy

Service pages remain the primary SEO landing pages. Case studies support them as proof.

Each strong case study should link to relevant service pages, for example:

- drywall repair
- flooring installation
- interior painting
- plumbing/leak repair
- electrical/light fixture installation
- general repairs

Service pages use `components/related-content.js`, which now reads same-origin static data first and can show related case studies by category.

## Category policy

Use categories and tags for matching and future hubs, but do not create indexable tag pages automatically.

Good future hubs if enough projects exist:

- `/case-studies/commercial-renovation/`
- `/case-studies/bathroom-remodel/`
- `/case-studies/tile-installation/`
- `/case-studies/manhattan/`

Avoid crawl traps like every service + borough + tag combination unless the hub has unique copy and multiple substantial projects.

## Publishing policy for many future projects

- Publish high-value, visual, multi-scope projects as full indexable case studies.
- Consolidate small/repetitive jobs into service-page galleries or non-indexed support content.
- Keep slugs stable forever once published.
- Keep all image and text data in the structured record so index pages, related-content widgets, sitemap, and LLM-facing content can be regenerated consistently.
