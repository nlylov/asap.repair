# Case Study Visual Audit — 2026-07-08

Scope: desktop and mobile browser review of the published case-study pages plus the former `/previews/one-bedroom-renovation-draft/` draft.

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
- Apartment turnover was migrated into the canonical case-study system at `/case-studies/one-bedroom-apartment-turnover-nyc/`.
- A reusable before/after comparison-pair block was added to the case-study generator.
- The apartment turnover service page now links directly to the new case study and references it from Service structured data.
- Plastic Wall Panel Installation and Mini-Split Drywall Repair now use top-of-page before/after comparison proof blocks.

## Current page-by-page notes

### Plastic Wall Panel Installation

Status: improved with a top-of-page before/after proof block.

Needs: future close-up final photos if available. The current proof now shows the room wall transformation and outlet-access detail near the top.

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

Status: improved with a top-of-page before/after proof block.

Needs: future tighter final detail photo if available. The current proof now shows open drywall cutouts versus the clean painted wall near the top.

### Custom Wooden Planter With Built-In Bench

Status: improved after removing internal wording.

Needs: stronger before/process/after ordering and a clearer final-result intro. It can sell custom carpentry and outdoor assembly, but the story should feel less like project documentation.

### One-Bedroom Apartment Turnover

Status: published as a canonical case study at `/case-studies/one-bedroom-apartment-turnover-nyc/`.

Completed:

- canonical slug selected: `/case-studies/one-bedroom-apartment-turnover-nyc/`
- structured data moved into `_data/case-studies.json`
- related service links added for apartment turnover, painting, flooring, caulking, window repair, and drywall repair
- location/privacy wording kept broad as `New York, NY`
- final hero and before/after photos selected from the existing album
- preview URL redirected to the canonical case-study URL
- apartment turnover service page linked directly to this case study

## Next Content Priority

1. Add commercial-focused copy improvements to Crown Royal Barbershop Renovation.
2. Add a tighter before/after comparison near the top of Wood Table Refinishing.
3. Then add new real jobs to portfolio using the same one-job, one-canonical-URL system.
