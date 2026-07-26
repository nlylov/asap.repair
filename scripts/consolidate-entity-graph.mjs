#!/usr/bin/env node
/*
 * Make every page talk about ONE business entity instead of 113 anonymous copies.
 *
 * Why: each service page carried its own inline `provider: {@type: LocalBusiness,
 * name: "Repair Asap LLC", ...}` with no @id, and the homepage carried a richer
 * HomeAndConstructionBusiness node — also with no @id. To a search engine those
 * are 113 unrelated business nodes that happen to share a name. Reviews, address,
 * hours and sameAs signals get split across them instead of stacking on one entity.
 *
 * What it does: stamps the same `@id` on every node that IS the business, and
 * normalises their @type so they merge cleanly. Page-scoped nodes (Service, FAQ,
 * breadcrumbs) get their own stable per-page @id and point at the canonical URL,
 * so "which page is this Service on" stops being a guess.
 *
 * Nothing is removed — every existing property survives the round-trip. Idempotent:
 * re-running writes the same bytes, so generators can call it as a post-step.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SITE = 'https://asap.repair';
const BUSINESS_ID = `${SITE}/#business`;
const BUSINESS_TYPE = 'HomeAndConstructionBusiness';
const BUSINESS_NAMES = new Set(['repair asap llc', 'repair asap']);

const BUSINESS_TYPES = new Set([
  'LocalBusiness',
  'HomeAndConstructionBusiness',
  'GeneralContractor',
  'Organization',
]);

/* @type is sometimes an array (faq/index.html ships
   ["HomeAndConstructionBusiness","LocalBusiness"]), which a plain Set lookup misses. */
const typeList = (node) => (Array.isArray(node['@type']) ? node['@type'] : [node['@type']]);

const isBusinessNode = (node) =>
  node
  && typeof node === 'object'
  && typeList(node).some((t) => BUSINESS_TYPES.has(t))
  && BUSINESS_NAMES.has(String(node.name || '').toLowerCase());

/* Sharing one @id means these nodes are ONE thing, so they may not disagree about
   what that thing is called or how to ring it. Before consolidation the pages
   carried "Repair ASAP LLC" vs "Repair Asap LLC", "+17753107770" vs the dashed
   form, and two different logos; separate anonymous nodes made that harmless.
   Under a single @id a consumer merges them and gets a business with two names. */
const CANONICAL = {
  name: 'Repair Asap LLC',
  telephone: '+1-775-310-7770',
  url: SITE,
  logo: `${SITE}/assets/images/logo-header.webp`,
};

const PAGE_SCOPED = /#(service|faq|breadcrumb)$/;

/* Order matters for humans reading the JSON: @context, @type, @id first. */
function withId(node, id, type) {
  const rest = { ...node };
  delete rest['@context'];
  delete rest['@type'];
  delete rest['@id'];
  const head = {};
  if ('@context' in node) head['@context'] = node['@context'];
  head['@type'] = type || node['@type'];
  head['@id'] = id;
  return { ...head, ...rest };
}

/* `top` is true only for the node a <script> block starts with. A page-scoped @id
   like `<url>#service` describes THE service this page is about — handing the same
   one to every entry nested in hasOfferCatalog/itemListElement declared 18 distinct
   sub-services on the appliance hub to be a single entity, and pointed each of them
   at the hub instead of at its own page. Nested nodes stay anonymous. */
function walk(node, canonical, top = false) {
  if (Array.isArray(node)) return node.map((n) => walk(n, canonical, top));
  if (!node || typeof node !== 'object') return node;

  let out = node;
  if (isBusinessNode(out)) {
    out = withId({ ...out, ...CANONICAL }, BUSINESS_ID, BUSINESS_TYPE);
  } else if (top && canonical && !out['@id']) {
    if (out['@type'] === 'Service') {
      out = withId(out, `${canonical}#service`, 'Service');
      if (!out.mainEntityOfPage) out.mainEntityOfPage = canonical;
    } else if (out['@type'] === 'FAQPage') {
      out = withId(out, `${canonical}#faq`, 'FAQPage');
    } else if (out['@type'] === 'BreadcrumbList') {
      out = withId(out, `${canonical}#breadcrumb`, 'BreadcrumbList');
    }
  } else if (!top && canonical && PAGE_SCOPED.test(String(out['@id'] ?? ''))) {
    /* Undo the earlier version of this script, which stamped the page-scoped @id
       on nested nodes too. Removing it here (rather than only guarding against
       adding it) is what lets a re-run repair pages that already shipped wrong. */
    out = { ...out };
    delete out['@id'];
    if (out.mainEntityOfPage === canonical) delete out.mainEntityOfPage;
  }

  const result = {};
  for (const [key, value] of Object.entries(out)) result[key] = walk(value, canonical, false);
  return result;
}

const files = execFileSync('git', ['ls-files', '*.html'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter((f) => !f.startsWith('tmp/') && !f.startsWith('previews/'));

let changed = 0;
let nodes = 0;
for (const rel of files) {
  const path = join(ROOT, rel);
  const html = readFileSync(path, 'utf8');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] || null;
  let next = html;

  /* The tag is hand-written on the older pages and wraps across lines
     (`<script\n        type="application/ld+json">`). Matching the single-line
     form only silently skipped 51 service pages — they kept their anonymous
     business nodes while the report claimed full coverage. */
  next = next.replace(
    /(<script\s[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g,
    (whole, open, body, close) => {
      let data;
      try {
        data = JSON.parse(body);
      } catch {
        return whole; // not our JSON to rewrite — leave it exactly as found
      }
      const updated = walk(data, canonical, true);
      const pretty = body.trim() !== body || /\n\s+"/.test(body);
      const indent = pretty ? (body.match(/\n(\s+)"/)?.[1]?.length ?? 4) - 2 : 0;
      const serialised = pretty
        ? `\n${JSON.stringify(updated, null, 2)
            .split('\n')
            .map((line) => ' '.repeat(indent) + line)
            .join('\n')}\n${' '.repeat(indent)}`
        : JSON.stringify(updated);
      if (JSON.stringify(updated) !== JSON.stringify(data)) nodes += 1;
      return `${open}${serialised}${close}`;
    },
  );

  if (next !== html) {
    writeFileSync(path, next);
    changed += 1;
  }
}

console.log(`Entity graph: ${nodes} node(s) given a stable @id across ${changed} page(s).`);
