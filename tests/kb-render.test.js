'use strict';
// Pure-renderer tests for bazas-kb.js — run with: node --test tests/
// No framework needed; the widget exports its pure functions via module.exports.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const kb = require('../bazas-kb.js');

// A trimmed fixture in the SHAPE the live endpoint returns
// (GET /api/knowledge-base?org=repair-asap).
const FIXTURE = {
  companyInfo: { name: 'Repair ASAP', phone: '+1 (775) 310-7770' },
  services: [
    { category: 'Furniture Assembly', name: 'Furniture Assembly (single item)', priceRange: '$100-$250' },
    { category: 'Furniture Assembly', name: 'IKEA wardrobe assembly', priceRange: '$150-$400' },
    { category: 'TV Mounting', name: 'TV mount (up to 55")', priceRange: '$120-$200' }
  ],
  faqs: [
    { question: 'What areas do you serve?', answer: 'Manhattan, Brooklyn, Queens, Staten Island, and Nassau County.' }
  ],
  policies: {
    minimumVisit: '$150',
    assessmentFee: '$99 (credited toward job)',
    warranty: '1-year labor warranty, 60-day parts warranty',
    payment: 'Cash, Zelle, Venmo, Card. Due upon completion.'
  }
};

test('renderPricing surfaces the LIVE policy fee (no hardcoded price in source)', () => {
  const html = kb.renderPricing(FIXTURE);
  assert.match(html, /Minimum visit/);
  assert.match(html, /\$150/);                // comes from FIXTURE.policies, not the file
  assert.match(html, /1-year labor warranty/);
  // change the truth → output changes (proves it is data-driven, not hardcoded)
  const cheaper = kb.renderPricing({ policies: { minimumVisit: '$1' } });
  assert.match(cheaper, /\$1/);
  assert.doesNotMatch(cheaper, /\$150/);
});

test('renderPricing surfaces salesTax as a note, never as a row', () => {
  const html = kb.renderPricing({ policies: { minimumVisit: '$150', salesTax: 'NYC sales tax 8.875% is separate.' } });
  assert.match(html, /bk-pricing-note/);
  assert.match(html, /8\.875%/);
  // a policies object with ONLY salesTax still renders the note (no rows, no crash)
  const onlyTax = kb.renderPricing({ policies: { salesTax: 'Tax 8.875%.' } });
  assert.match(onlyTax, /bk-pricing-note/);
  assert.doesNotMatch(onlyTax, /bk-pricing-row/);
});

test('bazas-kb.js executable code contains NO hardcoded tenant prices', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'bazas-kb.js'), 'utf8');
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, '')         // strip block comments
    .replace(/(^|\s)\/\/.*$/gm, '$1');        // strip line comments
  assert.doesNotMatch(code, /\$\d/);          // every price must arrive from the KB at runtime
});

test('renderServices groups by category, preserving first-seen order', () => {
  const html = kb.renderServices(FIXTURE);
  assert.match(html, /Furniture Assembly/);
  assert.match(html, /TV Mounting/);
  assert.ok(html.indexOf('Furniture Assembly') < html.indexOf('TV Mounting'), 'category order preserved');
  assert.match(html, /\$100-\$250/);
  // two Furniture Assembly items, one TV → 3 <li>
  assert.equal((html.match(/bk-service-name/g) || []).length, 3);
});

test('renderFaq renders question + answer as <details>', () => {
  const html = kb.renderFaq(FIXTURE);
  assert.match(html, /What areas do you serve\?/);
  assert.match(html, /Nassau County/);
  assert.match(html, /<details/);
});

test('esc() neutralizes HTML (XSS safety for KB-sourced strings)', () => {
  assert.equal(kb.esc('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.equal(kb.esc('a & b "c" \'d\''), 'a &amp; b &quot;c&quot; &#39;d&#39;');
  // a malicious service name cannot inject markup
  const html = kb.renderServices({ services: [{ category: '<b>x</b>', name: '<img src=x onerror=1>', priceRange: '$5' }] });
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img src=x/);
});

test('empty / missing KB sections render nothing (static fallback stays)', () => {
  assert.equal(kb.renderServices({}), '');
  assert.equal(kb.renderPricing({}), '');
  assert.equal(kb.renderFaq({}), '');
  assert.equal(kb.renderServices({ services: [] }), '');
});

test('renderers NEVER throw on a garbage / malicious payload (fail-safe → empty, not crash)', () => {
  const junk = [
    null, undefined, 42, 'str', [], {},
    { services: 'not-an-array', faqs: 7, policies: 'nope' },
    { services: [null, 5, 'x'], faqs: [null, 'x'], policies: [] },
    { services: [{ category: '__proto__', name: 'x', priceRange: '$1' }] }, // prototype-pollution key
  ];
  for (const k of junk) {
    assert.doesNotThrow(() => kb.renderServices(k));
    assert.doesNotThrow(() => kb.renderPricing(k));
    assert.doesNotThrow(() => kb.renderFaq(k));
  }
  // a "__proto__" category is treated as a normal (escaped) group, not a crash
  const html = kb.renderServices({ services: [{ category: '__proto__', name: 'Mystery', priceRange: '$1' }] });
  assert.match(html, /Mystery/);
  assert.equal({}.__proto__, Object.prototype, 'global Object.prototype untouched');
});
