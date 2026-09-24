#!/usr/bin/env node
/*
 * Keep off-topic photos off service pages, and give pages an on-topic hero.
 *
 * _data/photo-exclusions.json:
 *   drop:   { slug: [basename, ...] }  gallery cards removed (wrong subject, duplicate, privacy)
 *   heroes: { slug: "/assets/photo/.../x.webp" }  replaces a hero that showed another trade
 *
 * Why a post-step and not an HTML edit: the appliance galleries and several heroes are written
 * by generators, which would put the photos straight back. Every generator runs this last.
 * Idempotent; gallery filter counts ("After (12)") are recomputed from what is left.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const cfg = JSON.parse(readFileSync(join(ROOT, '_data/photo-exclusions.json'), 'utf8'));
const drop = cfg.drop || {};
const heroes = cfg.heroes || {};

function webpDims(p) {
  try {
    const b = readFileSync(join(ROOT, p.replace(/^\//, '').split('?')[0]));
    const f = b.toString('ascii', 12, 16);
    if (f === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (f === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (f === 'VP8L') { const x = b.readUInt32LE(21); return [(x & 0x3fff) + 1, ((x >> 14) & 0x3fff) + 1]; }
  } catch { /* ignore */ }
  return null;
}

const files = execFileSync('git', ['ls-files', 'services/*/*/index.html'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
let cards = 0; let heroN = 0; let pages = 0;
for (const rel of files) {
  const slug = rel.split('/')[2];
  const path = join(ROOT, rel);
  const html = readFileSync(path, 'utf8');
  let out = html;
  const names = new Set(drop[slug] || []);
  if (names.size) {
    out = out.replace(/[ \t]*<div class="svc-gallery__card" data-type="[a-z]+">\s*<div class="svc-gallery__img-wrap"\s+data-full="([^"]+)"[\s\S]*?<\/div>\s*<div class="svc-gallery__caption">[\s\S]*?<\/div>\s*<\/div>\n?/g,
      (m, full) => { if (names.has(full.split('/').pop())) { cards += 1; return ''; } return m; });
    const types = [...out.matchAll(/<div class="svc-gallery__card" data-type="([a-z]+)">/g)].map((x) => x[1]);
    out = out.replace(/(<button class="svc-gallery__filter-btn[^"]*" data-filter="([a-z]+)">[^<(]*\()(\d+)(\))/g,
      (m, a, f, n, z) => `${a}${f === 'all' ? types.length : types.filter((t) => t === f).length}${z}`);
  }
  const hero = heroes[slug];
  if (hero && existsSync(join(ROOT, hero.replace(/^\//, '')))) {
    const d = webpDims(hero);
    out = out.replace(/(<img src=")[^"]+("[^>]*class="svc-hero__img"[^>]*>)/, (m, a, b) => {
      let tag = a + hero + b;
      if (d) tag = tag.replace(/width="\d+" height="\d+"/, `width="${d[0]}" height="${d[1]}"`);
      return tag;
    });
    out = out.replace(/(<link rel="preload" as="image"[^>]*href=")[^"]+(")/, (m, a, b) => a + hero + b);
    if (out !== html) heroN += 1;
  }
  if (out !== html) { writeFileSync(path, out); pages += 1; }
}
console.log(`Photo exclusions: ${cards} gallery card(s) removed, ${heroN} hero(es) replaced, ${pages} page(s) written.`);
