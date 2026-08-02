#!/usr/bin/env node
/*
 * Make the website a PROJECTION of the CRM pricing catalog instead of a second price list.
 *
 * ── The failure this removes ───────────────────────────────────────────────────────────
 * Until now asap.repair carried its own numbers, hand-edited, and the CRM carried different
 * numbers, also hand-edited. Nothing compared them. That is how 192 calculator cells came to
 * publish a price below the owner's $150 work minimum and how services/index.html came to tell
 * Google, in structured data, that work starts at $99.
 *
 * From here every figure the site renders is WRITTEN BY THIS SCRIPT. That is not the same claim
 * as "every figure is a catalog figure", and the difference matters:
 *
 *   COUNTS: total=1333 catalogOrContract=85 carryForward=1134 nonWorkPaths=114
 *
 * 85 cells come from a catalog tier or from a figure the contract states literally; 1,134 are
 * the previous version's cells moved only by the owner's two decided rules; the remaining 114
 * are the $0 photo-estimate, $99 assessment and frozen-gas paths, which are not work prices at
 * all. tests/pricing-catalog-projection.test.mjs parses that COUNTS line and checks it against
 * the generated report, so this comment cannot go stale the way its first draft did.
 *
 * What IS true of all 1,333 is that no human types them into a page any more. Editing a price on
 * the site is not possible: you edit the catalog in the CRM, re-vendor it, and re-run this.
 * `--check` re-derives everything in memory and fails if a committed file differs by one byte,
 * so drift is a red test rather than a customer seeing a number nobody agreed to.
 *
 * ── What it does NOT do, and why ───────────────────────────────────────────────────────
 * It does not invent the 1,134 cells the catalog does not carry. docs/pricing-website-contract.md
 * §4 says proposal sections 2.1-2.8 — the per-hub cell tables — were truncated out of the catalog
 * lane's input, and instructs: "Do not treat the absence of a cell here as 'unchanged'; treat it
 * as 'still to be taken from proposal §2.1-2.8'." 80 services and 204 tiers cannot fill 1,333
 * slots honestly. So an unbound cell is carried forward from the frozen calc-2026-08-01 table and
 * passed through the two rules the owner has already ruled on — the $150 work minimum and
 * monotonicity — and its provenance says exactly that. pricing/calculator-price-projection.json
 * reports the count so the gap is a number on the page, not a silence.
 *
 * ── Outputs ────────────────────────────────────────────────────────────────────────────
 *   pricing/price-tables/<version>.json        the resolved table, frozen once shipped
 *   pricing/calculator-price-projection.json   every cell with its provenance and any delta
 *   pricing/catalog/index.json                 { live, versions[] } for the CRM's cross-repo cron
 *   components/modules/calculator.js           CALC_PRICE_VERSION + every `pricing:` block
 *   main.js                                    REPAIR_ASAP_CALC_PRICE_VERSION
 *   assets/data/hub-calculators.json           regenerated from the rewritten leaf prices
 *   llms.txt, llms-full.txt                    the example-price block LLM crawlers read as canon
 *   the blog price tables + new-apartment-setup  prices written into page copy (see proseFigures)
 *
 * Usage:  node scripts/generate-calculator-prices.mjs [--check]
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { buildHubCalculators } from './generate-hub-calculators.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const CHECK = process.argv.includes('--check');

/* The sha256 of the catalog we are allowed to render. Same literal as
   PRICING_CATALOG_CHECKSUMS in bazas-crm/lib/pricing/catalog.ts. A vendored copy that drifts by
   a single whitespace character fails here, on this repo's CI, instead of at a customer. */
export const CATALOG_VERSION = 'calc-2026-09-01';
export const CATALOG_SHA256 = 'bd75b7b92e0e7d3a8b6d415b64766a85ed810325003cdb35065fb84916eda52b';
export const PREVIOUS_VERSION = 'calc-2026-08-01';
/* The frozen previous table is an INPUT this script carries 1,134 cells forward from, so a
   silent edit to it would move a third of the site's prices and still leave every generated
   file self-consistent. It is pinned the same way the catalog is. It is also the only thing an
   old lead can be verified against, so editing it would rewrite history. */
export const PREVIOUS_TABLE_SHA256 = '7e171fae30940eb6d93a5493d3b5cf52c8b2c8b5f0dd4dfd1db2043cd60b836f';

const p = (...parts) => join(ROOT, ...parts);
const read = (rel) => readFileSync(p(rel), 'utf8');
const readJson = (rel) => JSON.parse(read(rel));

// ── Inputs ────────────────────────────────────────────────────────────────────────────

export function loadCatalog() {
    const raw = read(`pricing/catalog/${CATALOG_VERSION}.json`);
    const sha = createHash('sha256').update(raw).digest('hex');
    if (sha !== CATALOG_SHA256) {
        throw new Error(
            `pricing/catalog/${CATALOG_VERSION}.json does not match the pinned checksum.\n` +
            `  expected ${CATALOG_SHA256}\n  actual   ${sha}\n` +
            'The vendored catalog must be a byte-identical copy of the CRM file. Re-copy it; do not edit it here.',
        );
    }
    const catalog = JSON.parse(raw);
    if (catalog.pricingVersion !== CATALOG_VERSION) throw new Error('catalog pricingVersion mismatch');
    if (catalog.status !== 'live') throw new Error(`catalog status is "${catalog.status}"; the site renders only "live"`);
    if (catalog.tenantSlug !== 'repair-asap') throw new Error('catalog belongs to another tenant');
    return catalog;
}

/** service key -> service, and 'service#tier' -> tier. */
function indexCatalog(catalog) {
    const services = new Map();
    const tiers = new Map();
    const addOns = new Map();
    for (const service of catalog.services) {
        services.set(service.key, service);
        for (const tier of service.tiers || []) tiers.set(`${service.key}#${tier.id}`, tier);
    }
    for (const addOn of catalog.addOns) addOns.set(addOn.key, addOn);
    return { services, tiers, addOns };
}

// ── The projection ────────────────────────────────────────────────────────────────────

const isAssessmentCell = ([lo, hi]) => lo === 99 && hi === 99;
const isFreePhotoCell = ([lo, hi]) => lo === 0 && hi === 0;

/**
 * Resolve one config's ladders.
 *
 * Order matters and is the whole design: a catalog tier beats the contract, the contract beats a
 * carry-forward, and the floor/monotonic rules run last over whatever is left — never over a
 * frozen, assessment or free-photo cell.
 */
function projectConfig({ configKey, previous, map, index, constants, sizeOrders }) {
    const out = {};
    const cells = [];

    const tierMap = map.tierBindings[configKey] || {};
    const contractMap = map.contractCells[configKey] || {};
    const anchors = map.floorAnchors[configKey] || {};
    const frozenGas = new Set(
        map.repairMinimumExempt.frozenGas
            .filter(([cfg]) => cfg === configKey)
            .map(([, series]) => series),
    );

    for (const [series, sizes] of Object.entries(previous)) {
        const order = sizeOrders[configKey]?.[series] || Object.keys(sizes);
        const resolved = {};
        const provenance = {};

        // 1. per-cell overrides
        for (const size of order) {
            const before = sizes[size];
            const tierRef = tierMap[series]?.[size];
            const contractValue = contractMap[series]?.[size];
            /* A step the picker declares but the previous version never priced. Legitimate only
               when the catalog or the contract states its value outright — otherwise there is
               nothing to carry forward and nothing to derive, and inventing one is exactly what
               this script refuses to do. (Codex round 2: interior-painting needed a fourth
               apartment step so the picker's 3BR+ option could stop being priced off the
               catalog's 2BR row.) */
            if (!before && !tierRef && !contractValue) {
                throw new Error(
                    `${configKey}.${series}.${size} is offered by the calculator but has no price: it is not in the ` +
                    `frozen ${PREVIOUS_VERSION} table and site-map.json binds it to neither a catalog tier nor a ` +
                    'contract figure. Bind it, or remove the option.',
                );
            }
            if (tierRef) {
                const tier = index.tiers.get(tierRef);
                if (!tier) throw new Error(`site-map.json points at a tier that does not exist: ${tierRef}`);
                resolved[size] = [tier.lo, tier.hi];
                provenance[size] = { source: 'catalog:tier', ref: tierRef, was: before || null };
            } else if (contractValue) {
                resolved[size] = [contractValue[0], contractValue[1]];
                provenance[size] = { source: 'contract:section-4', ref: contractMap._source, was: before || null };
            } else {
                resolved[size] = [before[0], before[1]];
                provenance[size] = { source: 'carry-forward', was: before };
            }
        }

        // 2. exemptions — these ladders are never lifted and never monotonic-repaired
        if (frozenGas.has(series)) {
            for (const size of order) {
                provenance[size] = {
                    source: 'frozen:gas',
                    ref: 'Local Law 429 (2025) — Licensed Master Plumber; catalog status "frozen"',
                    was: sizes[size],
                };
            }
            out[series] = resolved;
            for (const size of order) cells.push({ configKey, series, size, value: resolved[size], ...provenance[size] });
            continue;
        }
        const everyCellIsAssessment = order.every((size) => isAssessmentCell(resolved[size]));
        if (everyCellIsAssessment) {
            for (const size of order) provenance[size] = { source: 'assessment:99', was: sizes[size] };
            out[series] = resolved;
            for (const size of order) cells.push({ configKey, series, size, value: resolved[size], ...provenance[size] });
            continue;
        }

        /* 2b. Inside a mixed ladder — the repair/diagnostic pages price a free photo estimate, a
               $99 credited assessment and a defined work path side by side — the two non-work
               paths are named for what they are and never touched by the floor. Rendering the
               $99 assessment as $150 would state a work price nobody quoted; rendering the free
               photo estimate as $150 would put a price on the thing we advertise as free. */
        for (const size of order) {
            if (isAssessmentCell(resolved[size])) provenance[size] = { source: 'assessment:99', was: sizes[size] };
            else if (isFreePhotoCell(resolved[size])) provenance[size] = { source: 'photo:free', was: sizes[size] };
        }

        // 3. the floor. One additive delta for the whole ladder, so spans and the gaps between
        //    steps survive exactly and the lift cannot invert anything it did not already invert.
        const workSizes = order.filter((size) => !isAssessmentCell(resolved[size]) && !isFreePhotoCell(resolved[size]));
        const lowest = Math.min(...workSizes.map((size) => resolved[size][0]));
        if (workSizes.length && lowest < constants.repairMinimum) {
            const anchorRef = anchors[series] || anchors['*'];
            const anchor = resolveAnchor(anchorRef, index, constants.repairMinimum);
            const delta = anchor.value - lowest;
            for (const size of workSizes) {
                if (provenance[size].source !== 'carry-forward') continue; // a catalog/contract cell is never moved
                resolved[size] = [resolved[size][0] + delta, resolved[size][1] + delta];
                provenance[size] = {
                    source: 'carry-forward:lift',
                    delta,
                    anchor: anchor.label,
                    was: provenance[size].was,
                };
            }
        }

        // 4. monotonicity along the declared size order
        let prevLo = -Infinity;
        let prevHi = -Infinity;
        for (const size of order) {
            if (isAssessmentCell(resolved[size]) || isFreePhotoCell(resolved[size])) continue;
            let [lo, hi] = resolved[size];
            let touched = false;
            if (lo < prevLo) { lo = prevLo; touched = true; }
            if (hi < prevHi) { hi = prevHi; touched = true; }
            if (hi <= lo) { hi = lo + 5; touched = true; }
            if (touched) {
                resolved[size] = [lo, hi];
                provenance[size] = { ...provenance[size], source: `${provenance[size].source}+monotonic` };
            }
            prevLo = lo;
            prevHi = hi;
        }

        out[series] = resolved;
        for (const size of order) cells.push({ configKey, series, size, value: resolved[size], ...provenance[size] });
    }

    return { pricing: out, cells };
}

function resolveAnchor(ref, index, fallback) {
    if (!ref) return { value: fallback, label: `repairMinimum ${fallback}` };
    if (ref.includes('#')) {
        const tier = index.tiers.get(ref);
        if (!tier) throw new Error(`floorAnchors points at a tier that does not exist: ${ref}`);
        return { value: Math.max(tier.lo, fallback), label: `${ref} lo ${tier.lo}` };
    }
    const service = index.services.get(ref);
    if (!service) throw new Error(`floorAnchors points at a service that does not exist: ${ref}`);
    return { value: Math.max(service.range.lo, fallback), label: `${ref} range.lo ${service.range.lo}` };
}

// ── calculator.js surgery ─────────────────────────────────────────────────────────────

/* Every config's price grid opens its own line, as `pricing: {`, `"pricing": {` or
   `'pricing': {`, at whatever indentation that config happens to sit at — the file has three
   different key-quoting styles in it and one config nested a level deeper than the rest. The
   single-line `pricing: { photo: [0, 0], ... }` inside VISIT_PATH_OPTIONS is a function body, not
   a config; the trailing `{$` is what excludes it.

   The owner of a block is the nearest preceding key at a SHALLOWER indentation. Two things about
   that are load-bearing, both learned the hard way:

     - the key pattern accepts all three quote styles. The first draft matched only bare and
       double-quoted keys, so every single-quoted config ('wall-mounted', 'ac-window', 'closet-
       system', …) was skipped by the scan and nine grids were about to be overwritten with a
       neighbouring config's prices.
     - the indentation must be strictly shallower. A key at the same depth as `pricing:` is a
       sibling field, not the owner.

   Identification is structural on purpose rather than content-addressed (Codex round 2, finding
   3): a content fingerprint follows the numbers, so two grids physically swapped between their
   config bodies would regenerate byte-for-byte and `--check` would pass on a file that quotes
   desk prices for dressers. Structural attribution cannot do that, and rewriteCalculatorJs()
   proves the result by re-evaluating the file it just wrote. */
const PRICING_BLOCK = /^(\s*)['"]?pricing['"]?: \{$/;
const OBJECT_KEY = /^(\s*)(?:'([^']+)'|"([^"]+)"|([A-Za-z0-9_$-]+)): \{$/;

function locatePricingBlocks(src, previousTable, projection) {
    const lines = src.split('\n');
    const blocks = [];
    let offset = 0;
    const lineStart = lines.map((line) => { const at = offset; offset += line.length + 1; return at; });
    const known = new Set([...Object.keys(previousTable), ...Object.keys(projection)]);

    for (let i = 0; i < lines.length; i += 1) {
        const hit = PRICING_BLOCK.exec(lines[i]);
        if (!hit) continue;
        const indent = hit[1];
        let owner = null;
        for (let j = i - 1; j >= 0; j -= 1) {
            const key = OBJECT_KEY.exec(lines[j]);
            if (!key) continue;
            if (key[1].length >= indent.length) continue; // sibling field, keep looking outward
            owner = key[2] ?? key[3] ?? key[4];
            break;
        }
        if (!owner) throw new Error(`could not find the config that owns the pricing block on line ${i + 1}`);
        if (!known.has(owner)) {
            throw new Error(
                `the pricing block on line ${i + 1} of calculator.js belongs to "${owner}", which is in neither the ` +
                `frozen ${PREVIOUS_VERSION} table nor the projection. Add it to the frozen table (a new config is a ` +
                'new version) or remove it.',
            );
        }
        const open = lineStart[i] + lines[i].length - 1; // the '{'
        blocks.push({ configKey: owner, open, close: matchBrace(src, open), indent });
    }

    const seen = blocks.map((b) => b.configKey);
    const duplicated = seen.filter((k, n) => seen.indexOf(k) !== n);
    if (duplicated.length) throw new Error(`two pricing blocks claim the same config: ${[...new Set(duplicated)].join(', ')}`);

    const missing = Object.keys(previousTable).filter((k) => !seen.includes(k));
    /* The eight visit-mode configs are built by visitConfig() at runtime and have no literal
       block, so they are legitimately absent. Anything else missing is a locator failure. */
    const unexplained = missing.filter((k) => !VISIT_MODE_CONFIGS.has(k));
    if (unexplained.length) throw new Error(`no pricing block found in calculator.js for: ${unexplained.join(', ')}`);
    return blocks;
}

function matchBrace(src, open) {
    let depth = 0;
    for (let i = open; i < src.length; i += 1) {
        const ch = src[i];
        if (ch === '{') depth += 1;
        else if (ch === '}') { depth -= 1; if (depth === 0) return i; }
    }
    throw new Error('unbalanced brace while locating a pricing block');
}

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const key = (k) => (IDENT.test(k) ? k : `'${k}'`);

/** One canonical rendering for every block — the byte-identity check needs exactly one.
 *  `indent` is the block's own indentation, so a config nested a level deeper keeps its shape. */
function renderPricing(pricing, indent) {
    const rows = Object.entries(pricing).map(([series, sizes]) => {
        const cells = Object.entries(sizes)
            .map(([size, [lo, hi]]) => `${key(size)}: [${lo}, ${hi}]`)
            .join(', ');
        return `${indent}    ${key(series)}: { ${cells} }`;
    });
    return `{\n${rows.join(',\n')}\n${indent}}`;
}

/* Built by visitConfig() at runtime from VISIT_PATH_OPTIONS — free photo estimate, $99 credited
   assessment, and a defined-work path already held at the $150 minimum. No literal grid exists
   for them in the file, and none should: they are paths, not a price table. */
const VISIT_MODE_CONFIGS = new Set([
    'refrigerator-repair', 'dishwasher-repair', 'washer-repair', 'dryer-repair',
    'oven-range-repair', 'ac-repair-help', 'commercial-refrigeration', 'appliance-repair',
]);

function rewriteCalculatorJs(src, projection, previousTable) {
    const blocks = locatePricingBlocks(src, previousTable, projection);
    let out = '';
    let cursor = 0;
    for (const block of blocks) {
        const pricing = projection[block.configKey];
        if (!pricing) throw new Error(`no projection for config "${block.configKey}"`);
        out += src.slice(cursor, block.open) + renderPricing(pricing, block.indent);
        cursor = block.close + 1;
    }
    out += src.slice(cursor);

    /* Prove the splice landed where it was meant to, by reading the result back the way the
       browser will. Without this, `--check` only guarantees the file is a fixed point of the
       generator — which a file with two grids in each other's slots can also be. */
    const written = evalConfigs(out);
    for (const [configKey, pricing] of Object.entries(projection)) {
        if (VISIT_MODE_CONFIGS.has(configKey)) continue;
        const got = written[configKey]?.pricing;
        if (JSON.stringify(got) !== JSON.stringify(pricing)) {
            throw new Error(
                `after rewriting calculator.js, config "${configKey}" does not hold its own projected grid. ` +
                'The splice put a price table in the wrong place; nothing was written.',
            );
        }
    }

    const versionLine = /^const CALC_PRICE_VERSION = '[^']+';$/m;
    if (!versionLine.test(out)) throw new Error('CALC_PRICE_VERSION declaration not found in calculator.js');
    out = out.replace(versionLine, `const CALC_PRICE_VERSION = '${CATALOG_VERSION}';`);
    return { source: out, configsRewritten: blocks.length };
}

function rewriteMainJs(src) {
    const versionLine = /^const REPAIR_ASAP_CALC_PRICE_VERSION = '[^']+';$/m;
    if (!versionLine.test(src)) throw new Error('REPAIR_ASAP_CALC_PRICE_VERSION declaration not found in main.js');
    return src.replace(versionLine, `const REPAIR_ASAP_CALC_PRICE_VERSION = '${CATALOG_VERSION}';`);
}

// ── llms.txt / llms-full.txt ──────────────────────────────────────────────────────────

const money = (n) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

function renderAiGuideBlock(map, index, constants) {
    const lines = [
        `- On-site assessment visit: ${money(constants.assessmentVisitFee)}, credited toward the job if you ` +
        'proceed (photo and text estimates are free). ' +
        `${money(constants.assessmentVisitFee)} is never the price of work — work performed starts at the ` +
        `${money(constants.repairMinimum)} minimum.`,
    ];
    for (const { label, ref } of map.aiGuideExamples.lines) {
        const [lo, hi, unit] = resolveRefRange(ref, index, null);
        lines.push(`- ${label}: ${money(lo)}–${money(hi)}${unit}`);
    }
    lines.push(
        `- Work minimum: ${money(constants.repairMinimum)} for any work performed on a visit. NYC sales tax ` +
        `(${(constants.salesTaxRate * 100).toFixed(3)}%) is added separately and is never inside a quoted figure.`,
    );
    return lines.join('\n');
}

const UNIT_SUFFIX = {
    per_sqft: ' per square foot',
    per_linear_ft: ' per linear foot',
    per_hour: ' per hour',
    per_unit: ' each',
};

function resolveRefRange(ref, index, projection) {
    if (ref.startsWith('addon:')) {
        const addOn = index.addOns.get(ref.slice('addon:'.length));
        if (!addOn) throw new Error(`ref points at an add-on that does not exist: ${ref}`);
        return [addOn.lo, addOn.hi, UNIT_SUFFIX[addOn.unitBasis] || ''];
    }
    if (ref.startsWith('site:')) {
        /* A figure quoted from the site's own generated calculator, so an article and the
           calculator on the same page can never disagree about the same job. */
        const [configKey, series, size] = ref.slice('site:'.length).split('.');
        const ladder = projection?.[configKey]?.[series];
        if (!ladder) throw new Error(`ref points at a calculator ladder that does not exist: ${ref}`);
        if (size) {
            const cell = ladder[size];
            if (!cell) throw new Error(`ref points at a calculator cell that does not exist: ${ref}`);
            return [cell[0], cell[1], ''];
        }
        const values = Object.values(ladder);
        return [Math.min(...values.map((v) => v[0])), Math.max(...values.map((v) => v[1])), ''];
    }
    if (ref.includes('#')) {
        const tier = index.tiers.get(ref);
        if (!tier) throw new Error(`aiGuideExamples points at a tier that does not exist: ${ref}`);
        const service = index.services.get(ref.split('#')[0]);
        return [tier.lo, tier.hi, UNIT_SUFFIX[service.unitBasis] || ''];
    }
    const service = index.services.get(ref);
    if (!service) throw new Error(`aiGuideExamples points at a service that does not exist: ${ref}`);
    return [service.range.lo, service.range.hi, UNIT_SUFFIX[service.unitBasis] || ''];
}

// ── Prices written into page copy ─────────────────────────────────────────────────────

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const withThousands = (n) => (Number.isInteger(n) ? n : n.toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const priceRange = (lo, hi, sep, prefix = '', suffix = '') =>
    `${prefix}$${withThousands(lo)}${sep}$${withThousands(hi)}${suffix}`;

/**
 * Rewrite the price next to a label, never the label itself. Anchoring on the label is what makes
 * this idempotent and what stops it from ever matching the wrong row: the pattern requires the
 * exact label immediately before the cell it writes into.
 */
function rewriteLabelledPrices(src, file, rows, pattern, sep, index, projection) {
    let out = src;
    for (const row of rows) {
        const [lo, hi] = resolveRefRange(row.ref, index, projection);
        const value = priceRange(lo, hi, sep, row.prefix || '', row.suffix || '');
        const re = pattern(escapeRe(row.label));
        const matches = out.match(new RegExp(re.source, `${re.flags}g`));
        if (!matches) throw new Error(`proseFigures: no row labelled "${row.label}" in ${file}`);
        if (matches.length > 1) throw new Error(`proseFigures: label "${row.label}" appears ${matches.length} times in ${file}; it must be unique`);
        out = out.replace(re, (_m, before, _old, after) => `${before}${value}${after}`);
    }
    return out;
}

/* A figure inside a plain-text sentence, anchored on the words either side of it rather than on
   the number — so re-running finds the same place and writes the same value. */
function rewriteInlineRanges(src, file, specs, index, projection) {
    let out = src;
    for (const spec of specs) {
        const [lo, hi] = resolveRefRange(spec.ref, index, projection);
        const re = new RegExp(`(${escapeRe(spec.before)})([^\n]*?)(${escapeRe(spec.after)})`, 'g');
        const matches = out.match(re);
        if (!matches) throw new Error(`proseFigures.inlineRanges: anchor not found in ${file}: "${spec.before}"`);
        if (matches.length > 1) throw new Error(`proseFigures.inlineRanges: anchor is not unique in ${file}: "${spec.before}"`);
        out = out.replace(re, (_m, before, _old, after) => `${before}${priceRange(lo, hi, spec.sep || '–')}${after}`);
    }
    return out;
}

const TABLE_ROW = (label) => new RegExp(`(<tr><td>${label}</td><td>)([^<]*)(</td></tr>)`);
const SIDEBAR_ROW = (label) =>
    new RegExp(`(<span class="sidebar-card__label">${label}</span><span class="sidebar-card__value">)([^<]*)(</span>)`);

function rewriteProseFigures(map, index, projection, constants, read) {
    const out = {};
    for (const spec of map.proseFigures.files) {
        let src = read(spec.file);
        if (spec.tableRows) src = rewriteLabelledPrices(src, spec.file, spec.tableRows, TABLE_ROW, ' – ', index, projection);
        if (spec.sidebarRows) src = rewriteLabelledPrices(src, spec.file, spec.sidebarRows, SIDEBAR_ROW, '–', index, projection);
        if (spec.inlineRanges) src = rewriteInlineRanges(src, spec.file, spec.inlineRanges, index, projection);
        src = rewritePriceSrcSpans(src, spec.file, index, constants);
        out[spec.file] = src;
    }
    return out;
}

/* An inline figure in a sentence or a heading, marked in the HTML as
       <span data-price-src="new-apartment-setup.rate">$125</span>
   The attribute is the contract (pricing-website-contract.md §6.4): the marker says which catalog
   figure the sentence is quoting, and the text inside is written by this generator. A price in
   prose is still a price, and this is how a sentence stops being a place where one can rot.
   Grammar: const.<name> · <service>.rate|.minCharge|.range · <service>#<tier>.range ·
            <service>.hours:N · <service>.hours:N-M   (an hourly rate multiplied out) */
const PRICE_SRC_SPAN = /(<span data-price-src="([^"]+)"[^>]*>)([^<]*)(<\/span>)/g;

function rewritePriceSrcSpans(src, file, index, constants) {
    return src.replace(PRICE_SRC_SPAN, (_m, open, ref, _old, close) => `${open}${resolvePriceSrc(ref, index, constants, file)}${close}`);
}

function resolvePriceSrc(ref, index, constants, file) {
    const fail = (why) => { throw new Error(`data-price-src="${ref}" in ${file}: ${why}`); };
    if (ref.startsWith('const.')) {
        const value = constants[ref.slice('const.'.length)];
        if (typeof value !== 'number') fail('no such catalog constant');
        return `$${withThousands(value)}`;
    }
    const [target, field] = [ref.slice(0, ref.lastIndexOf('.')), ref.slice(ref.lastIndexOf('.') + 1)];
    if (field === 'range') {
        const [lo, hi] = resolveRefRange(target, index, null);
        return priceRange(lo, hi, '–');
    }
    const service = index.services.get(target);
    if (!service) fail('no such catalog service');
    if (field === 'rate') return `$${withThousands(service.rate)}`;
    if (field === 'minCharge') return `$${withThousands(service.minCharge)}`;
    if (field.startsWith('hours:')) {
        const spec = field.slice('hours:'.length);
        if (service.unitBasis !== 'per_hour') fail('hours: only applies to a per_hour service');
        const [from, to] = spec.split('-').map(Number);
        if (!Number.isFinite(from)) fail('unparseable hour count');
        const lo = Math.max(service.rate * from, service.minCharge);
        if (!Number.isFinite(to)) return `$${withThousands(lo)}`;
        return priceRange(lo, Math.max(service.rate * to, service.minCharge), '–');
    }
    return fail('unknown field');
}

function spliceAiGuide(src, target, block) {
    const startAt = src.indexOf(target.startsAfter);
    if (startAt === -1) throw new Error(`marker not found in ${target.file}: ${target.startsAfter}`);
    const from = startAt + target.startsAfter.length;
    const endAt = src.indexOf(target.endsBefore, from);
    if (endAt === -1) throw new Error(`marker not found in ${target.file}: ${target.endsBefore}`);
    return `${src.slice(0, from)}\n\n${block}\n\n${src.slice(endAt)}`;
}

// ── Reading the current CONFIGS out of calculator.js ──────────────────────────────────

export function evalConfigs(src) {
    const dataOnly = src.slice(0, src.indexOf('export default function calculator'));
    // eslint-disable-next-line no-eval
    return eval(`${dataOnly}\nCONFIGS`);
}

/** The declared size order per config/series — the axis monotonicity is checked along. */
function sizeOrdersFrom(CONFIGS) {
    const orders = {};
    for (const [configKey, cfg] of Object.entries(CONFIGS)) {
        if (!cfg.pricing) continue;
        orders[configKey] = {};
        const sizeCategory = cfg.categories?.[1];
        for (const series of Object.keys(cfg.pricing)) {
            /* Every step the picker OFFERS, including one that has no price yet. Dropping the
               unpriced ones here is what let interior-painting's fourth apartment scope be added
               to the map and silently ignored; projectConfig now refuses an unpriced step
               instead, which is a red build rather than a missing option. */
            const declared = sizeCategory?.optionSets?.[series]
                ?.map((o) => o.value)
                .filter(Boolean);
            orders[configKey][series] = declared?.length ? declared : Object.keys(cfg.pricing[series]);
        }
    }
    return orders;
}

// ── Build everything ──────────────────────────────────────────────────────────────────

export function build() {
    const catalog = loadCatalog();
    const index = indexCatalog(catalog);
    const map = readJson('pricing/site-map.json');
    if (map.catalogVersion !== CATALOG_VERSION) throw new Error('site-map.json targets a different catalog version');

    const previousRaw = read(`pricing/price-tables/${PREVIOUS_VERSION}.json`);
    const previousSha = createHash('sha256').update(previousRaw).digest('hex');
    if (previousSha !== PREVIOUS_TABLE_SHA256) {
        throw new Error(
            `pricing/price-tables/${PREVIOUS_VERSION}.json has been edited.\n` +
            `  expected ${PREVIOUS_TABLE_SHA256}\n  actual   ${previousSha}\n` +
            'That file is frozen: it is what an old lead is verified against, and it is the source of ' +
            'every carry-forward cell. A price change is a NEW version, never an edit to this one.',
        );
    }
    const frozenPrevious = JSON.parse(previousRaw);
    if (frozenPrevious.priceVersion !== PREVIOUS_VERSION) throw new Error('the frozen previous table is mislabelled');

    const calculatorSrc = read('components/modules/calculator.js');
    const CONFIGS = evalConfigs(calculatorSrc);
    const sizeOrders = sizeOrdersFrom(CONFIGS);

    const projection = {};
    const allCells = [];
    for (const configKey of Object.keys(frozenPrevious.modularCalculator)) {
        const { pricing, cells } = projectConfig({
            configKey,
            previous: frozenPrevious.modularCalculator[configKey],
            map,
            index,
            constants: catalog.constants,
            sizeOrders,
        });
        projection[configKey] = pricing;
        allCells.push(...cells);
    }

    const { source: nextCalculator, configsRewritten } = rewriteCalculatorJs(
        calculatorSrc,
        projection,
        frozenPrevious.modularCalculator,
    );
    const nextMain = rewriteMainJs(read('main.js'));
    const hub = buildHubCalculators(evalConfigs(nextCalculator));

    const aiGuideBlock = renderAiGuideBlock(map, index, catalog.constants);
    const aiGuides = {};
    for (const target of map.aiGuideExamples.targets) {
        aiGuides[target.file] = spliceAiGuide(read(target.file), target, aiGuideBlock);
    }
    const prose = rewriteProseFigures(map, index, projection, catalog.constants, read);

    const byProvenance = {};
    for (const cell of allCells) byProvenance[cell.source] = (byProvenance[cell.source] || 0) + 1;

    const priceTable = {
        priceVersion: CATALOG_VERSION,
        frozen: false,
        note:
            `The exact price table asap.repair renders under ${CATALOG_VERSION}. Generated by ` +
            'scripts/generate-calculator-prices.mjs from pricing/catalog/' + CATALOG_VERSION + '.json. ' +
            'Freeze it (set frozen: true) the moment a lead is stamped with this version.',
        supersedes: PREVIOUS_VERSION,
        catalogSha256: CATALOG_SHA256,
        modularCalculator: projection,
        windowAcWidget: { ...frozenPrevious.windowAcWidget, applyRepairMinimum: true },
    };

    /* The one place a RENDERED figure and a STORED cell differ. components/modules/calculator.js
       flooredRange() applies the $150 work minimum at paint time with no gas exemption, so the
       frozen $125 small gas step is shown as $150. The data stays frozen; this records what the
       page actually says so the divergence is written down instead of discovered. */
    const renderedFloor = allCells
        .filter((c) => c.source.startsWith('frozen:gas') && c.value[0] < catalog.constants.repairMinimum)
        .map((c) => ({
            cell: `${c.configKey}.${c.series}.${c.size}`,
            stored: c.value,
            rendered: [Math.max(c.value[0], catalog.constants.repairMinimum), Math.max(c.value[1], catalog.constants.repairMinimum)],
            why:
                'Local Law 429 (2025) freezes the catalog cell; the owner\'s $150 work minimum is unconditional in ' +
                'the renderer, and the CRM mirrors the same flooredRange, so site and CRM agree on the figure the ' +
                'lead was shown. Unchanged from calc-2026-08-01.',
        }));

    /* The lift moves a whole ladder by one delta, so it can never break the order WITHIN a
       ladder — but it can change how two SERIES of the same config compare, and so can a
       catalog cell landing next to a carried-forward one. Most of these configs pick a TYPE
       rather than a rung ("Bunk bed" vs "Storage bed", "Other IKEA item"), and the site
       declares no order across them, so this is recorded rather than repaired: repairing it
       would mean re-authoring the 1,134 cells that are still waiting for proposal §2.1-2.8.
       Counted here so the number is pinned and a later change cannot add to it quietly. */
    const orderChanges = [];
    for (const [configKey, ladders] of Object.entries(projection)) {
        const seriesKeys = Object.keys(ladders);
        const sizes = new Set(seriesKeys.flatMap((s) => Object.keys(ladders[s])));
        for (const size of sizes) {
            for (let i = 0; i < seriesKeys.length; i += 1) {
                for (let j = i + 1; j < seriesKeys.length; j += 1) {
                    const a = seriesKeys[i];
                    const b = seriesKeys[j];
                    const wasA = frozenPrevious.modularCalculator[configKey]?.[a]?.[size];  // undefined for a brand-new step
                    const wasB = frozenPrevious.modularCalculator[configKey]?.[b]?.[size];
                    const nowA = ladders[a]?.[size];
                    const nowB = ladders[b]?.[size];
                    if (!wasA || !wasB || !nowA || !nowB) continue;
                    const flipped = (wasA[0] < wasB[0] && nowA[0] > nowB[0]) || (wasA[0] > wasB[0] && nowA[0] < nowB[0]);
                    if (!flipped) continue;
                    const sourceOf = (series) => allCells.find((c) => c.configKey === configKey && c.series === series && c.size === size)?.source;
                    const [sa, sb] = [sourceOf(a), sourceOf(b)];
                    orderChanges.push({
                        at: `${configKey}/${size}`,
                        a: { series: a, was: wasA, now: nowA, source: sa },
                        b: { series: b, was: wasB, now: nowB, source: sb },
                        driver: /^(catalog|contract)/.test(sa || '') || /^(catalog|contract)/.test(sb || '')
                            ? 'catalog-or-contract'
                            : 'lift-artifact',
                    });
                }
            }
        }
    }

    const projectionReport = {
        pricingVersion: CATALOG_VERSION,
        supersedes: PREVIOUS_VERSION,
        catalogSha256: CATALOG_SHA256,
        generatedBy: 'scripts/generate-calculator-prices.mjs',
        note:
            'Provenance of every calculator cell on asap.repair. A cell is only overwritten when the catalog ' +
            'or docs/pricing-website-contract.md §4 states its value; otherwise it is the frozen ' +
            `${PREVIOUS_VERSION} figure, moved only by the two rules the owner has already decided (the ` +
            '$150 work minimum, and monotonicity along the declared size axis).',
        totals: {
            cells: allCells.length,
            configs: Object.keys(projection).length,
            byProvenance: Object.fromEntries(Object.entries(byProvenance).sort((a, b) => b[1] - a[1])),
        },
        renderedFloorDivergence: renderedFloor,
        crossSeriesOrderChanges: {
            note:
                'Pairs of series inside one config whose relative price order changed. The series axis of these ' +
                'configs is a type picker, not a ladder, and the site declares no order across it — the ordering ' +
                'the owner\'s rule governs is the SIZE axis, which is asserted monotonic for every ladder. ' +
                'catalog-or-contract entries are the intended corrections (apartment-turnover 1br vs 2br, ' +
                'beds storage vs adjustable, dishwasher builtin vs new). lift-artifact entries are a consequence of ' +
                'lifting only the ladders that were below the work minimum, and resolve when proposal §2.1-2.8 ' +
                'lands.',
            total: orderChanges.length,
            byDriver: {
                'catalog-or-contract': orderChanges.filter((c) => c.driver === 'catalog-or-contract').length,
                'lift-artifact': orderChanges.filter((c) => c.driver === 'lift-artifact').length,
            },
            changes: orderChanges,
        },
        openGap: {
            what: 'Cells the catalog does not carry.',
            why:
                'docs/pricing-website-contract.md §4: proposal sections 2.1-2.8 — the per-hub cell tables — were ' +
                'truncated out of the catalog lane\'s input and are not in the catalog. They are pending, not ' +
                'agreed-unchanged.',
            cellsPendingProposalSections2_1To2_8: allCells.filter((c) => c.source.startsWith('carry-forward')).length,
            madeOf: {
                'carry-forward': allCells.filter((c) => c.source.startsWith('carry-forward') && !c.source.startsWith('carry-forward:lift')).length,
                'carry-forward:lift': allCells.filter((c) => c.source.startsWith('carry-forward:lift')).length,
            },
            cellsTheCatalogOrContractOwns: allCells.filter((c) => c.source.startsWith('catalog:tier') || c.source.startsWith('contract:')).length,
        },
        cells: allCells,
    };

    return {
        catalog,
        map,
        projection,
        cells: allCells,
        configsRewritten,
        files: {
            [`pricing/price-tables/${CATALOG_VERSION}.json`]: `${JSON.stringify(priceTable, null, 2)}\n`,
            'pricing/calculator-price-projection.json': `${JSON.stringify(projectionReport, null, 2)}\n`,
            'pricing/catalog/index.json': `${JSON.stringify(
                {
                    live: CATALOG_VERSION,
                    versions: [CATALOG_VERSION],
                    sha256: { [CATALOG_VERSION]: CATALOG_SHA256 },
                    priceTables: [PREVIOUS_VERSION, CATALOG_VERSION],
                    note:
                        'Published for the CRM cross-repository drift cron (pricing-website-contract.md §8): fetch ' +
                        'this, then compare sha256(pricing/catalog/<live>.json) with PRICING_CATALOG_CHECKSUMS[live] ' +
                        'in bazas-crm/lib/pricing/catalog.ts. priceTables lists every version a lead may still carry; ' +
                        'each is served at /pricing/price-tables/<version>.json and is never rewritten.',
                },
                null,
                2,
            )}\n`,
            'components/modules/calculator.js': nextCalculator,
            'main.js': nextMain,
            'assets/data/hub-calculators.json': `${JSON.stringify(hub, null, 2)}\n`,
            ...aiGuides,
            ...prose,
        },
    };
}

// ── CLI ───────────────────────────────────────────────────────────────────────────────

function main() {
    const result = build();
    const drifted = [];
    for (const [rel, content] of Object.entries(result.files)) {
        let current = null;
        try { current = read(rel); } catch { current = null; }
        if (current === content) continue;
        drifted.push(rel);
        if (!CHECK) {
            mkdirSync(dirname(p(rel)), { recursive: true });
            writeFileSync(p(rel), content);
        }
    }

    const counts = result.cells.reduce((acc, c) => { acc[c.source] = (acc[c.source] || 0) + 1; return acc; }, {});
    const summary = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join('  ');

    if (CHECK) {
        if (drifted.length) {
            console.error(`Calculator prices are out of date. Run: node scripts/generate-calculator-prices.mjs\n  ${drifted.join('\n  ')}`);
            process.exit(1);
        }
        console.log(`Calculator prices are in sync with ${CATALOG_VERSION}. ${result.cells.length} cells.`);
        return;
    }

    console.log(
        `Projected ${result.cells.length} cells across ${result.configsRewritten} configs from ${CATALOG_VERSION}.\n` +
        `  ${summary}\n` +
        (drifted.length ? `  wrote: ${drifted.join(', ')}` : '  nothing changed'),
    );
}

if (import.meta.url === `file://${process.argv[1]}`) main();
