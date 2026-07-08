'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const chatSource = fs.readFileSync(path.join(__dirname, '..', 'chat.js'), 'utf8');

test('chat visit ping is never sent without a thread id', () => {
  assert.match(chatSource, /async function notifyWidgetVisit\(threadId, options = \{\}\)/);
  assert.match(chatSource, /if \(!threadId\) return false;/);
});

test('invalid stored thread visit responses clear the stale thread before reuse', () => {
  assert.match(chatSource, /\[400, 404, 410\]\.includes\(response\.status\)/);
  assert.match(chatSource, /removeStoredThreadId\(\);/);
  assert.match(chatSource, /if \(state\.threadId === threadId\) state\.threadId = null;/);
});
