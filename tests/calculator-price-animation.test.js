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
 * rendered a negative price for the first frame or two.
 *
 * Observed live on b50ee4e6, visible tab, real Chrome at 6x CPU throttle:
 *   /services/general-repairs/apartment-turnover/ 1br/md
 *   "$-31 – $0" -> "$-31 – $-55" -> "$108 – $-55" -> ... -> "$850 – $1500"
 *
 * This test executes the REAL animateNumber lifted out of the shipped source and drives it
 * with the negative first-frame timestamps that were actually measured.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const calcSource = fs.readFileSync(
    path.join(__dirname, '..', 'components', 'modules', 'calculator.js'), 'utf8');

/** Lift the shipped animateNumber() out of the module and make it callable in isolation. */
function loadAnimateNumber(rafTimestamps) {
    const match = calcSource.match(/\n {4}function animateNumber\(el, target\) \{[\s\S]*?\n {4}\}\n/);
    assert.ok(match, 'animateNumber() not found in components/modules/calculator.js');

    const writes = [];
    const el = {
        _text: '$0',
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

test('animateNumber never renders a negative price when rAF reports a frame that started before the animation', () => {
    // -31, -15.5, -10.9 ms are timestamps measured on the live page at 6x / 20x CPU throttle.
    for (const firstFrameOffset of [-31, -15.5, -10.9, -3.9, -0.1]) {
        const { run, writes } = loadAnimateNumber([
            1000 + firstFrameOffset, 1020, 1100, 1300, 1600, 1601,
        ]);
        run(850);
        const negative = writes.filter((w) => dollars(w) < 0);
        assert.deepEqual(negative, [],
            `offset ${firstFrameOffset}ms rendered negative price(s): ${negative.join(', ')}`);
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

test('the clamp is present in the shipped source, not only in this test', () => {
    assert.match(calcSource, /const elapsed = Math\.max\(0, now - startTime\);/,
        'animateNumber() must clamp elapsed at 0 — see the live measurement in this file');
});
