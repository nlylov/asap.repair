'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const mainSource = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
const modalSource = fs.readFileSync(path.join(root, 'components', 'quote-modal.js'), 'utf8');
const photoDropSource = fs.readFileSync(path.join(root, 'components', 'modules', 'photo-drop.js'), 'utf8');

function loadMain({ href, referrer = '', storage = new Map(), gtag } = {}) {
  const url = new URL(href || 'https://asap.repair/');
  const localStorage = {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
  };
  const emptyClassList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
  const window = {
    location: {
      href: url.href,
      search: url.search,
      pathname: url.pathname,
      origin: url.origin,
      hostname: url.hostname,
      protocol: url.protocol,
    },
    crypto: { randomUUID: () => 'test-visitor-uuid' },
    addEventListener() {},
    setTimeout() { return 1; },
    matchMedia() { return { matches: false, addEventListener() {} }; },
    innerHeight: 900,
    scrollY: 0,
    scrollTo() {},
  };
  window.window = window;

  const document = {
    readyState: 'loading',
    referrer,
    cookie: '',
    activeElement: null,
    addEventListener() {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    getElementById() { return null; },
    createElement() {
      return {
        addEventListener() {},
        appendChild() {},
        classList: emptyClassList,
        style: {},
      };
    },
    body: { appendChild() {}, style: {} },
    head: { appendChild() {} },
  };

  const context = {
    window,
    document,
    navigator: { language: 'en-US', sendBeacon: null },
    localStorage,
    sessionStorage: { setItem() {} },
    URL,
    URLSearchParams,
    Intl,
    Date,
    Math,
    Blob: class Blob {},
    fetch: async () => ({ ok: true, json: async () => ({}) }),
    MutationObserver: class MutationObserver { observe() {} },
    requestAnimationFrame() {},
    setTimeout() { return 1; },
    clearTimeout() {},
    console,
  };
  if (gtag) {
    context.gtag = gtag;
    window.gtag = gtag;
  }

  vm.createContext(context);
  vm.runInContext(mainSource, context, { filename: 'main.js' });
  return { window, storage };
}

function storedAttribution(storage) {
  return JSON.parse(storage.get('repair_asap_attribution'));
}

test('first touch is captured on landing load, sanitized, and immutable across navigation', () => {
  const storage = new Map();
  const first = loadMain({
    href: 'https://asap.repair/?utm_source=google&utm_medium=cpc&gclid=first-click&email=private@example.com#quote',
    referrer: 'https://www.google.com/search?q=private-search',
    storage,
  });

  const landing = storedAttribution(storage);
  assert.equal(landing.version, 2);
  assert.equal(landing.landingPage, 'https://asap.repair/?utm_source=google&utm_medium=cpc&gclid=first-click');
  assert.equal(landing.landingPath, '/');
  assert.equal(landing.firstReferrer, 'https://www.google.com/search');
  assert.equal(landing.utm_source, 'google');
  assert.equal(landing.utm_medium, 'cpc');
  assert.equal(landing.gclid, 'first-click');
  assert.equal(landing.latest_utm_source, 'google');
  assert.ok(landing.firstTouchAt);
  assert.equal(landing.firstTouchAt, landing.latestTouchAt);
  assert.doesNotMatch(JSON.stringify(landing), /private@example|private-search|#quote/);

  loadMain({
    href: 'https://asap.repair/services/appliance-services/dishwasher-installation/?phone=2125550100#contact',
    referrer: 'https://asap.repair/?utm_source=google&utm_medium=cpc&gclid=first-click',
    storage,
  });
  const afterNavigation = storedAttribution(storage);
  assert.equal(afterNavigation.landingPage, landing.landingPage);
  assert.equal(afterNavigation.firstReferrer, landing.firstReferrer);
  assert.equal(afterNavigation.firstTouchAt, landing.firstTouchAt);
  assert.equal(afterNavigation.utm_source, 'google');
  assert.equal(afterNavigation.gclid, 'first-click');
  assert.equal(afterNavigation.latestPage, landing.latestPage, 'internal navigation is not a new acquisition touch');

  const context = first.window.repairAsapGetSessionContext();
  assert.equal(context.landingPage, landing.landingPage);
  assert.equal(context.latestPage, landing.latestPage);
  assert.equal(context.visitorId, 'v_test-visitor-uuid');
});

test('a later campaign updates latest touch without changing first touch', () => {
  const storage = new Map();
  loadMain({
    href: 'https://asap.repair/?utm_source=google&gclid=first-click',
    referrer: 'https://google.com/',
    storage,
  });
  const first = storedAttribution(storage);

  loadMain({
    href: 'https://asap.repair/services/appliance-services/washer-installation/?utm_source=bing&utm_campaign=summer&msclkid=latest-click&customer=private',
    referrer: 'https://www.bing.com/search?q=washer',
    storage,
  });
  const latest = storedAttribution(storage);

  assert.equal(latest.landingPage, first.landingPage);
  assert.equal(latest.firstReferrer, first.firstReferrer);
  assert.equal(latest.firstTouchAt, first.firstTouchAt);
  assert.equal(latest.utm_source, 'google');
  assert.equal(latest.gclid, 'first-click');
  assert.equal(latest.latestPage, 'https://asap.repair/services/appliance-services/washer-installation/?utm_source=bing&utm_campaign=summer&msclkid=latest-click');
  assert.equal(latest.latestPath, '/services/appliance-services/washer-installation/');
  assert.equal(latest.latestReferrer, 'https://www.bing.com/search');
  assert.equal(latest.latest_utm_source, 'bing');
  assert.equal(latest.latest_utm_campaign, 'summer');
  assert.equal(latest.latest_msclkid, 'latest-click');
  assert.ok(latest.latestTouchAt);
  assert.doesNotMatch(JSON.stringify(latest), /customer=private|q=washer/);
});

test('a direct first visit stays direct after same-origin navigation', () => {
  const storage = new Map();
  loadMain({ href: 'https://asap.repair/', referrer: '', storage });
  const first = storedAttribution(storage);
  assert.ok(Object.hasOwn(first, 'firstReferrer'));
  assert.equal(first.firstReferrer, '');
  assert.equal(first.landingPage, 'https://asap.repair/');
  assert.equal(first.utm_source, undefined);

  loadMain({
    href: 'https://asap.repair/services/appliance-services/refrigerator-installation/',
    referrer: 'https://asap.repair/',
    storage,
  });
  const second = storedAttribution(storage);
  assert.equal(second.firstReferrer, '');
  assert.equal(second.firstTouchAt, first.firstTouchAt);
  assert.equal(second.latestReferrer, '');
});

test('legacy attribution storage is reduced to sanitized allowlisted fields', () => {
  const storage = new Map();
  storage.set('repair_asap_attribution', JSON.stringify({
    landingPage: 'https://asap.repair/?utm_source=google&email=private@example.com#quote',
    firstReferrer: 'https://www.google.com/search?q=private',
    firstTouchAt: '2026-07-01T00:00:00Z',
    latestPage: 'https://asap.repair/services/?phone=2125550100',
    latestReferrer: 'https://www.bing.com/search?q=private',
    latestTouchAt: '2026-07-02T00:00:00Z',
    utm_source: ' google ',
    latest_utm_source: 'z'.repeat(200),
    latest_fbclid: { unsafe: true },
    customerEmail: 'private@example.com',
  }));

  const { window } = loadMain({
    href: 'https://asap.repair/services/appliance-services/',
    referrer: 'https://asap.repair/',
    storage,
  });
  const normalized = storedAttribution(storage);

  assert.equal(normalized.landingPage, 'https://asap.repair/?utm_source=google');
  assert.equal(normalized.firstReferrer, 'https://www.google.com/search');
  assert.equal(normalized.latestPage, 'https://asap.repair/services/');
  assert.equal(normalized.latestReferrer, 'https://www.bing.com/search');
  assert.equal(normalized.firstTouchAt, '2026-07-01T00:00:00.000Z');
  assert.equal(normalized.latestTouchAt, '2026-07-02T00:00:00.000Z');
  assert.equal(normalized.utm_source, 'google');
  assert.equal(normalized.latest_utm_source.length, 120);
  assert.equal(normalized.latest_fbclid, undefined);
  assert.equal(normalized.customerEmail, undefined);
  assert.doesNotMatch(JSON.stringify(normalized), /private@example|q=private|phone=/);
  assert.equal(window.repairAsapGetSessionContext().customerEmail, undefined);
});

test('orphan legacy paths are discarded and incomplete snapshots are recaptured atomically', () => {
  const storage = new Map();
  storage.set('repair_asap_attribution', JSON.stringify({
    firstTouchAt: '2026-07-01T00:00:00Z',
    landingPath: '/customer/private@example.com',
    latestTouchAt: '2026-07-02T00:00:00Z',
    latestPath: '/phone/2125550100',
  }));

  const { window } = loadMain({
    href: 'https://asap.repair/services/',
    referrer: 'https://asap.repair/',
    storage,
  });
  const normalized = storedAttribution(storage);
  const context = window.repairAsapGetSessionContext();

  assert.equal(normalized.landingPage, 'https://asap.repair/services/');
  assert.equal(normalized.landingPath, '/services/');
  assert.equal(normalized.latestPage, 'https://asap.repair/services/');
  assert.equal(normalized.latestPath, '/services/');
  assert.ok(normalized.firstTouchAt);
  assert.ok(normalized.latestTouchAt);
  assert.equal(context.landingPath, '/services/');
  assert.equal(context.latestPath, '/services/');
  assert.doesNotMatch(JSON.stringify({ normalized, context }), /private@example|2125550100/);
});

test('malformed legacy first and latest snapshots are replaced by one complete current touch', () => {
  const storage = new Map();
  storage.set('repair_asap_attribution', JSON.stringify({
    landingPage: 'https://asap.repair/old/?utm_source=old',
    landingPath: '/old/',
    firstReferrer: 'https://old.example/path?private=yes',
    firstTouchAt: 'invalid',
    utm_source: 'old',
    latestPage: 'https://asap.repair/old-latest/?utm_source=old-latest',
    latestPath: '/old-latest/',
    latestTouchAt: 'invalid',
    latest_utm_source: 'old-latest',
  }));

  loadMain({
    href: 'https://asap.repair/current/?utm_source=new&gclid=new-click',
    referrer: 'https://search.example/results?q=private',
    storage,
  });
  const normalized = storedAttribution(storage);

  assert.equal(normalized.landingPage, 'https://asap.repair/current/?utm_source=new&gclid=new-click');
  assert.equal(normalized.landingPath, '/current/');
  assert.equal(normalized.firstReferrer, 'https://search.example/results');
  assert.ok(normalized.firstTouchAt);
  assert.equal(normalized.utm_source, 'new');
  assert.equal(normalized.gclid, 'new-click');
  assert.equal(normalized.latestPage, normalized.landingPage);
  assert.equal(normalized.latestPath, normalized.landingPath);
  assert.equal(normalized.latestTouchAt, normalized.firstTouchAt);
  assert.equal(normalized.latest_utm_source, 'new');
  assert.equal(normalized.latest_gclid, 'new-click');
  assert.doesNotMatch(JSON.stringify(normalized), /old-latest|utm_source=old(?:&|"|$)|q=private/);
});

test('slow or unavailable GA never delays session context or customer quote paths', async () => {
  const neverReturns = () => {};
  const { window } = loadMain({ href: 'https://asap.repair/', gtag: neverReturns });
  const result = await Promise.race([
    window.repairAsapGetSessionContextAsync(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('session context waited for GA')), 50)),
  ]);
  assert.equal(result.visitorId, 'v_test-visitor-uuid');
  assert.equal(result.gaClientId, undefined);

  assert.doesNotMatch(mainSource, /await window\.repairAsapGetSessionContextAsync/);
  assert.doesNotMatch(modalSource, /repairAsapGetSessionContextAsync/);
  assert.doesNotMatch(photoDropSource, /repairAsapGetSessionContextAsync/);
  assert.match(mainSource, /const sessionContext = window\.repairAsapGetSessionContext\?\.\(\) \|\| null/);
});
