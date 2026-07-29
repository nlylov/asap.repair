# Commercial Refrigeration Intent and Similarity Inventory

Date: 2026-07-29
Scope: read-only Phase 2 preparation. No merge, redirect, noindex, URL removal, or commercial-page rewrite is authorized by this inventory.

## Method

- Source: the canonical local HTML under `services/appliance-services/`.
- Text comparison: visible text inside `<main>`, with scripts, styles, markup, entities, punctuation, and repeated whitespace removed.
- Similarity metric: Jaccard similarity over unique five-word shingles. The score shown is the highest peer score for that page.
- Reused assets: distinct `src` and `data-full` references inside `<main>`. A full image and its thumbnail are counted as separate references because both are shipped by the page.
- Internal links: unique root-relative links inside `<main>`; header and footer navigation are excluded.
- Recommendations are hypotheses for Phase 2. Fresh GSC query/page data and verified job evidence are required before consolidation or substantial rewrites.

## Inventory

| URL | Primary intent | Highest five-word similarity | Reused assets | Current internal links | Future action |
|---|---|---:|---|---|---|
| `/services/appliance-services/commercial-refrigeration/` | Broad commercial refrigeration triage for temperature, airflow, coils, doors, gaskets, and maintenance fit | 0.260 vs restaurant refrigeration | 17 references; same hero and eight-photo full/thumbnail set used by six equipment child pages | General-hub set | **Keep** as the umbrella intake page; add verified equipment-specific proof in Phase 2 |
| `/services/appliance-services/reach-in-cooler-repair/` | Reach-in cooler temperature, coil, airflow, door, and gasket triage | 0.634 vs restaurant refrigeration | Same 17-reference commercial set | Commercial-child set | **Differentiate** with reach-in symptoms, controls, door/gasket checks, and matching jobs |
| `/services/appliance-services/walk-in-cooler-repair/` | Walk-in cooler temperature, door, gasket, frost, and 41°F triage | 0.637 vs restaurant refrigeration | Same 17-reference commercial set | Commercial-child set | **Differentiate** with box access, door hardware, strip curtains, drainage, and matching jobs |
| `/services/appliance-services/prep-table-refrigerator-repair/` | Prep-table pan-rail, airflow, coil, door, and food-service temperature triage | 0.633 vs restaurant refrigeration | Same 17-reference commercial set | Commercial-child set | **Differentiate** with pan-rail loading, service-line workflow, cleaning access, and matching jobs |
| `/services/appliance-services/beverage-cooler-repair/` | Bar and beverage cooler airflow, door seal, controller, and temperature triage | 0.636 vs restaurant refrigeration | Same 17-reference commercial set | Commercial-child set | **Differentiate** with glass-door, under-counter, bar-access, and product-temperature evidence |
| `/services/appliance-services/commercial-freezer-repair/` | Commercial freezer frost, door seal, airflow, temperature, and defrost triage | 0.634 vs restaurant refrigeration | Same 17-reference commercial set | Commercial-child set | **Differentiate** with freezer-specific frost patterns, target temperatures, door heat, and matching jobs |
| `/services/appliance-services/restaurant-refrigeration-repair/` | Broad restaurant refrigeration intake spanning walk-ins, reach-ins, prep tables, and freezers | 0.637 vs walk-in cooler | Same 17-reference commercial set | Commercial-child set | **Consider merge** into the commercial hub if fresh GSC shows no distinct demand or conversions; otherwise differentiate around multi-unit restaurant triage |
| `/services/appliance-services/ice-machine-repair/` | Low-ice, filter, condenser, sanitation, and repair-or-specialist triage | 0.475 vs restaurant refrigeration | 9 references; same hero and four-photo full/thumbnail set as ice-machine cleaning | Commercial-child set | **Differentiate** from cleaning around production symptoms, error codes, water supply, and referral boundaries |
| `/services/appliance-services/ice-machine-cleaning/` | Scale, slime, filter, condenser, and accessible sanitation cleaning | 0.185 vs ice-machine repair | Same 9-reference ice-machine set | Ice-cleaning set | **Keep**; add documented cleaning stages and verified before/after proof |

## Current link sets

### General-hub set

- `/reviews/`
- `/services/appliance-services/ice-machine-cleaning/`
- `/services/appliance-services/appliance-repair/`
- `/services/appliance-services/refrigerator-repair/`
- `/services/general-repairs/coi-handyman/`
- `/for-restaurants/`
- `/preventive-maintenance/`
- `/services/plumbing/leak-repair/`

### Commercial-child set

Each child links to 13 unique internal destinations: `/reviews/`, the commercial refrigeration hub, ice-machine cleaning, `/for-restaurants/`, the other applicable equipment child pages, preventive maintenance, leak repair, and electrical troubleshooting. The equipment links are generated with the current page omitted.

The full candidate equipment set is:

- `/services/appliance-services/reach-in-cooler-repair/`
- `/services/appliance-services/walk-in-cooler-repair/`
- `/services/appliance-services/prep-table-refrigerator-repair/`
- `/services/appliance-services/beverage-cooler-repair/`
- `/services/appliance-services/commercial-freezer-repair/`
- `/services/appliance-services/restaurant-refrigeration-repair/`
- `/services/appliance-services/ice-machine-repair/`

### Ice-cleaning set

- `/reviews/`
- `/services/appliance-services/commercial-refrigeration/`
- `/services/appliance-services/appliance-repair/`
- `/services/appliance-services/refrigerator-repair/`
- `/services/general-repairs/coi-handyman/`
- `/services/plumbing/leak-repair/`
- `/services/plumbing/shut-off-valve-installation/`
- `/services/electrical/electrical-troubleshooting/`

## Cluster-level findings

- The six equipment child pages form a tight template cluster: pairwise five-word similarity is 0.612-0.637.
- Those six pages plus the commercial hub reuse the same hero and the same eight gallery images, represented by 17 in-page asset references per page.
- Ice-machine repair and ice-machine cleaning reuse the same hero and four gallery images, but their visible-text similarity is much lower because the cleaning page has a materially different intent.
- The restaurant page has the broadest intent overlap. It is the first consolidation candidate, but only after fresh GSC landing-page queries, impressions, clicks, conversions, and verified job evidence are available.

## Phase 2 evidence gate

Before any action marked `differentiate` or `consider merge`:

1. Export fresh GSC page and query data for at least the last 90 days.
2. Confirm which equipment types Repair ASAP has actually serviced and which work can be documented truthfully.
3. Map each verified job to one primary page and reusable supporting pages.
4. Preserve URLs with distinct demand or conversions; use a redirect only after a content and query overlap review.
