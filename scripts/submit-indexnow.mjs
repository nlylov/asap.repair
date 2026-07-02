#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const INDEXNOW_KEY = 'e5308b759e880acb8173dd3d6d755ddc';
const HOST = 'asap.repair';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const SITEMAP_PATH = resolve('sitemap.xml');

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');

const sitemap = await readFile(SITEMAP_PATH, 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1].trim())
  .filter((url) => url.startsWith(`https://${HOST}/`));

if (urls.length === 0) {
  throw new Error(`No canonical https://${HOST}/ URLs found in ${SITEMAP_PATH}`);
}

const payload = {
  host: HOST,
  key: INDEXNOW_KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls,
};

if (dryRun) {
  console.log(JSON.stringify({
    endpoint: ENDPOINT,
    host: payload.host,
    keyLocation: payload.keyLocation,
    urlCount: urls.length,
    firstUrls: urls.slice(0, 10),
  }, null, 2));
  process.exit(0);
}

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  body: JSON.stringify(payload),
});

const responseText = await response.text();
console.log(JSON.stringify({
  endpoint: ENDPOINT,
  status: response.status,
  statusText: response.statusText,
  urlCount: urls.length,
  responseText,
}, null, 2));

if (![200, 202].includes(response.status)) {
  process.exitCode = 1;
}
