#!/usr/bin/env node
/*
 * Bake the shared header/footer into every page as static HTML.
 *
 * Why: nav was injected only client-side by components/loader.js, so
 * non-JS crawlers (GPTBot, ClaudeBot, PerplexityBot, CCBot) saw pages with
 * zero navigation links and the internal link graph existed only after JS.
 *
 * How it stays fresh: loader.js is untouched — it still fetches the live
 * components and overwrites these baked copies on load, so humans always get
 * the current nav even if a page wasn't re-baked. Crawlers get the baked one.
 *
 * Run after ANY edit to components/header.html or components/footer.html:
 *   node scripts/bake-components.mjs
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

const header = readFileSync(join(ROOT, 'components/header.html'), 'utf8').trim();
const footer = readFileSync(join(ROOT, 'components/footer.html'), 'utf8').trim();

const HEADER_BAKED = `<div id="site-header" class="loaded"><!--baked:header-->\n${header}\n<!--/baked--></div>`;
const FOOTER_BAKED = `<div id="site-footer" class="loaded"><!--baked:footer-->\n${footer}\n<!--/baked--></div>`;

// Match either the empty placeholder or a previously-baked block (idempotent re-bake).
const HEADER_RE = /<div id="site-header"(?: class="loaded")?>(?:<!--baked:header-->[\s\S]*?<!--\/baked-->)?<\/div>/;
const FOOTER_RE = /<div id="site-footer"(?: class="loaded")?>(?:<!--baked:footer-->[\s\S]*?<!--\/baked-->)?<\/div>/;

const files = execSync('git ls-files "*.html"', { cwd: ROOT, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter((f) => !f.startsWith('components/'))
  .filter((f) => !f.startsWith('assets/'));

let baked = 0;
let skipped = 0;
for (const rel of files) {
  const path = join(ROOT, rel);
  let html = readFileSync(path, 'utf8');
  const hadHeader = HEADER_RE.test(html);
  const hadFooter = FOOTER_RE.test(html);
  if (!hadHeader && !hadFooter) {
    skipped++;
    continue;
  }
  if (hadHeader) html = html.replace(HEADER_RE, HEADER_BAKED);
  if (hadFooter) html = html.replace(FOOTER_RE, FOOTER_BAKED);
  writeFileSync(path, html);
  baked++;
}
console.log(`Baked header/footer into ${baked} pages (${skipped} without placeholders).`);
