#!/usr/bin/env node
/*
 * Point every page at the self-hosted fonts instead of Google's CDN.
 *
 * Before: each page opened connections to fonts.googleapis.com AND
 * fonts.gstatic.com, fetched a stylesheet, then followed it to the woff2 —
 * two extra origins and two sequential round trips before real text could
 * paint. The async `media="print"` trick kept it off the critical path but
 * pushed the font swap late, which is what a visitor sees as text reflowing.
 *
 * After: the @font-face rules live at the top of styles.css (already
 * render-blocking and same-origin), so fonts are discovered in the first
 * stylesheet parse, and the two faces above the fold are preloaded.
 *
 * The woff2 files in assets/fonts/ were subset to latin + latin-ext — the
 * cyrillic/greek/vietnamese faces Google serves are dead weight for an
 * English-language NYC site. unicode-range still gates what a browser fetches.
 *
 * Idempotent: pages already migrated are left untouched.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

/* Above the fold on every page: the H1 (Plus Jakarta Sans 800) and body copy
   (Inter 400). Preloading more would compete with the hero image for bandwidth. */
const PRELOAD = [
  '/assets/fonts/PlusJakartaSans-800-latin.woff2',
  '/assets/fonts/Inter-400-latin.woff2',
];

const files = execFileSync('git', ['ls-files', '*.html'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter((f) => !f.startsWith('tmp/'));

let changed = 0;
for (const rel of files) {
  const path = join(ROOT, rel);
  const html = readFileSync(path, 'utf8');
  if (!html.includes('fonts.googleapis.com') && !html.includes('fonts.gstatic.com')) continue;

  let next = html
    // the whole Google font block: preconnects, preload, async stylesheet, noscript fallback
    .replace(/[ \t]*<noscript>\s*<link[^>]*fonts\.googleapis\.com[\s\S]*?<\/noscript>\n?/g, '')
    .replace(/[ \t]*<link[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>\n?/g, '');

  const indent = next.match(/([ \t]*)<link rel="stylesheet" href="\/styles\.css/)?.[1] ?? '    ';
  const preloads = PRELOAD.map(
    (href) => `${indent}<link rel="preload" as="font" type="font/woff2" href="${href}" crossorigin>`,
  ).join('\n');

  next = next.replace(
    /([ \t]*)(<link rel="stylesheet" href="\/styles\.css[^>]*>)/,
    `${preloads}\n$1$2`,
  );

  if (next !== html) {
    writeFileSync(path, next);
    changed += 1;
  }
}

console.log(`Fonts: ${changed} page(s) moved off the Google Fonts CDN to same-origin woff2.`);
