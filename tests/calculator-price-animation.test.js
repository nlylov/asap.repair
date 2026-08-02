'use strict';

/*
 * The price box is the number the customer reads. It must never display a figure the
 * business never quoted — and "$-31" is such a figure.
 *
 * animateNumber() counts the price up over 600ms inside requestAnimationFrame. rAF hands
 * the callback the FRAME's start timestamp, which can precede the performance.now() taken
 * when the animation was scheduled (the rendering update starts, a task inside it runs the
 * change handler, and the callback is serviced by that same frame). With only the upper
 * bound clamped, `progress` went negative, the cubic ease went negative, and the box
 * rendered a price outside the animation's own endpoints for the first frame or two:
 * BELOW the start when counting up, ABOVE it when counting down.
 *
 * Observed live on b50ee4e6, visible tab, real Chrome at 6x CPU throttle:
 *   /services/general-repairs/apartment-turnover/ 1br/md
 *   "$-31 – $0" -> "$-31 – $-55" -> "$108 – $-55" -> ... -> "$850 – $1500"
 * Measured first-frame deltas on that page: -3.9, -7.2, -10.9 and -15.5 ms. (-7.2 ms is
 * the frame that produced the pair above: -31/850 and -55/1500 are the same cubic ease,
 * -0.0365, to within 0.0002.)
 *
 * This test executes the REAL animateNumber lifted out of the shipped source and drives it
 * with those measured negative first-frame timestamps. It asserts the SHAPE of the correct
 * behaviour, not merely "not negative": on a frame that predates the animation the box must
 * still be showing the value it started from. `Math.abs(now - startTime)` would also never
 * print a negative number, and it would be wrong — it runs the easing backwards.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const calcSource = fs.readFileSync(
    path.join(__dirname, '..', 'components', 'modules', 'calculator.js'), 'utf8');

const ANIMATE_NUMBER_RE = /\n {4}function animateNumber\(el, target\) \{[\s\S]*?\n {4}\}\n/;

/** Lift the shipped animateNumber() out of the module and make it callable in isolation. */
function loadAnimateNumber(rafTimestamps, initialText = '$0') {
    // The extractor takes the FIRST textual match, so it is only honest while there is
    // exactly one definition to find. A stale copy left in a comment above the real one
    // would otherwise be the thing under test.
    const definitions = calcSource.match(/function animateNumber\s*\(/g) || [];
    assert.equal(definitions.length, 1,
        `expected exactly one animateNumber() in components/modules/calculator.js, found ${definitions.length}`);
    const match = calcSource.match(ANIMATE_NUMBER_RE);
    assert.ok(match, 'animateNumber() not found in components/modules/calculator.js');

    const writes = [];
    const el = {
        _text: initialText,
        get textContent() { return this._text; },
        set textContent(v) { this._text = v; writes.push(v); },
    };
    const queue = rafTimestamps.slice();
    const sandbox = {
        performance: { now: () => 1000 },      // fixed schedule time
        requestAnimationFrame(cb) {
            if (!queue.length) return 0;
            const ts = queue.shift();
            cb(ts);                             // synchronous, deterministic
            return 0;
        },
    };
    vm.createContext(sandbox);
    vm.runInContext(`${match[0]}\nglobalThis.__animate = animateNumber;`, sandbox);
    return { run: (target) => sandbox.__animate(el, target), writes };
}

const dollars = (s) => Number(String(s).replace(/[^0-9.-]/g, ''));
// Every measured negative first-frame delta, plus the two boundary cases.
const NEGATIVE_FIRST_FRAMES = [-15.5, -10.9, -7.2, -3.9, -0.1];

test('counting UP: a frame that predates the animation still shows the starting price, never below it', () => {
    for (const offset of NEGATIVE_FIRST_FRAMES) {
        const { run, writes } = loadAnimateNumber(
            [1000 + offset, 1020, 1100, 1300, 1600, 1601], '$0');
        run(850);
        // The exact first write is the point. "not negative" alone would also be satisfied
        // by Math.abs(), which silently plays the easing curve backwards from frame one.
        assert.equal(writes[0], '$0',
            `offset ${offset}ms: first frame rendered ${writes[0]}, expected the start value $0`);
        for (const w of writes) {
            assert.ok(dollars(w) >= 0, `offset ${offset}ms rendered ${w}, below the $0 start`);
            assert.ok(dollars(w) <= 850, `offset ${offset}ms rendered ${w}, above the $850 target`);
        }
        assert.equal(writes.at(-1), '$850');
    }
});

test('counting DOWN: the same frame must not render a price ABOVE the one already on screen', () => {
    // Picking a cheaper option animates downward. Un-clamped, negative progress pushed the
    // figure past the price the customer was already looking at — $1606 on a $1500 -> $850
    // step — which is just as much a number nobody quoted as a negative one.
    for (const offset of NEGATIVE_FIRST_FRAMES) {
        const { run, writes } = loadAnimateNumber(
            [1000 + offset, 1020, 1100, 1300, 1600, 1601], '$1500');
        run(850);
        assert.equal(writes[0], '$1500',
            `offset ${offset}ms: first frame rendered ${writes[0]}, expected the start value $1500`);
        for (const w of writes) {
            assert.ok(dollars(w) <= 1500, `offset ${offset}ms rendered ${w}, above the $1500 start`);
            assert.ok(dollars(w) >= 850, `offset ${offset}ms rendered ${w}, below the $850 target`);
        }
        assert.equal(writes.at(-1), '$850');
    }
});

test('animateNumber still reaches the exact target, and never overshoots it', () => {
    for (const target of [150, 850, 1500, 12500]) {
        const { run, writes } = loadAnimateNumber([990, 1020, 1150, 1400, 1601]);
        run(target);
        assert.equal(writes.at(-1), `$${target}`, `did not settle on $${target}`);
        for (const w of writes) {
            assert.ok(dollars(w) >= 0, `rendered ${w} for target $${target}`);
            assert.ok(dollars(w) <= target, `overshot to ${w} for target $${target}`);
        }
    }
});

test('a non-negative frame is untouched: the clamp changes nothing once the animation has started', () => {
    // Guards the other direction — a clamp that also swallowed real elapsed time would
    // freeze the count-up, and every assertion above would still pass.
    const { run, writes } = loadAnimateNumber([1000, 1150, 1300, 1450, 1601], '$0');
    run(1000);
    const values = writes.map(dollars);
    assert.equal(values[0], 0, 'progress 0 must render the start value');
    for (let i = 1; i < values.length; i++) {
        assert.ok(values[i] > values[i - 1],
            `the animation stalled: ${writes[i - 1]} -> ${writes[i]}`);
    }
    // 1 - (1 - 150/600)^3 = 0.578125 of the way after the first 150ms.
    assert.equal(values[1], Math.round(1000 * (1 - Math.pow(1 - 150 / 600, 3))),
        'the cubic easing curve changed');
    assert.equal(writes.at(-1), '$1000');
});
