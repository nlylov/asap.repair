#!/usr/bin/env node
/*
 * Put a reason to click in the search snippet.
 *
 * Why: 86 service descriptions read like a scope-of-work memo — "…with box,
 * support, dimmer, ceiling height and scope review." Accurate, and it gives a
 * searcher nothing. Only 17 mentioned a price or the free estimate, and only 16
 * contained a verb the reader could act on. Sitewide CTR is 0.6%.
 *
 * What it does: keeps the existing keyword-bearing first clause (that part is
 * doing SEO work), trims it at a clause boundary so the result fits Google's
 * snippet width, and appends the one offer that is true on every page —
 * a free photo estimate, and work priced from the $150 minimum.
 *
 * The offer wording is the same contract used on-page: photo/text estimates are
 * free, an on-site assessment is $99 and is credited toward the job, and actual
 * work starts at $150. Nothing here promises same-day, 24/7 or licensed trades.
 *
 * Idempotent: a description that already carries the offer is left alone.
 * Pass --dry to preview without writing.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DRY = process.argv.includes('--dry');

const OFFER = 'Free photo estimate, work from $150.';
const MAX = 158; // Google truncates around 160 characters on desktop.

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
const encode = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const hasOffer = (d) => /\$1?50|free photo|free estimate/i.test(d);

/* Trim to a clause boundary, never mid-word, so the sentence still reads. */
function fit(base, budget) {
  if (base.length <= budget) return base;
  const cut = base.slice(0, budget + 1);
  for (const sep of [' with ', ' and ', ', ', ' — ', ' ']) {
    const at = cut.lastIndexOf(sep);
    if (at > budget * 0.55) return base.slice(0, at).replace(/[,\s—-]+$/, '');
  }
  return cut.slice(0, budget).replace(/\s+\S*$/, '');
}

/* Every page a searcher can land on with buying intent: service leaves, the
   category hubs above them, and the borough / audience landers. Not the legal
   pages, blog posts or case studies — those are read, not shopped. */
const PATTERNS = [
  'services/*/*/index.html',
  'services/*/index.html',
  'services/index.html',
  'handyman-*/index.html',
  'same-day-handyman-nyc/index.html',
  'for-restaurants/index.html',
  'for-property-managers/index.html',
  'new-apartment-setup/index.html',
  'preventive-maintenance/index.html',
  'service-areas/index.html',
];

const files = execFileSync('git', ['ls-files', ...PATTERNS], {
  cwd: ROOT,
  encoding: 'utf8',
})
  .split('\n')
  .filter(Boolean);

let changed = 0;
let skipped = 0;
for (const rel of files) {
  const path = join(ROOT, rel);
  const html = readFileSync(path, 'utf8');
  const m = html.match(/<meta\s+name="description"\s+content="([^"]*)"/);
  if (!m) continue;

  const current = decode(m[1]).replace(/\s+/g, ' ').trim();
  if (hasOffer(current)) {
    skipped += 1;
    continue;
  }

  const base = fit(current.replace(/\.$/, ''), MAX - OFFER.length - 2);
  const next = `${base}. ${OFFER}`;
  if (next === current) {
    skipped += 1;
    continue;
  }

  if (DRY) {
    console.log(`[${next.length}] ${rel}\n   ${next}`);
  } else {
    /* Replace via a function, never a replacement string: the new copy contains
       "$150", and in a replacement string "$1" means capture group 1. That footgun
       silently rewrote descriptions to the matched <meta> tag itself. */
    const replacement = encode(next);
    const out = html.replace(
      /(<meta\s+(?:name|property)="(?:description|og:description|twitter:description)"\s+content=")([^"]*)(")/gs,
      (whole, open, value, close) =>
        decode(value).replace(/\s+/g, ' ').trim() === current
          ? open + replacement + close
          : whole,
    );
    writeFileSync(path, out);
  }
  changed += 1;
}

console.log(
  `Meta descriptions: ${changed} rewritten with the offer, ${skipped} already had it${DRY ? ' (dry run — nothing written)' : ''}.`,
);
