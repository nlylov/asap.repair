#!/usr/bin/env node
/*
 * Keep <lastmod> honest.
 *
 * Why: 85 sitemap entries still claimed "2026-03" after the pages were
 * substantially rewritten. A stale lastmod is a direct instruction to a
 * crawler that there is nothing new to fetch, so improved pages keep being
 * ranked on their old content.
 *
 * The date comes from git, not from the clock: the last commit that touched
 * the file, or today when the file has uncommitted edits (i.e. it is about to
 * be committed). That means lastmod can never drift ahead of reality — running
 * this on an unchanged tree changes nothing.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SITEMAP = join(ROOT, 'sitemap.xml');
const SITE = 'https://asap.repair';

const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
const today = new Date().toISOString().slice(0, 10);

const dirty = new Set(
  git(['status', '--porcelain'])
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3).trim()),
);

function fileFor(loc) {
  const path = loc.replace(SITE, '').replace(/^\//, '');
  for (const candidate of [path, join(path, 'index.html'), `${path.replace(/\/$/, '')}/index.html`]) {
    if (candidate && existsSync(join(ROOT, candidate))) return candidate;
  }
  return null;
}

let xml = readFileSync(SITEMAP, 'utf8');
let bumped = 0;
let missing = 0;

xml = xml.replace(
  /<loc>([^<]+)<\/loc>(\s*)<lastmod>([^<]+)<\/lastmod>/g,
  (whole, loc, gap, current) => {
    const rel = fileFor(loc);
    if (!rel) {
      missing += 1;
      return whole;
    }
    let next;
    if (dirty.has(rel)) next = today;
    else {
      next = git(['log', '-1', '--format=%cs', '--', rel]) || current;
    }
    if (next === current) return whole;
    bumped += 1;
    return `<loc>${loc}</loc>${gap}<lastmod>${next}</lastmod>`;
  },
);

writeFileSync(SITEMAP, xml);
console.log(
  `sitemap lastmod: ${bumped} entr${bumped === 1 ? 'y' : 'ies'} refreshed from git history` +
    (missing ? `, ${missing} URL(s) had no local file` : ''),
);

/* The AI-facing guides carry their own "Last updated" line, and it had drifted
   ten days behind the content. Same rule as above: git decides the date, so the
   stamp can only move when the file it describes actually moved. */
let stamped = 0;
for (const name of ['llms.txt', 'llms-full.txt']) {
  const path = join(ROOT, name);
  const text = readFileSync(path, 'utf8');
  const date = dirty.has(name) ? today : git(['log', '-1', '--format=%cs', '--', name]);
  if (!date) continue;
  const next = text.replace(
    /(##\s*(?:\d+\.\s*)?Last updated\s*\n\s*\n)\d{4}-\d{2}-\d{2}/,
    `$1${date}`,
  );
  if (next !== text) {
    writeFileSync(path, next);
    stamped += 1;
  }
}

/* facts.json says "lastReviewed", which is a claim that someone checked the
   facts — not that some page changed. So it only moves when facts.json itself
   was edited. Stamping it on every content change would be a lie. */
const factsPath = join(ROOT, 'facts.json');
const facts = JSON.parse(readFileSync(factsPath, 'utf8'));
const factsDate = dirty.has('facts.json') ? today : git(['log', '-1', '--format=%cs', '--', 'facts.json']);
if (factsDate && facts.lastReviewed !== factsDate) {
  facts.lastReviewed = factsDate;
  writeFileSync(factsPath, `${JSON.stringify(facts, null, 2)}\n`);
  stamped += 1;
}

if (stamped) console.log(`freshness stamps: ${stamped} AI-facing file(s) re-dated from git history.`);
