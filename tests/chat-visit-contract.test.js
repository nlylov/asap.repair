'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const chatSource = fs.readFileSync(path.join(__dirname, '..', 'chat.js'), 'utf8');

function loadChatHarness(fetchImpl) {
  const storage = new Map();
  const localStorage = {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
  };
  const window = {
    location: {
      href: 'https://asap.repair/',
      search: '',
      pathname: '/',
      origin: 'https://asap.repair',
    },
    repairAsapGetSessionContext: () => ({ visitorId: 'v_test' }),
    repairAsapPrimeGaClientId() {},
  };
  window.window = window;
  const document = {
    readyState: 'loading',
    addEventListener() {},
  };
  const marker = "  if (typeof window.repairAsapGetSessionContext !== 'function') captureAttribution();";
  const instrumented = chatSource.replace(
    marker,
    "  window.__repairAsapChatTestHooks = { ensureThread, notifyWidgetVisit, state };\n" + marker,
  );
  assert.notEqual(instrumented, chatSource, 'chat test hook marker must remain current');

  const context = {
    window,
    document,
    navigator: { language: 'en-US' },
    localStorage,
    URL,
    URLSearchParams,
    Intl,
    Date,
    Math,
    fetch: fetchImpl,
    setTimeout,
    clearTimeout,
    console,
  };
  vm.createContext(context);
  vm.runInContext(instrumented, context, { filename: 'chat.js' });
  return { hooks: window.__repairAsapChatTestHooks, storage };
}

test('chat visit ping is never sent without a thread id', () => {
  assert.match(chatSource, /async function notifyWidgetVisit\(threadId, options = \{\}\)/);
  assert.match(chatSource, /if \(!threadId\) return false;/);
});

test('invalid stored thread visit responses clear the stale thread before reuse', () => {
  assert.match(chatSource, /\[400, 404, 410\]\.includes\(response\.status\)/);
  assert.match(chatSource, /removeStoredThreadId\(\);/);
  assert.match(chatSource, /if \(state\.threadId === threadId\) state\.threadId = null;/);
});

test('chat coalesces concurrent thread creation and reuses a valid stored thread', () => {
  assert.match(chatSource, /if \(state\.threadPromise\) return state\.threadPromise;/);
  assert.match(chatSource, /state\.threadPromise = \(async \(\) => \{/);
  assert.match(chatSource, /if \(visitOk && state\.threadId\) return state\.threadId;/);
  assert.match(chatSource, /state\.threadId = storedThreadId;/);
  assert.match(chatSource, /finally \{\s*state\.threadPromise = null;\s*\}/);
});

test('concurrent chat actions create one thread and a valid thread is reused', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(String(url));
    if (String(url).includes('/api/widget/thread')) {
      return { ok: true, status: 200, json: async () => ({ threadId: 'new-thread' }) };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  };
  const { hooks } = loadChatHarness(fetchImpl);

  const [first, second] = await Promise.all([hooks.ensureThread(), hooks.ensureThread()]);
  assert.equal(first, 'new-thread');
  assert.equal(second, 'new-thread');
  assert.equal(calls.filter(url => url.includes('/api/widget/thread')).length, 1);

  calls.length = 0;
  const reused = await hooks.ensureThread();
  assert.equal(reused, 'new-thread');
  assert.equal(calls.filter(url => url.includes('/api/widget/thread')).length, 0);
  assert.equal(calls.filter(url => url.includes('/api/widget/visit')).length, 0, 'the validated thread needs no duplicate visit ping');
});

test('chat thread and visit requests never await GA client id retrieval', () => {
  assert.doesNotMatch(chatSource, /await getSessionContextAsync\(\)/);
  assert.match(chatSource, /const sessionContext = getSessionContext\(\);\s*primeGaClientIdInBackground\(\);/);
  assert.match(chatSource, /function primeGaClientIdInBackground\(\)/);
});

test('standalone chat attribution prunes unknown storage and normalizes first and latest tracking values', () => {
  assert.match(chatSource, /const ATTRIBUTION_STORAGE_KEYS = new Set\(/);
  assert.match(chatSource, /function normalizeStoredAttribution\(record\)/);
  assert.match(chatSource, /if \(!ATTRIBUTION_STORAGE_KEYS\.has\(name\)\) delete stored\[name\]/);
  assert.match(chatSource, /delete stored\.landingPath;\s*delete stored\.latestPath;/);
  assert.match(chatSource, /\[name, `latest_\$\{name\}`\]\.forEach/);
  assert.match(chatSource, /normalizeStoredAttribution\(getStoredJson\(config\.attributionStorageKey\)\)/);
});
