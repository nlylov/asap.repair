# Case Study Visual Audit — 2026-07-08

Scope: desktop and mobile browser review of the 7 published case-study pages plus `/previews/one-bedroom-renovation-draft/`.

## Fixed in this pass

- Case-study mobile hero now shows the project photo before the long copy, so users see real work on the first screen.
- Mobile hero images are height-limited to avoid portrait photos pushing the title and CTA too far down.
- Desktop hero layout is slightly denser and long H1 wrapping is reduced.
- Hero tags are limited to 6 visible tags to prevent mobile tag clouds from crowding the CTA.
- Overlong public titles were shortened while preserving local/service relevance.
- The public planter excerpt no longer contains the internal phrase "Corrected chronology".
- Case-study generator now preserves current cache-bust versions for analytics, CSS, loader, and main JS.
- Area-page generator was updated to avoid emitting stale analytics/cache-bust versions in future generated pages.
- Apartment turnover preview still stays `noindex`, but the visible internal contact-sheet audit block was removed.

## Current page-by-page notes

### Plastic Wall Panel Installation

Status: usable, but visually thin after the hero.

Needs: 1-2 stronger process photos or a clean before/after pairing. The current before gallery feels small because the best proof is mostly the final wall.

### Gazebo & Outdoor Kitchen

Status: one of the stronger money pages.

Needs: final outdoor kitchen close-ups and a clearer "why concrete footings mattered" proof block. This can support larger backyard/outdoor assembly jobs.

### Wood Table Refinishing

Status: good story and strong before condition.

Needs: a tighter before/after comparison near the top. The sticky polyurethane problem is valuable because it is specific, but the final result should be visually obvious faster.

### Queens Bathroom Build-Out

Status: strong service relevance for bathrooms, tile, waterproofing, plumbing fixture work, and flooring.

Needs: better finished-room hero or additional after photos if available. Current hero shows tile work well, but a full finished bathroom angle would sell better.

### Crown Royal Barbershop Renovation

Status: strongest commercial proof page.

Needs: more direct commercial CTA language and potentially a before/after strip near the top. This is the best proof asset for larger jobs and franchise/commercial trust.

### Mini-Split Drywall Repair

Status: useful SEO proof, but visually weakest hero.

Needs: before/after comparison near the top. The current hero shows the AC unit more than the repair result, so users may not immediately understand the transformation.

### Custom Wooden Planter With Built-In Bench

Status: improved after removing internal wording.

Needs: stronger before/process/after ordering and a clearer final-result intro. It can sell custom carpentry and outdoor assembly, but the story should feel less like project documentation.

### One-Bedroom Apartment Turnover Draft

Status: promising, but should remain unpublished/noindex until migrated into the case-study system.

Needs before publish:

- choose a canonical slug, likely `/case-studies/one-bedroom-apartment-turnover-nyc/`
- move structured data into `_data/case-studies.json`
- add related service links for painting, flooring, bathroom refresh, general repairs, and apartment turnover/move-in work
- confirm location/privacy wording before indexation
- select final hero and before/after photos from the existing album
- remove any remaining internal-only language before linking from `/case-studies/`

## Next Content Priority

1. Finish and publish the apartment turnover case study after privacy/location confirmation.
2. Upgrade Mini-Split Drywall Repair and Plastic Wall Panel Installation with stronger before/after proof.
3. Add commercial-focused copy improvements to Crown Royal Barbershop Renovation.
4. Then add new real jobs to portfolio using the same one-job, one-canonical-URL system.
