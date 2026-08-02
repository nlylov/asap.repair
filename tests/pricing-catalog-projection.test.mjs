/*
 * The website is a PROJECTION of the CRM pricing catalog. This is the test that makes that a
 * fact rather than an intention.
 *
 * What it is defending against, in order of how much each one has already cost:
 *
 *  1. Two price lists. The CRM and the site each held their own numbers and nothing compared
 *     them, so 192 calculator cells published a price below the owner's $150 work minimum and
 *     services/index.html told Google, in structured data, that work starts at $99.
 *  2. A vendored copy that drifts. pricing/catalog/<v>.json must be a byte-identical copy of the
 *     CRM file; the sha256 is pinned to the same literal as PRICING_CATALOG_CHECKSUMS.
 *  3. A hand edit to a generated file. Everything the generator writes is re-derived here in
 *     memory and compared byte for byte. Editing a price in calculator.js turns this red.
 *  4. A version stamp that does not match what is rendered. An old lead is verified against the
 *     version it was quoted under, so the three places the version is written must agree and the
 *     previous table must stay on disk, frozen, forever.
 *  5. Prices in prose. An article written months ago is still a published price list.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import {
    build, loadCatalog, evalConfigs,
    CATALOG_VERSION, CATALOG_SHA256, PREVIOUS_VERSION,
} from '../scripts/generate-calculator-prices.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const readJson = (rel) => JSON.parse(read(rel));

const catalog = loadCatalog();
const result = build();
const projection = result.projection;
const cells = result.cells;
const REPAIR_MINIMUM = catalog.constants.repairMinimum;
const ASSESSMENT_FEE = catalog.constants.assessmentVisitFee;

const isFreePhoto = ([lo, hi]) => lo === 0 && hi === 0;
const isAssessment = ([lo, hi]) => lo === ASSESSMENT_FEE && hi === ASSESSMENT_FEE;
const isFrozenGas = (cell) => cell.source.startsWith('frozen:gas');

/* The one place a cell count is written down by a human: the COUNTS line in the generator's
   header comment. Every test that needs the total reads it from there, so a legitimate change to
   the shape of the calculator (a new step on an axis, say) is one edit and not a scavenger hunt —
   and a change nobody meant to make still turns something red. */
const HEADER_COUNTS = (() => {
    const m = /COUNTS: total=(\d+) catalogOrContract=(\d+) carryForward=(\d+) nonWorkPaths=(\d+)/
        .exec(read('scripts/generate-calculator-prices.mjs').slice(0, 4000));
    assert.ok(m, 'the COUNTS line was removed from the generator header');
    return { total: +m[1], catalogOrContract: +m[2], carryForward: +m[3], nonWorkPaths: +m[4] };
})();

// ── 1. the vendored catalog ───────────────────────────────────────────────────────────

test('the vendored catalog is a byte-identical copy of the CRM file', () => {
    const raw = read(`pricing/catalog/${CATALOG_VERSION}.json`);
    assert.equal(createHash('sha256').update(raw).digest('hex'), CATALOG_SHA256);
    assert.equal(catalog.pricingVersion, CATALOG_VERSION);
    assert.equal(catalog.status, 'live');
    assert.equal(catalog.tenantSlug, 'repair-asap');
    assert.equal(catalog.supersedes, PREVIOUS_VERSION);
});

test('the published catalog index tells the CRM cron what is live and what it can verify', () => {
    const index = readJson('pricing/catalog/index.json');
    assert.equal(index.live, CATALOG_VERSION);
    assert.equal(index.sha256[CATALOG_VERSION], CATALOG_SHA256);
    // Every version a lead may still carry has to be resolvable from this file.
    assert.deepEqual(index.priceTables, [PREVIOUS_VERSION, CATALOG_VERSION]);
});

// ── 2. nothing generated has been hand-edited ─────────────────────────────────────────

test('every generated file is byte-identical to a fresh generation', () => {
    const drifted = Object.entries(result.files)
        .filter(([rel, content]) => read(rel) !== content)
        .map(([rel]) => rel);
    assert.deepEqual(
        drifted, [],
        'run: node scripts/generate-calculator-prices.mjs — a price was edited by hand instead of in the catalog',
    );
});

test('the price grids inside calculator.js are exactly the projection', () => {
    const CONFIGS = evalConfigs(read('components/modules/calculator.js'));
    let checked = 0;
    for (const [configKey, ladders] of Object.entries(projection)) {
        for (const [series, sizes] of Object.entries(ladders)) {
            for (const [size, expected] of Object.entries(sizes)) {
                assert.deepEqual(
                    CONFIGS[configKey]?.pricing?.[series]?.[size], expected,
                    `${configKey}.${series}.${size}`,
                );
                checked += 1;
            }
        }
    }
    assert.equal(checked, cells.length);
    assert.equal(checked, HEADER_COUNTS.total);
});

// ── 3. the version stamp ──────────────────────────────────────────────────────────────

test('all four places the price version is written agree', () => {
    const calc = /const CALC_PRICE_VERSION = '([^']+)';/.exec(read('components/modules/calculator.js'))[1];
    const main = /const REPAIR_ASAP_CALC_PRICE_VERSION = '([^']+)';/.exec(read('main.js'))[1];
    assert.equal(calc, CATALOG_VERSION);
    assert.equal(main, CATALOG_VERSION);
    assert.equal(catalog.pricingVersion, CATALOG_VERSION);
    assert.equal(readJson(`pricing/price-tables/${CATALOG_VERSION}.json`).priceVersion, CATALOG_VERSION);
});

test('the previous version stays readable so an old lead can still be verified', () => {
    /* A lead quoted under calc-2026-08-01 carries that string. If the table it was quoted from
       disappears, the figure the customer was shown becomes unverifiable and the CRM has to
       take the lead's word for it. The file is frozen: no future generation may touch it. */
    const previous = readJson(`pricing/price-tables/${PREVIOUS_VERSION}.json`);
    assert.equal(previous.priceVersion, PREVIOUS_VERSION);
    assert.equal(previous.frozen, true);
    assert.equal(Object.keys(previous.modularCalculator).length, 70 + 8);
    assert.equal(previous.windowAcWidget.applyRepairMinimum, false, 'the old table records that the widget had no floor');

    // It is the input the generator carries forward from, so it must not be regenerated.
    assert.ok(!Object.keys(result.files).includes(`pricing/price-tables/${PREVIOUS_VERSION}.json`));

    // Every cell of the live table exists in the previous one, so nothing became unresolvable.
    for (const [configKey, ladders] of Object.entries(projection)) {
        for (const series of Object.keys(ladders)) {
            assert.ok(previous.modularCalculator[configKey]?.[series], `${configKey}.${series} vanished`);
        }
    }
});

// ── 4. the owner's rules, over every cell ─────────────────────────────────────────────

test('no calculator cell is NaN, negative, inverted or zero on a priced path', () => {
    for (const cell of cells) {
        const [lo, hi] = cell.value;
        const at = `${cell.configKey}.${cell.series}.${cell.size}`;
        assert.ok(Number.isFinite(lo) && Number.isFinite(hi), `${at} is not a finite number`);
        assert.ok(lo >= 0 && hi >= 0, `${at} is negative`);
        assert.ok(hi >= lo, `${at} is inverted: ${lo}-${hi}`);
        if (!isFreePhoto(cell.value)) assert.ok(lo > 0, `${at} renders $0 on a priced path`);
    }
});

test('nothing below the $150 work minimum renders on a work path', () => {
    const offenders = cells
        .filter((c) => !isFreePhoto(c.value) && !isAssessment(c.value) && !isFrozenGas(c))
        .filter((c) => c.value[0] < REPAIR_MINIMUM)
        .map((c) => `${c.configKey}.${c.series}.${c.size} = $${c.value[0]}`);
    assert.deepEqual(offenders, []);
});

test('$99 appears only on the assessment path, never as the price of work', () => {
    for (const cell of cells) {
        if (cell.value[0] !== ASSESSMENT_FEE && cell.value[1] !== ASSESSMENT_FEE) continue;
        assert.ok(
            isAssessment(cell.value),
            `${cell.configKey}.${cell.series}.${cell.size} puts $${ASSESSMENT_FEE} inside a work range ` +
            `(${cell.value[0]}-${cell.value[1]})`,
        );
        assert.equal(cell.source, 'assessment:99');
    }
});

test('every ladder rises along its declared size axis', () => {
    const CONFIGS = evalConfigs(read('components/modules/calculator.js'));
    let laddersChecked = 0;
    for (const [configKey, ladders] of Object.entries(projection)) {
        const sizeCategory = CONFIGS[configKey]?.categories?.[1];
        for (const [series, sizes] of Object.entries(ladders)) {
            const order = (sizeCategory?.optionSets?.[series] || [])
                .map((o) => o.value)
                .filter((v) => v && Object.prototype.hasOwnProperty.call(sizes, v));
            if (order.length < 2) continue;
            laddersChecked += 1;
            let prev = null;
            for (const size of order) {
                const value = sizes[size];
                if (isFreePhoto(value) || isAssessment(value)) continue;
                if (prev) {
                    assert.ok(value[0] >= prev.value[0], `${configKey}.${series}: ${size} low ($${value[0]}) is under ${prev.size} ($${prev.value[0]})`);
                    assert.ok(value[1] >= prev.value[1], `${configKey}.${series}: ${size} high ($${value[1]}) is under ${prev.size} ($${prev.value[1]})`);
                }
                prev = { size, value };
            }
        }
    }
    assert.ok(laddersChecked > 400, `expected every ladder to be walked, walked ${laddersChecked}`);
});

test('the catalog\'s own cross-series ladders rise too', () => {
    /* apartment-turnover is the one config whose SERIES are themselves a ladder — a 2-bedroom is
       never cheaper than a 1-bedroom. That inversion is exactly what shipped under
       calc-2026-08-01 (1br/md at $850-1500 was dearer than 2br/md at $680-1020). */
    const service = catalog.services.find((s) => s.key === 'apartment-turnover');
    const seriesOrder = service.axes.find((a) => a.id === 'series').order;
    for (const size of ['sm', 'md', 'lg']) {
        let prev = null;
        for (const series of seriesOrder) {
            const value = projection['apartment-turnover'][series][size];
            if (prev) {
                assert.ok(value[0] >= prev.value[0], `apartment-turnover ${series}/${size} low is under ${prev.series}`);
                assert.ok(value[1] >= prev.value[1], `apartment-turnover ${series}/${size} high is under ${prev.series}`);
            }
            prev = { series, value };
        }
    }
});

// ── 5. gas is frozen ──────────────────────────────────────────────────────────────────

test('the three gas ladders are carried forward byte-identical and exempt from the floor', () => {
    const previous = readJson(`pricing/price-tables/${PREVIOUS_VERSION}.json`).modularCalculator;
    const frozen = [['dryer', 'gas'], ['range', 'gas-freestanding'], ['range', 'cooktop']];
    for (const [configKey, series] of frozen) {
        assert.deepEqual(
            projection[configKey][series], previous[configKey][series],
            `${configKey}.${series} was repriced — Local Law 429 (2025) has it frozen pending the owner's decision`,
        );
        const service = catalog.services.find((s) => (s.tiers || []).some((t) => t.lo === projection[configKey][series].sm[0]) && s.status === 'frozen');
        assert.ok(service, `${configKey}.${series} has no frozen catalog service backing it`);
    }
    // And their sub-$150 small step is deliberate, so it must be recorded as such.
    for (const cell of cells.filter(isFrozenGas)) {
        assert.match(cell.ref, /Local Law 429/);
    }
    assert.equal(cells.filter(isFrozenGas).length, 9);
});

test('the gas cells the renderer floors are written down, with both figures', () => {
    /* Codex round 1, finding 1. The stored gas cell and the figure the page shows are NOT the
       same, and until now nothing said so. components/modules/calculator.js flooredRange() has
       no gas exemption, on purpose (the reasons are in the comment there), so the frozen $125
       small step renders as $150. That is unchanged from calc-2026-08-01 — the base commit
       rendered $150-$180 for it too — but "unchanged and undocumented" is how a divergence
       survives a review. This pins all three: the datum stays frozen, the render floors it, and
       the projection report carries both. */
    const report = readJson('pricing/calculator-price-projection.json');
    const previous = readJson(`pricing/price-tables/${PREVIOUS_VERSION}.json`).modularCalculator;
    const floorAsRendered = ([lo, hi]) => [Math.max(lo, REPAIR_MINIMUM), Math.max(hi, REPAIR_MINIMUM)];

    const expected = [];
    for (const cell of cells.filter(isFrozenGas)) {
        if (cell.value[0] >= REPAIR_MINIMUM) continue;
        expected.push(`${cell.configKey}.${cell.series}.${cell.size}`);
        // stored: byte-identical to the frozen previous table
        assert.deepEqual(cell.value, previous[cell.configKey][cell.series][cell.size]);
        // recorded: the report carries the stored pair AND the rendered pair
        const row = report.renderedFloorDivergence.find((r) => r.cell === `${cell.configKey}.${cell.series}.${cell.size}`);
        assert.ok(row, `${cell.configKey}.${cell.series}.${cell.size} is floored at render time but not recorded`);
        assert.deepEqual(row.stored, cell.value);
        assert.deepEqual(row.rendered, floorAsRendered(cell.value));
        assert.match(row.why, /Local Law 429/);
    }
    assert.deepEqual(expected.sort(), ['dryer.gas.sm', 'range.cooktop.sm', 'range.gas-freestanding.sm']);
    assert.equal(report.renderedFloorDivergence.length, expected.length, 'the report lists a divergence that does not exist');

    // And the renderer really has no gas exemption — if someone adds one, this test must be revisited.
    const flooredRange = read('components/modules/calculator.js').slice(
        read('components/modules/calculator.js').indexOf('function flooredRange('),
        read('components/modules/calculator.js').indexOf('function buildQuoteSnapshot('),
    );
    assert.match(flooredRange, /THERE IS DELIBERATELY NO GAS EXEMPTION HERE/);
    assert.match(flooredRange, /Math\.max\(lo, PRICING\.REPAIR_MINIMUM\)/);
});

test('the generator\'s own header comment is arithmetically true', () => {
    /* Codex round 2 caught the first draft of that comment claiming 198 catalog-owned cells when
       the real figure is 84 — a doc that is wrong about the one number it exists to convey. The
       comment now carries a machine-readable COUNTS line and this reads it back. */
    const { total, catalogOrContract: owned, carryForward: carried, nonWorkPaths: nonWork } = HEADER_COUNTS;
    assert.equal(total, cells.length);
    assert.equal(owned, cells.filter((c) => c.source.startsWith('catalog:') || c.source.startsWith('contract:')).length);
    assert.equal(carried, cells.filter((c) => c.source.startsWith('carry-forward')).length);
    assert.equal(nonWork, cells.filter((c) => ['photo:free', 'assessment:99'].includes(c.source) || c.source.startsWith('frozen:gas')).length);
    assert.equal(owned + carried + nonWork, total);
});

test('the report states exactly how much of the site the catalog owns, and names what it does not', () => {
    /* Codex round 1, finding 2 on the previous lane: a reader could take "generated from the
       catalog" to mean "every displayed price is a catalog price". At that point it was 85 of
       1,333 and the numbers had to say so. The repricing closed the gap, so this test now guards
       the opposite risk — a claim of full coverage while something quietly falls out of the
       catalog again. Both the count AND the identity of every remaining carry-forward are pinned:
       a new unbound cell fails here even if the totals still add up. */
    const report = readJson('pricing/calculator-price-projection.json');
    const owned = cells.filter((c) => c.source.startsWith('catalog:') || c.source.startsWith('contract:')).length;
    const carried = cells.filter((c) => c.source.startsWith('carry-forward'));
    assert.equal(report.openGap.cellsTheCatalogOrContractOwns, owned);
    assert.equal(report.openGap.cellsPendingProposalSections2_1To2_8, carried.length);
    assert.equal(report.openGap.madeOf['carry-forward'] + (report.openGap.madeOf['carry-forward:lift'] || 0), carried.length);
    assert.ok(owned > carried.length, 'the catalog is supposed to own the majority now');

    const stillCarried = [...new Set(carried.map((c) => c.configKey))].sort();
    assert.deepEqual(stillCarried, ['decorative_plaster'],
        'a config fell out of the catalog. Bind it, or state here why its evidence is too thin to price.');
    assert.equal(carried.length, 15);
});

test('every catalog service marked frozen is still present in the catalog', () => {
    const frozen = catalog.services.filter((s) => s.status === 'frozen').map((s) => s.key).sort();
    assert.deepEqual(frozen, ['dryer-install-gas', 'range-cooktop-gas', 'range-install-gas-freestanding']);
});

// ── 6. the cells the catalog owns are exactly the catalog's ───────────────────────────

test('every catalog-bound cell equals its tier, to the dollar', () => {
    const tiers = new Map();
    for (const service of catalog.services) {
        for (const tier of service.tiers || []) tiers.set(`${service.key}#${tier.id}`, tier);
    }
    const bound = cells.filter((c) => c.source.startsWith('catalog:tier'));
    assert.ok(bound.length >= 60, `expected the catalog to own at least 60 cells, it owns ${bound.length}`);
    for (const cell of bound) {
        const tier = tiers.get(cell.ref);
        assert.ok(tier, `${cell.ref} is not a catalog tier`);
        assert.deepEqual(cell.value, [tier.lo, tier.hi], `${cell.configKey}.${cell.series}.${cell.size} != ${cell.ref}`);
    }
});

test('every websiteLadders cell equals the catalog, obeys the floor and fits its service band', () => {
    /* The repricing put the 2-D calculator grid in its own catalog block rather than on the
       trade services' 1-D ladders, which it would have destroyed. That block is now where most
       of the site's prices live, so it gets the same treatment the tiers get: value identity,
       the owner's floor, and the reconciliation rule — a preset ladder may be finer than the
       trade ladder, it may not contradict it. */
    const ladderCells = cells.filter((c) => c.source.startsWith('catalog:ladder'));
    assert.ok(ladderCells.length > 1000, `expected the ladder block to own the bulk of the grid, it owns ${ladderCells.length}`);
    const services = new Map(catalog.services.map((s) => [s.key, s]));
    const block = catalog.websiteLadders?.configs;
    assert.ok(block, 'the catalog carries no websiteLadders block');

    let seen = 0;
    for (const [configKey, cfg] of Object.entries(block)) {
        for (const [series, ser] of Object.entries(cfg.series)) {
            const service = services.get(ser.service || cfg.service);
            assert.ok(service, `${configKey}.${series} names a service that does not exist`);
            let prevLo = -1;
            let prevHi = -1;
            for (const [size, cell] of Object.entries(ser.cells)) {
                seen += 1;
                const at = `${configKey}.${series}.${size}`;
                assert.ok(cell.lo >= REPAIR_MINIMUM, `${at} is $${cell.lo}, below the work minimum`);
                assert.ok(cell.hi > cell.lo, `${at} is not a range`);
                assert.ok(cell.lo >= service.range.lo && cell.hi <= service.range.hi,
                    `${at} $${cell.lo}-$${cell.hi} is outside ${service.key} $${service.range.lo}-$${service.range.hi}`);
                assert.ok(cell.lo >= prevLo && cell.hi >= prevHi, `${at} goes backwards along its own ladder`);
                prevLo = cell.lo;
                prevHi = cell.hi;
                const shown = cells.find((c) => c.configKey === configKey && c.series === series && c.size === size);
                assert.deepEqual(shown.value, [cell.lo, cell.hi], `${at}: the page and the catalog disagree`);
                assert.ok(Array.isArray(cell.was) && cell.was.length === 2, `${at}: no record of what it was before`);
                assert.ok((cell.derivation || '').length > 5, `${at}: no derivation recorded`);
            }
        }
    }
    assert.equal(seen, ladderCells.length + cells.filter((c) => c.source.startsWith('catalog:tier') && block[c.configKey]?.series?.[c.series]?.cells?.[c.size]).length);
    assert.ok((catalog.websiteLadders.derivation || '').length > 200, 'the block must state how a derived step was derived');
});

test('the open gap is reported, not hidden', () => {
    /* The catalog carries 80 services and 204 tiers; the site renders 1,332 cells. The
       difference is proposal §2.1-2.8, which docs/pricing-website-contract.md §4 says was
       truncated out of the catalog lane's input. Those cells are carried forward, not agreed.
       This test exists so the number is impossible to lose track of. */
    const report = readJson('pricing/calculator-price-projection.json');
    const carried = cells.filter((c) => c.source.startsWith('carry-forward')).length;
    assert.equal(report.openGap.cellsPendingProposalSections2_1To2_8, carried);
    assert.match(report.openGap.why, /2\.1-2\.8/);
    assert.equal(report.totals.cells, cells.length);
});

// ── 7. the window-AC widget, every reachable state ────────────────────────────────────

function windowAcStates() {
    const html = read('services/ac-installation-cleaning/window-ac-installation/index.html');
    const btu = [...html.matchAll(/<option value="[^"]+" data-lo="(\d+)" data-hi="(\d+)"/g)]
        .map((m) => [Number(m[1]), Number(m[2])]);
    const qty = [...html.matchAll(/<option value="(\d)" data-discount="(\d+)"/g)]
        .map((m) => [Number(m[1]), Number(m[2])]);
    const surcharges = [...new Set([...html.matchAll(/data-surcharge="(\d+)"/g)].map((m) => Number(m[1])))];
    const togglePrices = [...html.matchAll(/data-price="(\d+)"/g)].map((m) => Number(m[1]));
    /* Every subset of the toggles is reachable, so the distinct sums are the reachable
       add-on totals. 7 toggles = 128 subsets. */
    const toggleTotals = new Set();
    for (let mask = 0; mask < (1 << togglePrices.length); mask += 1) {
        let sum = 0;
        for (let i = 0; i < togglePrices.length; i += 1) if (mask & (1 << i)) sum += togglePrices[i];
        toggleTotals.add(sum);
    }
    assert.ok(btu.length === 4 && qty.length === 5, 'the window-AC option grid changed shape');
    return { btu, qty, surcharges, toggleTotals: [...toggleTotals] };
}

test('no reachable window-AC state prices work below the minimum, per unit or in total', () => {
    /* This widget is arithmetic, not a table, and it is the one calculator that never had a
       floor: its cheapest state rendered $120-$165 and its five-unit per-unit figure rendered
       $100. Both are prices for work. The floor now lives in main.js updateCalc(); this walks
       the whole reachable space to prove it. */
    const { btu, qty, surcharges, toggleTotals } = windowAcStates();
    const round5 = (n) => Math.round(n / 5) * 5;
    let states = 0;
    let cheapest = Infinity;
    for (const [lo, hi] of btu) {
        for (const [count, discountPct] of qty) {
            for (const windowSurcharge of surcharges) {
                for (const floorSurcharge of surcharges) {
                    for (const addOns of toggleTotals) {
                        states += 1;
                        const d = discountPct / 100;
                        const perUnitLo = Math.max(round5((lo + windowSurcharge + floorSurcharge + addOns) * (1 - d)), REPAIR_MINIMUM);
                        const perUnitHi = Math.max(round5((hi + windowSurcharge + floorSurcharge + addOns) * (1 - d)), REPAIR_MINIMUM);
                        const totalLo = Math.max(round5(perUnitLo * count), REPAIR_MINIMUM);
                        const totalHi = Math.max(round5(perUnitHi * count), REPAIR_MINIMUM);
                        assert.ok(perUnitLo >= REPAIR_MINIMUM, `per-unit ${perUnitLo} below the minimum`);
                        assert.ok(totalLo >= REPAIR_MINIMUM, `total ${totalLo} below the minimum`);
                        assert.ok(perUnitHi >= perUnitLo && totalHi >= totalLo, 'inverted window-AC range');
                        assert.ok(Number.isFinite(totalLo) && Number.isFinite(totalHi), 'NaN in the window-AC total');
                        cheapest = Math.min(cheapest, totalLo);
                    }
                }
            }
        }
    }
    assert.ok(states > 5000, `expected the whole state space, walked ${states}`);
    assert.equal(cheapest, REPAIR_MINIMUM);
});

test('main.js applies the floor before it renders and before it builds the lead snapshot', () => {
    const main = read('main.js');
    assert.match(main, /const REPAIR_ASAP_WORK_MINIMUM = 150;/);
    const update = main.slice(main.indexOf('function updateCalc()'), main.indexOf('// Complexity badge'));
    // The floored figures are what the price box, acDisplayedQuote and the GA event all read.
    assert.match(update, /const perUnitLo = Math\.max\([^\n]*REPAIR_ASAP_WORK_MINIMUM\)/);
    assert.match(update, /const perUnitHi = Math\.max\([^\n]*REPAIR_ASAP_WORK_MINIMUM\)/);
    assert.match(update, /const totalLo = Math\.max\([^\n]*REPAIR_ASAP_WORK_MINIMUM\)/);
    assert.match(update, /const totalHi = Math\.max\([^\n]*REPAIR_ASAP_WORK_MINIMUM\)/);
    assert.ok(
        update.indexOf('const perUnitLo') < update.indexOf('priceEl.innerHTML'),
        'the floor must be applied before the price is rendered',
    );
    assert.ok(
        update.indexOf('const perUnitLo') < update.indexOf('acDisplayedQuote = {'),
        'the floor must be applied before the snapshot is built',
    );
});

test('the window-AC page renders one price system, not two', () => {
    const html = read('services/ac-installation-cleaning/window-ac-installation/index.html');
    assert.ok(!html.includes('data-config="ac-window"'), 'the generic ac-window calculator is mounted alongside the widget again');
    assert.equal((html.match(/id="calculator"/g) || []).length, 1, 'duplicate id="calculator" on one page');
});

// ── 8. prices written into page copy and structured data ──────────────────────────────

function everyPage() {
    const skip = new Set(['node_modules', '.git', '.wrangler', 'tmp', 'previews', 'reports', 'labs', 'pricing', 'deploy', 'gbp-images', 'assets']);
    const out = [];
    (function walk(dir) {
        for (const entry of readdirSync(dir)) {
            if (skip.has(entry) || entry.startsWith('.')) continue;
            const full = join(dir, entry);
            if (statSync(full).isDirectory()) walk(full);
            else if (/\.(html|txt)$/.test(entry)) out.push(full.slice(ROOT.length));
        }
    }(ROOT));
    return out;
}

/* A figure that is a RATE (per square foot, per piece, per hour, per flight) or a SURCHARGE
   (written with a leading +) is legitimately under the work minimum: it is a component of a
   price, not a price. Everything else that names dollars is a price for a job. */
const RATE_OR_SURCHARGE = /per (square|sq|linear|lin|hour|hr|piece|pull|handle|unit|flight)|\/(sq|unit|hour|hr)|a piece|a pull|a handle|an hour|each|\(\+\$|>\+\$|parking/i;

test('no page states a work price below the $150 minimum', () => {
    const offenders = [];
    for (const file of everyPage()) {
        read(file).split('\n').forEach((line, i) => {
            if (RATE_OR_SURCHARGE.test(line)) return;
            const ranges = [...line.matchAll(/\$([0-9][0-9,]*)\s*(?:–|—|-|&ndash;| to )\s*\$?([0-9][0-9,]*)/g)];
            for (const m of ranges) {
                const lo = Number(m[1].replace(/,/g, ''));
                const hi = Number(m[2].replace(/,/g, ''));
                if (hi < lo) offenders.push(`${file}:${i + 1} inverted ${m[0]}`);
                if (lo < REPAIR_MINIMUM) offenders.push(`${file}:${i + 1} below the minimum: ${m[0]}`);
            }
        });
    }
    assert.deepEqual(offenders, []);
});

test('no page or JSON-LD block states $99 as the minimum for work', () => {
    const offenders = [];
    for (const file of everyPage()) {
        read(file).split('\n').forEach((line, i) => {
            if (!line.includes('$99')) return;
            /* The exact claim that was live in services/index.html, in the body AND inside
               FAQPage.acceptedAnswer.text where Google reads it. */
            if (/minimum[^.$]{0,40}\$99|\$99[^.]{0,40}\bminimum\b(?![^.]*credited)/i.test(line)) {
                offenders.push(`${file}:${i + 1} ${line.trim().slice(0, 140)}`);
            }
        });
    }
    assert.deepEqual(offenders, []);
});

test('every $99 mention says the visit is credited, and every page that names it names $150 too', () => {
    for (const file of everyPage()) {
        const src = read(file);
        if (!src.includes('$99')) continue;
        assert.ok(
            /credited|comes off the bill|applied toward|goes toward/i.test(src),
            `${file} names $99 without saying it comes off the bill when we do the work`,
        );
        assert.ok(src.includes('$150'), `${file} names the $99 visit without naming the $150 work minimum`);
    }
});

test('the committed price table satisfies the owner\'s rules independently of the generator', () => {
    /* Every other assertion in this file reads build()'s output, so a generator that is wrong in
       the same way twice would pass them all. This one ignores build() entirely: it reads the
       COMMITTED table off disk and checks it against the catalog and the frozen previous table,
       which are inputs the generator cannot influence. */
    const table = readJson(`pricing/price-tables/${CATALOG_VERSION}.json`).modularCalculator;
    const previous = readJson(`pricing/price-tables/${PREVIOUS_VERSION}.json`).modularCalculator;
    const tiers = new Map();
    for (const service of catalog.services) {
        for (const tier of service.tiers || []) tiers.set(`${service.key}#${tier.id}`, [tier.lo, tier.hi]);
    }
    const map = readJson('pricing/site-map.json');
    const frozenGasSeries = new Set(map.repairMinimumExempt.frozenGas.map(([c, s]) => `${c}.${s}`));

    let checked = 0;
    let boundChecked = 0;
    let ladderChecked = 0;
    for (const [configKey, ladders] of Object.entries(table)) {
        for (const [series, sizes] of Object.entries(ladders)) {
            for (const [size, [lo, hi]] of Object.entries(sizes)) {
                checked += 1;
                const at = `${configKey}.${series}.${size}`;
                assert.ok(Number.isFinite(lo) && Number.isFinite(hi) && hi >= lo && lo >= 0, at);

                // a bound cell must equal the catalog tier the map names — read from the map, not from build()
                const ref = map.tierBindings[configKey]?.[series]?.[size];
                if (ref) { assert.deepEqual([lo, hi], tiers.get(ref), `${at} != ${ref}`); boundChecked += 1; continue; }
                const contractValue = map.contractCells[configKey]?.[series]?.[size];
                if (contractValue) { assert.deepEqual([lo, hi], contractValue, `${at} != contract §4`); continue; }
                if (frozenGasSeries.has(`${configKey}.${series}`)) {
                    assert.deepEqual([lo, hi], previous[configKey][series][size], `${at} is frozen and must not move`);
                    continue;
                }
                if ((lo === 0 && hi === 0) || (lo === 99 && hi === 99)) continue;

                // a repriced cell must equal the catalog's own ladder block, read straight off disk
                const cell = catalog.websiteLadders?.configs?.[configKey]?.series?.[series]?.cells?.[size];
                if (cell) {
                    assert.deepEqual([lo, hi], [cell.lo, cell.hi], `${at} != websiteLadders`);
                    assert.ok(lo >= REPAIR_MINIMUM, `${at} = $${lo} is below the work minimum`);
                    ladderChecked += 1;
                    continue;
                }
                // everything else is still a carry-forward: at or above the minimum, and a pure translation
                assert.ok(lo >= REPAIR_MINIMUM, `${at} = $${lo} is below the work minimum`);
                const [wasLo, wasHi] = previous[configKey][series][size];
                assert.equal(hi - lo, wasHi - wasLo, `${at} changed its span; a carry-forward may only be translated`);
            }
        }
    }
    assert.equal(checked, HEADER_COUNTS.total);
    assert.ok(boundChecked >= 60, `expected the map to bind at least 60 cells, it bound ${boundChecked}`);
    assert.ok(ladderChecked > 1000, `expected the catalog's ladder block to own the bulk of the grid, it owned ${ladderChecked}`);
});

test('cross-series order changes are counted, and the count cannot grow unnoticed', () => {
    const report = readJson('pricing/calculator-price-projection.json');
    const c = report.crossSeriesOrderChanges;
    assert.equal(c.total, c.changes.length);
    assert.equal(c.byDriver['catalog-or-contract'] + c.byDriver['lift-artifact'], c.total);
    /* Pinned. Before the repricing this was 29 deliberate catalog corrections plus 69 artefacts
       of lifting only the ladders that sat below the work minimum. The lift is gone — every work
       cell is a catalog tier now — so lift-artifact is 0 and all 80 are the catalog moving a
       type-picker series relative to another on purpose (bunk and loft beds rising to the
       catalog's bunk-loft tier, wall-bed rising to murphy-bed's $350 entry, the AC multi-unit
       series coming DOWN to a band the catalog can defend). If either number moves, say why in
       the commit — and check it is not the shape of defect Codex found in interior-painting,
       where an option's label described a harder job than the catalog row it was priced from. */
    assert.equal(c.byDriver['catalog-or-contract'], 82);
    assert.equal(c.byDriver['lift-artifact'], 0);
});

test('every page carrying a data-price-src marker is one the generator writes', () => {
    /* A marker on a page the generator does not own would never be written, so it would quietly
       keep whatever number was typed next to it. */
    const owned = new Set(readJson('pricing/site-map.json').proseFigures.files.map((f) => f.file));
    for (const file of everyPage()) {
        if (!read(file).includes('data-price-src=')) continue;
        assert.ok(owned.has(file), `${file} has data-price-src markers but is not in proseFigures.files`);
    }
});

test('every data-price-src figure equals the catalog', () => {
    /* The marker is the contract: the attribute says which catalog figure the sentence quotes,
       and the generator writes the text. If a human edits the text, the generation check above
       fails; this one proves the markers resolve at all and that no page carries a stale one. */
    let found = 0;
    for (const file of everyPage()) {
        for (const m of read(file).matchAll(/<span data-price-src="([^"]+)"[^>]*>([^<]*)<\/span>/g)) {
            found += 1;
            assert.match(m[2], /^\$[0-9][0-9,]*(–\$[0-9][0-9,]*)?$/, `${file}: ${m[1]} renders "${m[2]}"`);
        }
    }
    assert.ok(found > 0, 'no data-price-src markers found — the mechanism was removed');
});

test('the AI guides quote the catalog and nothing below the minimum', () => {
    for (const file of ['llms.txt', 'llms-full.txt']) {
        const src = read(file);
        assert.ok(src.includes(`- Work minimum: $${REPAIR_MINIMUM} for any work performed on a visit.`), `${file} lost the work-minimum line`);
        assert.ok(!/Furniture assembly[^\n]*\$1[0-4]\d\b/.test(src), `${file} still publishes furniture assembly below the minimum`);
        assert.ok(!/TV mounting[^\n]*\$1[0-4]\d\b/.test(src), `${file} still publishes TV mounting below the minimum`);
    }
});

test('facts.json states the model the rest of the site now follows', () => {
    const facts = readJson('facts.json');
    assert.equal(facts.pricingModel.workMinimumUSD, REPAIR_MINIMUM);
    assert.equal(facts.pricingModel.onSiteAssessmentVisitUSD, ASSESSMENT_FEE);
    assert.equal(facts.pricingModel.assessmentCreditedTowardWork, true);
});

// ── 9. the hub calculators still derive from the leaves ───────────────────────────────

test('every hub range is the span of the leaf prices it claims to summarise', () => {
    const hubs = readJson('assets/data/hub-calculators.json');
    let checked = 0;
    for (const hub of Object.values(hubs)) {
        for (const [leafKey, jobs] of Object.entries(hub.pricing)) {
            for (const [jobKey, [lo, hi]] of Object.entries(jobs)) {
                const leaf = projection[leafKey]?.[jobKey];
                assert.ok(leaf, `hub quotes ${leafKey}.${jobKey}, which the price table does not have`);
                const values = Object.values(leaf);
                assert.equal(lo, Math.min(...values.map((v) => v[0])), `${leafKey}.${jobKey} low`);
                assert.equal(hi, Math.max(...values.map((v) => v[1])), `${leafKey}.${jobKey} high`);
                /* dryer/gas and range/gas-freestanding + cooktop are the frozen Local Law 429
                   ladders, carried forward below the minimum on purpose. Nothing else may be. */
                const frozenGasLeaf = (leafKey === 'dryer' && jobKey === 'gas')
                    || (leafKey === 'range' && (jobKey === 'gas-freestanding' || jobKey === 'cooktop'));
                assert.ok(lo >= REPAIR_MINIMUM || frozenGasLeaf, `${leafKey}.${jobKey} is below the minimum`);
                checked += 1;
            }
        }
    }
    assert.ok(checked > 300, `expected every hub cell, checked ${checked}`);
});

test('the window-AC widget the browser reads is the window-AC widget the price table records', () => {
    /* CODEX ROUND 2. The generic calculators are safe because the generator WRITES their grids
       into calculator.js and reads them back. The window-AC widget is different: main.js computes
       it from data-lo / data-hi attributes in the page's own HTML, and the generator only copies
       the previous version's widget block forward. Nothing compared the two, so editing
       data-hi="165" to data-hi="500" in the page would move the price a customer is shown AND the
       figure their lead carries, while --check stayed green and the committed table still said
       $120-$165.

       This does not price anything — the widget's figures are unchanged by the repricing and the
       $150 work minimum is applied in main.js before render and before the snapshot. It closes the
       one path left by which a hand-typed number could reach a customer. */
    const table = readJson(`pricing/price-tables/${CATALOG_VERSION}.json`).windowAcWidget;
    const html = read('services/ac-installation-cleaning/window-ac-installation/index.html');
    const options = [...html.matchAll(/<option value="([^"]+)"\s+data-lo="(\d+)"\s+data-hi="(\d+)"/g)]
        .map(([, v, lo, hi]) => ({ v, lo: Number(lo), hi: Number(hi) }));
    assert.ok(options.length >= 4, `only ${options.length} BTU options found in the page`);
    assert.deepEqual(options, table.btu,
        'the BTU options in the page and the committed windowAcWidget table disagree. The page is what '
        + 'the browser reads and what the lead snapshot is built from; the table is what the CRM verifies '
        + 'an old lead against. They are the same numbers or a lead is a forgery.');
    assert.equal(table.applyRepairMinimum, true);

    /* Codex round 3, finding 2: the page also ships a STATIC figure in #calc-price, which is what
       a reader sees before the script runs and what they keep if it never does. It said $190–$260
       while the widget's own default state computes $170–$215 — the cheapest BTU option plus the
       one add-on the page ships switched on. Recomputed here from the page's own attributes so it
       cannot be typed wrong again. */
    const activeAddOns = [...html.matchAll(/class="svc-calculator__toggle active"[\s\S]{0,160}?data-price="(\d+)"/g)]
        .reduce((sum, [, n]) => sum + Number(n), 0);
    const first = table.btu[0];
    const expectLo = Math.max(first.lo + activeAddOns, REPAIR_MINIMUM);
    const expectHi = Math.max(first.hi + activeAddOns, REPAIR_MINIMUM);
    const placeholder = /<div class="svc-calculator__estimate-price" id="calc-price">([^<]*)<\/div>/.exec(html);
    assert.ok(placeholder, 'the window-AC page has no #calc-price');
    assert.equal(placeholder[1], `$${expectLo}&ndash;$${expectHi}`,
        'the static price the page ships is not the price its own default state computes');
    // And the floor really is applied on the render path, not just recorded as intended.
    const main = read('main.js');
    assert.match(main, /^const REPAIR_ASAP_WORK_MINIMUM = 150;$/m);
    // per-unit AND total, which is what contract §4 requires of this widget.
    assert.equal((main.match(/Math\.max\(roundNearest5\([^\n]*REPAIR_ASAP_WORK_MINIMUM\)/g) || []).length, 4,
        'the $150 floor must be applied to both the per-unit and the total figure, low and high');
});

// ── 12. structured data is plain text, and it says what the page says ─────────────────

/* Two defects, one root: a price written into a page's FAQ.
 *
 * The first was a `<span data-price-src="const.repairMinimum">$150</span>` marker dropped inside
 * a FAQPage answer on services/flooring-installation/floor-repair/. Its double quotes closed the
 * JSON string, the block stopped parsing, and CI went red — but only because that particular
 * mistake happened to be *invalid* JSON. The same marker with single-quoted attributes parses
 * fine and publishes raw markup to every crawler.
 *
 * The second was found looking for more of the first: five pages whose FAQ answer existed twice —
 * once as structured data, once as the paragraph a human reads — with DIFFERENT prices in the two.
 * floor-repair told a crawler $200–$1,500 and a reader $200–$500+ for the same question. Google
 * requires a FAQ rich result to match the visible answer, so that is both a policy violation and
 * a customer reading a number we would not honour.
 */

const LD_BLOCK = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

test('no page puts HTML markup inside a JSON-LD block', () => {
    let blocks = 0;
    for (const file of everyPage()) {
        if (!file.endsWith('.html')) continue;
        for (const [, body] of read(file).matchAll(LD_BLOCK)) {
            blocks += 1;
            assert.ok(!/<[a-zA-Z/!]/.test(body),
                `${file}: HTML markup inside JSON-LD. Structured data is plain text; a price there is written by ` +
                'proseFigures.inlineRanges (digits), never by a data-price-src span.');
            assert.doesNotThrow(() => JSON.parse(body.trim()), `${file}: JSON-LD does not parse`);
        }
    }
    assert.ok(blocks > 300, `expected the whole site's JSON-LD to be swept, only saw ${blocks} blocks`);
});

test('every FAQ answer states the same prices in its structured data and in the visible copy', () => {
    const strip = (h) => h.replace(/<[^>]*>/g, ' ').replace(/&mdash;/g, '—').replace(/&amp;/g, '&')
        .replace(/&ndash;/g, '–').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    const money = (t) => (t.match(/\$[0-9][0-9,]*(?:\.\d+)?\+?/g) || []).join(' ');
    let pairs = 0;

    for (const file of everyPage()) {
        if (!file.endsWith('.html')) continue;
        const html = read(file);

        const answers = [];
        for (const [, body] of html.matchAll(LD_BLOCK)) {
            let parsed;
            try { parsed = JSON.parse(body.trim()); } catch { continue; }
            for (const node of (Array.isArray(parsed) ? parsed : [parsed])) {
                if (node?.['@type'] !== 'FAQPage') continue;
                for (const q of node.mainEntity || []) answers.push([q.name, q.acceptedAnswer?.text ?? '']);
            }
        }
        if (!answers.length) continue;

        const visible = new Map();
        for (const [, block] of html.matchAll(/<details[^>]*class="svc-faq__item"[^>]*>([\s\S]*?)<\/details>/gi)) {
            const q = /<summary[^>]*>([\s\S]*?)<\/summary>/i.exec(block);
            const a = /<div class="svc-faq__answer">([\s\S]*?)<\/div>/i.exec(block);
            if (q && a) visible.set(strip(q[1]), strip(a[1]));
        }

        for (const [question, answer] of answers) {
            const shown = visible.get(strip(question));
            if (shown === undefined) continue;   // not every FAQ block is rendered as an accordion
            pairs += 1;
            assert.equal(money(answer), money(shown),
                `${file}: "${question}" is answered with different prices in structured data and in the visible copy`);
        }
    }
    assert.ok(pairs > 300, `expected the site's FAQ pairs to be swept, only matched ${pairs}`);
});

/* The third shape of the same defect: an ENTRY-PRICE promise in page copy that the page's own
 * calculator no longer honours. dresser-assembly, ice-machine-cleaning and dryer-vent-cleaning all
 * said "from $150" while this repricing moved their cheapest cell to $185, $225 and $175 — copy
 * that was correct at calc-2026-08-01 and became an advertised price we would not accept.
 *
 * "3. Work From $150" is excluded by name: that is the shared how-it-works step stating the
 * site-wide work minimum, it is on 86 pages, and it is true.
 */
test('no page promises an entry price below its own calculator', () => {
    const CONFIGS = { ...evalConfigs(read('components/modules/calculator.js')), ...readJson('assets/data/hub-calculators.json') };
    const BOILERPLATE = /Work From \$150|\$150 work minimum/gi;
    const CLAIM = /(?:starts? (?:at|from|around)|typically runs|start(?:ing)? around|priced from|from)\s+\$([0-9][0-9,]*)/gi;

    let claims = 0;
    for (const file of everyPage()) {
        if (!file.endsWith('.html')) continue;
        const html = read(file);
        const mounted = /data-module="calculator"[^>]*data-config="([^"]+)"/.exec(html);
        const cfg = mounted && CONFIGS[mounted[1]];
        if (!cfg?.pricing) continue;

        const priced = Object.values(cfg.pricing).flatMap((s) => Object.values(s))
            .filter(([lo, hi]) => !isFreePhoto([lo, hi]) && !isAssessment([lo, hi]));
        if (!priced.length) continue;
        const floor = Math.max(Math.min(...priced.map((v) => v[0])), cfg.mode === 'visit' ? 0 : REPAIR_MINIMUM);

        const text = html
            .replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
            .replace(/<[^>]*>/g, ' ').replace(/&ndash;/g, '–').replace(/&mdash;/g, '—')
            .replace(/\s+/g, ' ').replace(BOILERPLATE, ' ');

        for (const m of text.matchAll(CLAIM)) {
            const claimed = Number(m[1].replace(/,/g, ''));
            if (claimed === ASSESSMENT_FEE || claimed === 0) continue;
            claims += 1;
            assert.ok(claimed >= floor,
                `${file}: copy promises "${m[0]}" but the cheapest cell of its own "${mounted[1]}" calculator is $${floor}`);
        }
    }
    assert.ok(claims > 10, `expected the entry-price claims to be swept, only saw ${claims}`);
});
