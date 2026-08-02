'use strict';

/*
 * Both calculators must record the estimate the customer was looking at, in fields, using
 * the same key names — so nothing downstream has to read a price out of an English
 * sentence, and so a later price change never rewrites what was promised.
 *
 * These tests execute the real source (no re-implementation): main.js runs in a VM,
 * components/modules/calculator.js runs against a DOM stub that returns the module's own
 * generated markup, and the custom-field ordering is evaluated straight out of
 * components/quote-modal.js.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const mainSource = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
const calcSource = fs.readFileSync(path.join(root, 'components', 'modules', 'calculator.js'), 'utf8');
const modalSource = fs.readFileSync(path.join(root, 'components', 'quote-modal.js'), 'utf8');

const PRICE_VERSION_SHAPE = /^calc-\d{4}-\d{2}-\d{2}$/;

/* The generated table these tests read their expected figures from, plus the live CONFIGS.
   Nothing in this file types a price: a repricing must not be able to turn a snapshot-shape
   regression test red. */
const liveVersion = /const CALC_PRICE_VERSION = '([^']+)';/.exec(calcSource)[1];
const priceTable = JSON.parse(fs.readFileSync(path.join(root, 'pricing', 'price-tables', `${liveVersion}.json`), 'utf8'));
// eslint-disable-next-line no-eval
const configs = eval(`${calcSource.slice(0, calcSource.indexOf('export default function calculator'))}\nCONFIGS`);

/* ---------------------------------------------------------------- DOM stubs -- */

const noopClassList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };

function parseOptions(html) {
    const out = [];
    const re = /<option value="([^"]*)">([\s\S]*?)<\/option>/g;
    let m;
    while ((m = re.exec(html))) out.push({ value: m[1], text: m[2] });
    return out;
}

function makeElement(extra = {}) {
    return {
        textContent: '',
        innerHTML: '',
        disabled: false,
        style: {},
        classList: noopClassList,
        addEventListener() {},
        ...extra,
    };
}

/* A <select> that keeps the option labels the module itself rendered, so
   selectedOptions[0].text is the real wording the customer would have read. */
function makeSelect(cat) {
    const handlers = {};
    return {
        dataset: { cat },
        value: '',
        disabled: false,
        style: {},
        classList: noopClassList,
        options: [],
        set innerHTML(html) { this.options = parseOptions(html); },
        get innerHTML() { return ''; },
        get selectedOptions() {
            const hit = this.options.find(o => o.value === this.value);
            return hit ? [hit] : [];
        },
        addEventListener(type, fn) { handlers[type] = fn; },
        fire(type) { if (handlers[type]) handlers[type](); },
    };
}

function makeCalculatorContainer(configKey) {
    const seriesSel = makeSelect('series');
    const sizeSel = makeSelect('size');
    const cta = (() => {
        const handlers = {};
        return {
            ...makeElement(),
            addEventListener(type, fn) { handlers[type] = fn; },
            fire(type) { if (handlers[type]) handlers[type](); },
        };
    })();

    const nodes = {
        '.mod-calc__result-placeholder': makeElement(),
        '.mod-calc__result-price': makeElement(),
        '.mod-calc__price-lo': makeElement(),
        '.mod-calc__price-hi': makeElement(),
        '.mod-calc__price-sep': makeElement(),
        '.mod-calc__result-note': makeElement(),
        '.mod-calc__cta': cta,
        '[data-cat="series"]': seriesSel,
        '[data-cat="size"]': sizeSel,
        '[data-field="size"]': makeElement(),
    };

    const container = {
        dataset: { config: configKey },
        seriesSel,
        sizeSel,
        cta,
        set innerHTML(html) {
            // Hand each select the options the module just rendered for it.
            for (const [cat, sel] of [['series', seriesSel], ['size', sizeSel]]) {
                const block = new RegExp(`data-cat="${cat}"[\\s\\S]*?</select>`).exec(html);
                sel.options = block ? parseOptions(block[0]) : [];
            }
        },
        get innerHTML() { return ''; },
        querySelector(sel) { return nodes[sel] || null; },
        querySelectorAll(sel) { return sel === '.mod-calc__select' ? [seriesSel, sizeSel] : []; },
    };
    return container;
}

/* --------------------------------------------------------------- VM loaders -- */

function baseContext() {
    const window = {
        location: { pathname: '/services/furniture-assembly/ikea-assembly/', href: 'https://asap.repair/', search: '', origin: 'https://asap.repair', hostname: 'asap.repair', protocol: 'https:' },
        crypto: { randomUUID: () => 'uuid' },
        addEventListener() {},
        setTimeout() { return 1; },
        matchMedia() { return { matches: false, addEventListener() {} }; },
        innerHeight: 900,
        scrollY: 0,
        scrollTo() {},
    };
    window.window = window;
    const storage = new Map();
    const document = {
        readyState: 'loading',
        referrer: '',
        cookie: '',
        activeElement: null,
        addEventListener() {},
        querySelectorAll() { return []; },
        querySelector() { return null; },
        getElementById() { return null; },
        createElement() { return makeElement({ appendChild() {} }); },
        body: { appendChild() {}, style: {} },
        head: { appendChild() {} },
    };
    return {
        window,
        document,
        navigator: { language: 'en-US', sendBeacon: null },
        localStorage: {
            getItem(k) { return storage.has(k) ? storage.get(k) : null; },
            setItem(k, v) { storage.set(k, String(v)); },
            removeItem(k) { storage.delete(k); },
        },
        sessionStorage: { setItem() {}, getItem() { return null; } },
        URL, URLSearchParams, Intl, Date, Math, Number, String, Object, Array, JSON, RegExp, Map, Set,
        Blob: class {},
        fetch: async () => ({ ok: true, json: async () => ({}) }),
        MutationObserver: class { observe() {} },
        IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
        requestAnimationFrame() {},
        setTimeout() { return 1; },
        clearTimeout() {},
        performance: { now: () => 0 },
        console,
    };
}

function loadMain(context) {
    vm.runInContext(mainSource, context, { filename: 'main.js' });
    return context.window;
}

/* calculator.js is an ES module and this repo has no bundler or node_modules, so the real
   source is executed with the single `export default` keyword removed — the same trick
   scripts/generate-hub-calculators.mjs already relies on to read CONFIGS. */
function loadCalculator(context) {
    const runnable = calcSource.replace('export default function calculator', 'function calculator');
    vm.runInContext(`${runnable}\n;globalThis.__calcModule = { calculator, CALC_PRICE_VERSION };`, context, { filename: 'calculator.js' });
    return vm.runInContext('__calcModule', context);
}

/* Drive a real calculator instance to the CTA and return what it stored for the CRM.
   `patchConfigs` injects a grid into the live CONFIGS before the module renders — the only way
   left to exercise the $150 floor now that the catalog projection has authored every real cell
   above it. It touches nothing on disk. */
function runCalculator({ configKey, series, size, pathname, patchConfigs }) {
    const context = baseContext();
    if (pathname) context.window.location.pathname = pathname;
    vm.createContext(context);
    loadMain(context);
    const { calculator, CALC_PRICE_VERSION } = loadCalculator(context);
    if (patchConfigs) {
        vm.runInContext(`Object.assign(CONFIGS, ${JSON.stringify(patchConfigs)});`, context, { filename: 'patch.js' });
    }

    const container = makeCalculatorContainer(configKey);
    calculator(container);

    container.seriesSel.value = series;
    container.seriesSel.fire('change');
    container.sizeSel.value = size;
    container.sizeSel.fire('change');
    container.cta.fire('click');

    return { fields: context.window._calcQuoteData, priceVersion: CALC_PRICE_VERSION };
}

/* ------------------------------------------------------- the shared contract -- */

test('the snapshot builder records what was displayed and never invents a price', () => {
    const context = baseContext();
    vm.createContext(context);
    const window = loadMain(context);
    const build = window.repairAsapBuildQuoteSnapshot;
    assert.equal(typeof build, 'function', 'main.js must expose the shared builder');
    assert.match(window.REPAIR_ASAP_CALC_PRICE_VERSION, PRICE_VERSION_SHAPE);

    const ranged = build({
        configKey: 'desk', path: 'range', low: 150, high: 165,
        rangeText: '$150–$165', selectionText: 'A — B', displayText: 'A — B (estimated $150–$165)',
    });
    assert.equal(ranged.estimated_low, 150);
    assert.equal(ranged.estimated_high, 165);
    assert.equal(ranged.estimated_range, '$150–$165');
    assert.equal(ranged.calculator_path, 'range');
    assert.equal(ranged.calculator_selection, 'A — B');
    assert.equal(ranged.calculator_estimate, 'A — B (estimated $150–$165)');
    assert.match(ranged.calculator_price_version, PRICE_VERSION_SHAPE);

    // A page that quoted no price FOR THE WORK must not report one. "FREE" is a free
    // ESTIMATE, and estimated_low: 0 would read downstream as an offer of free work.
    const photo = build({
        configKey: 'refrigerator-repair', path: 'photo_estimate', low: 0, high: 0,
        rangeText: 'FREE', selectionText: 'X', displayText: 'X (free photo estimate requested)',
    });
    assert.equal('estimated_low' in photo, false);
    assert.equal('estimated_high' in photo, false);
    assert.equal('estimated_range' in photo, false);
    assert.equal(photo.calculator_path, 'photo_estimate');

    // Same rule for the $99 on-site assessment. $99 buys a visit, not the repair, and it is
    // credited toward the job; the work minimum is $150. Sending it as estimated_low made
    // the CRM read outcome 'single' at $99 instead of 'assessment_fee' and instruct the AI
    // that "the customer's price expectation is $99" — the $99-as-the-work-minimum mistake,
    // handed to the model as a hard rule. The fee is still in the prose, verbatim.
    const assessment = build({
        configKey: 'washer-repair', path: 'assessment_99', low: 99, high: 99,
        rangeText: '$99', selectionText: 'Leaking — Book on-site assessment',
        displayText: 'Leaking — Book on-site assessment ($99 on-site assessment, credited toward the work)',
    });
    assert.equal('estimated_low' in assessment, false);
    assert.equal('estimated_high' in assessment, false);
    assert.equal('estimated_range' in assessment, false);
    assert.equal(assessment.calculator_path, 'assessment_99');
    assert.match(assessment.calculator_estimate, /\$99 on-site assessment, credited toward the work/);

    // An unknown path is a bug, not a new outcome — it must not be passed through.
    assert.equal(build({ configKey: 'x', path: 'made_up', low: 1, high: 2 }).calculator_path, '');

    // The CRM drops any value that is not a string / number / boolean
    // (app/api/widget/quote/route.ts:112), so a nested value would vanish in silence.
    for (const [key, value] of Object.entries(ranged)) {
        assert.ok(['string', 'number', 'boolean'].includes(typeof value), `${key} must be a scalar`);
    }

    // A caller that owns its own price table names it.
    assert.equal(build({ configKey: 'x', path: 'single', low: 150, high: 150, priceVersion: 'calc-1999-01-01' }).calculator_price_version, 'calc-1999-01-01');
});

/* ------------------------------------------ the generic calculator, 3 paths -- */

test('generic calculator: a priced range is recorded as numbers, not prose', () => {
    /* The exact selection behind the real 2026-07-23 lead from /desk-assembly/. The two figures
       are READ FROM THE GENERATED PRICE TABLE, not typed here: this test is about the snapshot's
       shape and wording, and hard-coding the price is what made it fail the first time a
       repricing landed. If the numbers below are wrong, the table is wrong, and
       pricing-catalog-projection.test.js is the test that says so. */
    const [expectedLow, expectedHigh] = priceTable.modularCalculator.desk.standing.md;
    const { fields, priceVersion } = runCalculator({
        configKey: 'desk', series: 'standing', size: 'md',
        pathname: '/services/furniture-assembly/desk-assembly/',
    });
    assert.equal(fields.calculator_config, 'desk');
    assert.equal(fields.calculator_path, 'range');
    assert.equal(fields.estimated_low, expectedLow);
    assert.equal(fields.estimated_high, expectedHigh);
    assert.equal(fields.estimated_range, `$${expectedLow}–$${expectedHigh}`);
    assert.equal(fields.calculator_selection, 'Standing / Adjustable Desk — Electric — single motor');
    assert.equal(fields.calculator_price_version, priceVersion);
    // Unchanged wording — leads since 2026-07 are stored in exactly this form.
    assert.equal(
        fields.calculator_estimate,
        `Standing / Adjustable Desk — Electric — single motor (estimated $${expectedLow}–$${expectedHigh}, work only — NYC sales tax separate)`,
    );
    assert.equal(fields.calculator_series, 'standing');
    assert.equal(fields.calculator_size, 'md');
});

test('generic calculator: a range collapsed by the $150 work minimum is recorded as single', () => {
    /* Under calc-2026-08-01 this was a live state: ikea/kallax/sm priced [65, 99], the floor
       lifted both ends to 150, and the box rendered one figure. calc-2026-09-01 authors every
       real cell above the minimum, so no reachable selection collapses any more (asserted
       below). The floor stays in the code as insurance against a future table, and insurance
       nothing exercises is not insurance — so the sub-floor grid is injected here. */
    const { fields } = runCalculator({
        configKey: 'ikea', series: 'kallax', size: 'sm',
        patchConfigs: { ikea: { ...configs.ikea, pricing: { ...configs.ikea.pricing, kallax: { sm: [65, 99], md: [99, 150], lg: [150, 220] } } } },
    });
    assert.equal(fields.calculator_path, 'single');
    assert.equal(fields.estimated_low, 150);
    assert.equal(fields.estimated_high, 150);
    assert.equal(fields.estimated_range, '$150');
    assert.match(fields.calculator_estimate, /estimated \$150 minimum repair visit/);
});

test('no reachable priced selection collapses onto the bare work minimum any more', () => {
    /* The point of the calc-2026-09-01 repricing, stated as a test. 111 cells used to render a
       flat "$150" because the floor was doing the authoring; the catalog now authors them. The
       $0 photo-estimate and $99 assessment cells are paths, not work, and are exempt. */
    const flat = [];
    for (const [configKey, ladders] of Object.entries(priceTable.modularCalculator)) {
        for (const [series, sizes] of Object.entries(ladders)) {
            for (const [size, [lo, hi]] of Object.entries(sizes)) {
                if (lo === 0 && hi === 0) continue;       // free photo estimate
                if (lo === 99 && hi === 99) continue;     // $99 on-site assessment, credited
                if (lo === hi) flat.push(`${configKey}.${series}.${size} = $${lo}`);
            }
        }
    }
    assert.deepEqual(flat, []);
});

test('generic calculator: the $99 on-site assessment is recorded as a PATH, never as a price', () => {
    const { fields } = runCalculator({
        configKey: 'refrigerator-repair', series: 'not-cooling', size: 'visit',
        pathname: '/services/appliance-services/refrigerator-repair/',
    });
    assert.equal(fields.calculator_path, 'assessment_99');
    // $99 is the assessment VISIT, credited toward the work — not a quote for the job, and
    // below the $150 work minimum. It must not arrive in the CRM as estimated_low.
    assert.equal('estimated_low' in fields, false);
    assert.equal('estimated_high' in fields, false);
    assert.equal('estimated_range' in fields, false);
    assert.equal(fields.calculator_selection, 'Not cooling / not cold enough — Book on-site assessment');
    assert.match(fields.calculator_estimate, /\$99 on-site assessment, credited toward the work/);
});

test('generic calculator: the free photo path carries no price at all', () => {
    const { fields } = runCalculator({
        configKey: 'refrigerator-repair', series: 'not-cooling', size: 'photo',
        pathname: '/services/appliance-services/refrigerator-repair/',
    });
    assert.equal(fields.calculator_path, 'photo_estimate');
    assert.equal('estimated_low' in fields, false);
    assert.equal('estimated_high' in fields, false);
    assert.equal('estimated_range' in fields, false);
    assert.match(fields.calculator_estimate, /free photo estimate requested/);
});

test('generic calculator: visit-mode defined work is a priced range like any other', () => {
    const { fields } = runCalculator({
        configKey: 'refrigerator-repair', series: 'not-cooling', size: 'work',
        pathname: '/services/appliance-services/refrigerator-repair/',
    });
    assert.equal(fields.calculator_path, 'range');
    assert.equal(fields.estimated_low, 175);
    assert.equal(fields.estimated_high, 260);
    assert.equal(fields.estimated_range, '$175–$260');

    /* The figure the dropdown LABEL prints has to be the same figure, or the same line of the
       same select says two prices. The label is generated from the catalog tier now
       (site-map.json visitWork), and this is what proves the two did not drift apart. */
    const label = calcSource.slice(calcSource.indexOf("'refrigerator-repair': visitConfig({"));
    assert.match(label.slice(0, label.indexOf('}),')), /workLabel: 'Condenser coil deep clean \(\$175–\$260\)'/);
});

test('every generic preset produces a known path, and a price only when one was shown', () => {
    const context = baseContext();
    vm.createContext(context);
    loadMain(context);
    const runnable = calcSource.slice(0, calcSource.indexOf('export default function calculator'));
    const CONFIGS = vm.runInContext(`${runnable}\nCONFIGS`, context);

    let checked = 0;
    for (const [configKey, cfg] of Object.entries(CONFIGS)) {
        for (const [series, sizes] of Object.entries(cfg.pricing || {})) {
            for (const size of Object.keys(sizes || {})) {
                if (!series || !size) continue;
                const { fields } = runCalculator({ configKey, series, size });
                assert.ok(
                    ['range', 'single', 'assessment_99', 'photo_estimate'].includes(fields.calculator_path),
                    `${configKey}/${series}/${size} produced path "${fields.calculator_path}"`,
                );
                const priced = 'estimated_low' in fields;
                // Only the two paths that quoted the WORK carry a price. photo_estimate
                // showed no figure; assessment_99 showed a visit fee that is credited back.
                assert.equal(priced, ['range', 'single'].includes(fields.calculator_path),
                    `${configKey}/${series}/${size} price keys disagree with its path`);
                if (priced) {
                    assert.ok(Number.isFinite(fields.estimated_low) && fields.estimated_low > 0);
                    assert.ok(fields.estimated_high >= fields.estimated_low);
                    // The recorded range string must be the figures, formatted the way the
                    // price box formats them — never a recomputed or rounded number.
                    const expected = fields.estimated_high > fields.estimated_low
                        ? `$${fields.estimated_low}–$${fields.estimated_high}`
                        : `$${fields.estimated_low}`;
                    assert.equal(fields.estimated_range, expected);
                }
                assert.ok(fields.calculator_selection.length > 0);
                checked++;
            }
        }
    }
    assert.ok(checked > 300, `expected the whole preset table to be exercised, saw ${checked}`);
});

/* ------------------------------------------------- the window-AC calculator -- */

function acHarness({ qty = '1', building = 'coop-condo' } = {}) {
    const mkOpt = (value, text, data = {}) => ({ value, text, dataset: data });
    const mkSel = (id, options, value) => {
        const handlers = {};
        const sel = {
            id,
            options,
            value,
            get selectedIndex() { return this.options.findIndex(o => o.value === this.value); },
            addEventListener(type, fn) { handlers[type] = fn; },
            fire(type) { if (handlers[type]) handlers[type](); },
        };
        return sel;
    };

    const btu = mkSel('calc-btu', [mkOpt('12k', '12,000 BTU (medium room)', { lo: '150', hi: '200', complexity: '1' })], '12k');
    const qtySel = mkSel('calc-qty', [mkOpt('1', '1 unit', { discount: '0' }), mkOpt('2', '2 units', { discount: '0' })], qty);
    const win = mkSel('calc-window', [mkOpt('double-hung', 'Double-hung (+$0)', { surcharge: '0', complexity: '0' })], 'double-hung');
    const floor = mkSel('calc-floor', [mkOpt('2-5', 'Floor 2–5 (+$0)', { surcharge: '0', complexity: '0' })], '2-5');
    const bld = mkSel('calc-building', [mkOpt('coop-condo', 'Co-op / condo', { complexity: '1' })], building);

    const byId = {
        'calc-btu': btu, 'calc-qty': qtySel, 'calc-window': win, 'calc-floor': floor, 'calc-building': bld,
        'calc-price': makeElement(), 'calc-label': makeElement(), 'calc-badge': makeElement(),
        'calc-hints': makeElement(),
    };
    const ctaHandlers = {};
    byId['calc-cta'] = { ...makeElement(), addEventListener(t, fn) { ctaHandlers[t] = fn; } };

    const widget = {
        querySelector(sel) { return byId[sel.replace('#', '')] || null; },
        querySelectorAll() { return []; },
    };

    const context = baseContext();
    context.window.location.pathname = '/services/ac-installation-cleaning/window-ac-installation/';
    context.document.querySelector = (sel) => (sel === '.svc-calculator__widget' ? widget : null);
    context.document.getElementById = (id) => byId[id] || null;
    context.window.openQuoteModal = undefined;
    const domReady = [];
    context.document.addEventListener = (type, fn) => { if (type === 'DOMContentLoaded') domReady.push(fn); };
    vm.createContext(context);
    loadMain(context);
    // main.js wires the AC calculator on DOMContentLoaded; run it, then click the CTA.
    domReady.forEach(fn => fn());

    return { context, fireCta: () => ctaHandlers.click && ctaHandlers.click(), priceEl: byId['calc-price'] };
}

test('window-AC calculator: same key names, and the multi-unit figure is no longer mis-parsed', () => {
    const single = acHarness({ qty: '1' });
    single.fireCta();
    const one = single.context.window._calcQuoteData;
    assert.ok(one, 'the AC CTA must store custom fields');
    assert.equal(one.calculator_config, 'window_ac');
    assert.equal(one.calculator_path, 'range');
    assert.equal(one.estimated_low, 150);
    assert.equal(one.estimated_high, 200);
    assert.equal(one.estimated_range, '$150–$200');
    assert.match(one.calculator_price_version, PRICE_VERSION_SHAPE);
    assert.equal(one.calculator_selection, 'AC Size: 12,000 BTU · Quantity: 1 unit · Window Type: Double-hung · Floor Level: Floor 2–5 · Building: Co-op / condo');
    // The price leads the sentence — see the 240-char test below for why.
    assert.equal(
        one.calculator_estimate,
        'Window AC Installation — planning estimate $150–$200 — NYC sales tax added separately'
        + ' — AC Size: 12,000 BTU · Quantity: 1 unit · Window Type: Double-hung · Floor Level: Floor 2–5 · Building: Co-op / condo',
    );
    // Still carries the machine-readable selections the CRM has always been sent.
    assert.equal(one.btu_size, '12k');
    assert.equal(one.qty, '1');
    // source_page used to be overwritten here with a bare slug; the page context owns it now.
    assert.equal('source_page' in one, false);

    const multi = acHarness({ qty: '2' });
    multi.fireCta();
    const two = multi.context.window._calcQuoteData;
    // Two units at $150–$200 each. The old code stripped characters out of the rendered
    // string "$300–$400 ($150–$200/unit)" and read the high end as 400150.
    assert.equal(two.estimated_low, 300);
    assert.equal(two.estimated_high, 400);
    assert.equal(two.estimated_range, '$300–$400');
    assert.match(two.calculator_estimate, /^Window AC Installation — planning estimate \$300–\$400 \(\$150–\$200\/unit\) — NYC sales tax added separately — /);
});

/* The CRM stores every custom field at 240 characters
   (MAX_WIDGET_CUSTOM_FIELD_VALUE_CHARS, app/api/widget/quote/route.ts) and marks the cut
   with an ellipsis. This calculator's selection list is long — five labelled parts plus up
   to six add-ons — so a sentence that ENDS with the price loses the price.
   No hand-written "worst case" here: the option table is read out of the real page and
   every reachable state is generated, because a hand-picked worst case is a guess and this
   file is the only thing standing between a price change and a silently clipped record. */
function windowAcOptionTable() {
    const html = fs.readFileSync(path.join(
        root, 'services', 'ac-installation-cleaning', 'window-ac-installation', 'index.html'), 'utf8');
    const selectOptions = (id) => {
        const block = new RegExp(`<select[^>]*id="${id}"[\\s\\S]*?</select>`).exec(html);
        assert.ok(block, `#${id} not found on the window-AC page`);
        return [...block[0].matchAll(/<option([^>]*)>([\s\S]*?)<\/option>/g)].map((m) => {
            const attrs = {};
            for (const a of m[1].matchAll(/([a-z-]+)="([^"]*)"/g)) attrs[a[1]] = a[2];
            return { attrs, text: m[2].replace(/\s+/g, ' ').trim() };
        });
    };
    const toggles = [...html.matchAll(
        /<button[^>]*class="[^"]*svc-calculator__toggle[^"]*"[\s\S]*?<\/button>/g)].map((m) => {
        const attrs = {};
        for (const a of m[0].matchAll(/data-([a-z-]+)="([^"]*)"/g)) attrs[a[1]] = a[2];
        return {
            price: Number(attrs.price || 0),
            // main.js: b.textContent.trim().replace(/\s+/g,' ').split(' (+')[0]
            label: m[0].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().split(' (+')[0],
        };
    });
    return {
        btu: selectOptions('calc-btu'), qty: selectOptions('calc-qty'),
        win: selectOptions('calc-window'), floor: selectOptions('calc-floor'),
        building: selectOptions('calc-building'), toggles,
    };
}

/* Replays main.js updateCalc() + the CTA's label derivation for one state.
   The $150 work minimum and the single-figure collapse are part of that replay: main.js floors
   the per-unit figure and then the total, and prints one figure when the floor puts low and high
   on the same number. A replay without them models a page that does not exist — the cheapest
   state would be checked as "$120–$165" when the page says "$150–$165" — and the 240-char
   analysis below would be measuring the wrong strings (Codex round 2, finding 4). */
const WORK_MINIMUM = 150;
function windowAcState(t, b, q, w, f, g, mask) {
    const active = t.toggles.filter((_, i) => mask & (1 << i));
    const addOnTotal = active.reduce((s, x) => s + x.price, 0);
    const r5 = (n) => Math.round(n / 5) * 5;
    const surcharge = Number(w.attrs['data-surcharge'] || 0) + Number(f.attrs['data-surcharge'] || 0);
    const subLo = Number(b.attrs['data-lo']) + surcharge + addOnTotal;
    const subHi = Number(b.attrs['data-hi']) + surcharge + addOnTotal;
    const units = Number(q.attrs.value);
    const discount = Number(q.attrs['data-discount'] || 0) / 100;
    const perUnitLo = Math.max(r5(subLo * (1 - discount)), WORK_MINIMUM);
    const perUnitHi = Math.max(r5(subHi * (1 - discount)), WORK_MINIMUM);
    const totalLo = Math.max(r5(perUnitLo * units), WORK_MINIMUM);
    const totalHi = Math.max(r5(perUnitHi * units), WORK_MINIMUM);
    const money = (lo, hi) => (hi > lo ? `$${lo}–$${hi}` : `$${lo}`);
    const rangeText = money(totalLo, totalHi);
    const shownPrice = units > 1
        ? `${rangeText} (${money(perUnitLo, perUnitHi)}/unit)`
        : rangeText;
    const addOns = active.filter((x) => String(x.price) !== '0').map((x) => x.label);
    const selectionText = [
        `AC Size: ${b.text.split(' (')[0]}`,
        `Quantity: ${q.text}`,
        `Window Type: ${w.text.split(' (+')[0]}`,
        `Floor Level: ${f.text.split(' (+')[0]}`,
        `Building: ${g.text}`,
        addOns.length ? `Add-ons: ${addOns.join(', ')}` : null,
    ].filter(Boolean).join(' · ');
    return { rangeText, shownPrice, selectionText, low: totalLo, high: totalHi };
}

test('window-AC calculator: EVERY reachable state keeps its price inside the CRM 240-char cap', () => {
    const CRM_FIELD_CAP = 240;
    const build = (() => {
        const context = baseContext();
        vm.createContext(context);
        return loadMain(context).repairAsapBuildQuoteSnapshot;
    })();
    const t = windowAcOptionTable();

    let states = 0, overCap = 0, lostPrice = 0, longestPricePrefix = 0, longestPrefixExample = '';
    for (const b of t.btu) for (const q of t.qty) for (const w of t.win)
        for (const f of t.floor) for (const g of t.building)
            for (let mask = 0; mask < (1 << t.toggles.length); mask++) {
                const s = windowAcState(t, b, q, w, f, g, mask);
                const displayText = `Window AC Installation — planning estimate ${s.shownPrice}`
                    + ` — NYC sales tax added separately — ${s.selectionText}`;
                const snapshot = build({
                    configKey: 'window_ac', path: s.high > s.low ? 'range' : 'single',
                    low: s.low, high: s.high, rangeText: s.rangeText,
                    selectionText: s.selectionText, displayText,
                });
                const value = snapshot.calculator_estimate;
                const stored = value.length > CRM_FIELD_CAP
                    ? `${value.slice(0, CRM_FIELD_CAP - 1)}…`
                    : value;
                states++;
                if (value.length > CRM_FIELD_CAP) overCap++;
                if (!stored.includes(s.shownPrice)) {
                    lostPrice++;
                    assert.fail(`the CRM would store "${stored}" — the price ${s.shownPrice} fell outside the cap`);
                }
                assert.ok(stored.includes('NYC sales tax added separately'),
                    `tax disclosure clipped out of "${stored}"`);
                const prefix = `Window AC Installation — planning estimate ${s.shownPrice}`
                    + ' — NYC sales tax added separately';
                if (prefix.length > longestPricePrefix) {
                    longestPricePrefix = prefix.length;
                    longestPrefixExample = prefix;
                }
            }

    // Pin the measured shape of the problem so the comment in main.js cannot drift from it.
    assert.equal(states, 92160, 'the reachable state count changed — re-measure before trusting the cap');
    assert.equal(overCap, 91960, 'how many states overflow the 240-char cap changed');
    assert.equal(lostPrice, 0);
    assert.equal(longestPricePrefix, 104, `longest price prefix is now "${longestPrefixExample}"`);
    assert.ok(longestPricePrefix < CRM_FIELD_CAP);

    // main.js must keep emitting this order; a future edit that moves the price back to the
    // end would pass every other assertion in this file.
    assert.match(
        mainSource,
        /displayText: `Window AC Installation — planning estimate \$\{acShownPrice\} — NYC sales tax added separately — \$\{acSelectionText\}`/,
        'the window-AC displayText must lead with the price',
    );
});

/* The counterfactual: the SAME exhaustive sweep against the pre-fix wording, which is what
   makes the assertion above worth anything. If this ever stops failing, the cap moved and
   the whole reordering can be reconsidered. */
test('window-AC calculator: the old price-last wording did lose the price, on most states', () => {
    const CRM_FIELD_CAP = 240;
    const t = windowAcOptionTable();
    let states = 0, overCap = 0, lostPrice = 0;
    for (const b of t.btu) for (const q of t.qty) for (const w of t.win)
        for (const f of t.floor) for (const g of t.building)
            for (let mask = 0; mask < (1 << t.toggles.length); mask++) {
                const s = windowAcState(t, b, q, w, f, g, mask);
                const legacy = `Window AC Installation — ${s.selectionText}`
                    + ` (planning estimate ${s.shownPrice} — NYC sales tax added separately)`;
                const stored = legacy.length > CRM_FIELD_CAP
                    ? `${legacy.slice(0, CRM_FIELD_CAP - 1)}…`
                    : legacy;
                states++;
                if (legacy.length > CRM_FIELD_CAP) overCap++;
                if (!stored.includes(s.shownPrice)) lostPrice++;
            }
    assert.equal(states, 92160);
    assert.equal(overCap, 91960);          // 99.78% of states
    /* 89,254 under calc-2026-08-01. The $150 work minimum shortens the cheapest few figures by a
       character or two ("$120–$165" becomes "$150–$165", "$450–$450 ($150–$150/unit)" collapses
       to "$450 ($150/unit)"), so twelve states now squeak the price inside the cap. The point of
       this test is the order of magnitude, not the last digit: price-last lost the figure on
       ~97% of states, which is why the wording leads with it. */
    assert.equal(lostPrice, 89242);        // 96.83% of states lost the figure entirely
});

test('both calculators write the same key names', () => {
    const generic = runCalculator({ configKey: 'desk', series: 'standing', size: 'md' }).fields;
    const ac = (() => { const h = acHarness(); h.fireCta(); return h.context.window._calcQuoteData; })();
    const shared = ['calculator_config', 'calculator_path', 'calculator_selection', 'calculator_estimate',
        'calculator_price_version', 'estimated_low', 'estimated_high', 'estimated_range'];
    for (const key of shared) {
        assert.ok(key in generic, `generic calculator is missing ${key}`);
        assert.ok(key in ac, `window-AC calculator is missing ${key}`);
    }
});

/* ---------------------------------------- the CRM's 20-field budget in quote-modal -- */

function loadOrderCustomFields() {
    const start = modalSource.indexOf('const CRM_CUSTOM_FIELD_LIMIT');
    const marker = '\n    function orderCustomFields(fields) {';
    const end = modalSource.indexOf('\n    }', modalSource.indexOf(marker) + marker.length) + '\n    }'.length;
    assert.ok(start > -1 && end > start, 'quote-modal.js must still define the field-budget logic');
    const src = modalSource.slice(start, end);
    const context = { Map, Object, String, console };
    vm.createContext(context);
    vm.runInContext(`${src}\n;globalThis.__fn = orderCustomFields; globalThis.__limit = CRM_CUSTOM_FIELD_LIMIT;`, context);
    return { orderCustomFields: context.__fn, limit: context.__limit };
}

test('the shown price and the consent evidence survive the CRM 20-field cap', () => {
    const { orderCustomFields, limit } = loadOrderCustomFields();
    assert.equal(limit, 20, 'MAX_WIDGET_CUSTOM_FIELDS in app/api/widget/quote/route.ts');

    // The measured worst case: main.js's taxonomy builder emits 19 context fields for
    // /services/appliance-services/ice-machine-repair/.
    const context = baseContext();
    context.window.location.pathname = '/services/appliance-services/ice-machine-repair/';
    vm.createContext(context);
    const window = loadMain(context);
    const pageContext = window.repairAsapBuildServiceLeadContext({
        service: 'Ice Machine Repair', path: '/services/appliance-services/ice-machine-repair/',
    });
    assert.ok(Object.keys(pageContext).length + 3 > limit,
        'this test is only meaningful while page context alone overflows the budget');

    const calc = runCalculator({
        configKey: 'refrigerator-repair', series: 'not-cooling', size: 'work',
        pathname: '/services/appliance-services/refrigerator-repair/',
    }).fields;

    const sent = orderCustomFields({
        ...pageContext,
        consent_sms: 'granted',
        consent_at: '2026-08-01T00:00:00.000Z',
        consent_policy: 'privacy-policy+tos 2026',
        ...calc,
    });

    assert.ok(Object.keys(sent).length <= limit);
    for (const key of ['calculator_estimate', 'estimated_low', 'estimated_high', 'estimated_range',
        'calculator_path', 'calculator_selection', 'calculator_price_version', 'calculator_config',
        'consent_sms', 'consent_at', 'consent_policy',
        'source_page', 'service_category', 'sub_service', 'compliance_flags']) {
        assert.ok(key in sent, `${key} must survive the budget`);
    }
    // What gets dropped is the tail that repeats itself: compliance_flags already lists
    // every per-flag boolean verbatim.
    assert.equal('epa_608_required' in sent, false);
    // Blank values are skipped the same way the CRM skips them, so they cost no budget.
    assert.equal('addons' in orderCustomFields({ addons: '', source_page: '/x' }), false);
});

test('a page with room keeps everything, in priority order', () => {
    const { orderCustomFields } = loadOrderCustomFields();
    const sent = orderCustomFields({
        crm_taxonomy_version: '2026-07-29',
        source_page: '/services/furniture-assembly/desk-assembly/',
        consent_sms: 'granted',
        calculator_estimate: 'desk (estimated $150–$165)',
        estimated_low: 150,
        estimated_high: 165,
    });
    assert.deepEqual(Object.keys(sent), [
        'calculator_estimate', 'estimated_low', 'estimated_high',
        'consent_sms', 'crm_taxonomy_version', 'source_page',
    ]);
});
