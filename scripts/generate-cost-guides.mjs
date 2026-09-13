#!/usr/bin/env node
/*
 * Cost guides: "How much does X cost in NYC" articles generated from the pricing catalog.
 *
 * Why: the blog had three posts, all from April 2025, and "<service> cost NYC" is the
 * highest-intent query a handyman site can rank for — the searcher has a job in mind and
 * wants a number. Hand-written price articles rot (the three old ones had 20 of 29 rows
 * below the $150 minimum before the catalog took over), so these never carry a typed
 * figure: every price is read from pricing/price-tables/<catalog>.json — the same table
 * the on-page calculator renders — and the labels come from the calculator configs.
 *
 * Inputs:  _data/cost-guides.json (authored copy, no numbers), the price table, and
 *          components/modules/calculator.js (series/size labels).
 * Outputs: blog/<slug>/index.html, cards on blog/index.html (between markers), sitemap
 *          entries, llms.txt / llms-full.txt lines, and a "read the cost guide" link next
 *          to the calculator on each guide's service page.
 *
 * `--check` re-derives everything in memory and exits 1 on a single differing byte, so CI
 * catches a guide that drifted from the catalog the same way it does for the calculators.
 * Deterministic: no clock, no randomness — dates come from the data file.
 */

import { execFileSync, execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SITE = 'https://asap.repair';
const CHECK = process.argv.includes('--check');

const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const money = (n) => `$${Number(n).toLocaleString('en-US')}`;
const range = (lo, hi) => (lo === hi ? money(lo) : `${money(lo)} – ${money(hi)}`);
const cellText = (r) => (r.assessment ? '$99 assessment visit, credited toward the work' : range(r.lo, r.hi));

/* ---- data --------------------------------------------------------------- */

const data = JSON.parse(read('_data/cost-guides.json'));
const OFFER = data.offer;
const catalogVersion = JSON.parse(read('pricing/site-map.json')).catalogVersion;
const priceTable = JSON.parse(read(`pricing/price-tables/${catalogVersion}.json`)).modularCalculator;

/* Same trick generate-hub-calculators.mjs uses: the data half of calculator.js is plain
   object literals, so evaluating it up to the component export yields CONFIGS. */
function loadConfigs() {
  const src = read('components/modules/calculator.js');
  const dataOnly = src.slice(0, src.indexOf('export default function calculator'));
  // eslint-disable-next-line no-eval
  return eval(`${dataOnly}\nCONFIGS`);
}
const CONFIGS = loadConfigs();

function labelsFor(configKey) {
  const cfg = CONFIGS[configKey];
  const series = new Map();
  const sizes = new Map();
  if (cfg?.categories?.[0]?.options) for (const o of cfg.categories[0].options) if (o.value) series.set(o.value, o.label);
  const sizeCat = cfg?.categories?.[1];
  if (sizeCat?.optionSets) {
    for (const [s, opts] of Object.entries(sizeCat.optionSets)) sizes.set(s, new Map(opts.filter((o) => o.value).map((o) => [o.value, o.label])));
  } else if (sizeCat?.options) {
    const flat = new Map(sizeCat.options.filter((o) => o.value).map((o) => [o.value, o.label]));
    for (const s of series.keys()) sizes.set(s, flat);
  }
  return { series, sizes };
}

/* Rows for one config: [seriesLabel, sizeLabel, lo, hi], in the table's own order. */
function rowsFor(configKey) {
  const table = priceTable[configKey];
  if (!table) throw new Error(`cost-guides: no price table for config "${configKey}" in ${catalogVersion}`);
  const { series, sizes } = labelsFor(configKey);
  const rows = [];
  for (const [s, bySize] of Object.entries(table)) {
    if (!bySize || typeof bySize !== 'object') continue;
    for (const [sz, cell] of Object.entries(bySize)) {
      if (!Array.isArray(cell) || cell.length !== 2) continue;
      /* Same rule as flooredRange() in calculator.js: the stored cell may sit below the
         $150 work minimum (frozen gas steps, a $99 assessment-only path) but the page
         never renders a work price under $150. [99, 99] is the assessment visit, not
         work, and is shown as such. */
      const assessment = cell[0] === 99 && cell[1] === 99;
      rows.push({
        series: series.get(s) ?? s,
        size: sizes.get(s)?.get(sz) ?? sz,
        lo: assessment ? 99 : Math.max(cell[0], 150),
        hi: assessment ? 99 : Math.max(cell[1], 150),
        assessment,
      });
    }
  }
  if (!rows.length) throw new Error(`cost-guides: config "${configKey}" has no priced cells`);
  return rows;
}

/* Strip the "(small)" style qualifier the calculator appends — the column already says size. */
const tidy = (label) => label.replace(/\s*\((small|medium|large|x-large|xl)\)\s*$/i, '').trim();

/* ---- rendering ---------------------------------------------------------- */

const furniturePost = read('blog/furniture-assembly-cost-nyc/index.html');
const STYLE = furniturePost.match(/<style>[\s\S]*?<\/style>/)[0];
const ICONS = furniturePost.match(/<link rel="icon"[^>]*>/g).join('\n  ');
const ANALYTICS = furniturePost.match(/<script defer src="\/analytics\.js[^>]*><\/script>/)[0];
const STYLESHEET = furniturePost.match(/(?:<link rel="preload" as="font"[^>]*>\s*)*<link rel="stylesheet" href="\/styles\.css[^>]*>/)[0];
const SCRIPTS = furniturePost.match(/<script src="\/components\/loader\.js[^>]*><\/script>\s*<script src="\/main\.js[^>]*><\/script>/)[0];

const monthName = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

const existingPosts = {
  'furniture-assembly-cost-nyc': { icon: '🛋️', title: 'Furniture Assembly Cost in NYC: Price Guide' },
  'tv-mounting-nyc-apartment': { icon: '📺', title: 'How to Mount a TV in an NYC Apartment' },
  'handyman-queens-nyc': { icon: '🔧', title: 'Best Handyman Services in Queens, NYC' },
};
const guideBySlug = Object.fromEntries(data.guides.map((g) => [g.slug, g]));
const cardFor = (slug) => {
  const g = guideBySlug[slug];
  if (g) return { icon: g.icon, title: g.h1.replace(/\s*\(\d{4} Prices\)\s*$/, '') };
  if (existingPosts[slug]) return existingPosts[slug];
  throw new Error(`cost-guides: related slug "${slug}" is neither a guide nor a known post`);
};

function renderTable(heading, rows) {
  return `
          <h3>${esc(heading)}</h3>
          <table class="article-table">
            <thead><tr><th>Job</th><th>Size / scope</th><th>Typical NYC price (labor)</th></tr></thead>
            <tbody>
${rows.map((r) => `              <tr><td>${esc(r.series)}</td><td>${esc(tidy(r.size))}</td><td>${cellText(r)}</td></tr>`).join('\n')}
            </tbody>
          </table>`;
}

function renderGuide(g) {
  const url = `${SITE}/blog/${g.slug}/`;
  const tables = g.tables.map(([config, heading]) => ({ heading, rows: rowsFor(config) }));
  const primary = rowsFor(g.primaryConfig);
  const all = tables.flatMap((t) => t.rows).filter((r) => !r.assessment);
  const lo = Math.min(...all.map((r) => r.lo));
  const hi = Math.max(...all.map((r) => r.hi));
  const description = `${g.description} ${OFFER}`;

  /* Sidebar: one line per series of the primary config, its own min–max. */
  const bySeries = new Map();
  for (const r of primary.filter((x) => !x.assessment)) {
    const cur = bySeries.get(r.series) ?? { lo: Infinity, hi: 0 };
    bySeries.set(r.series, { lo: Math.min(cur.lo, r.lo), hi: Math.max(cur.hi, r.hi) });
  }
  const sidebarRows = [...bySeries.entries()].slice(0, 6);

  const costQ = {
    q: `How much does ${g.serviceLabel} cost in NYC?`,
    a: `Across the jobs in this guide, labor runs ${range(lo, hi)} in New York City. Photo and text estimates are free; an on-site assessment visit is $99, credited toward the job. Work starts at the $150 minimum and is quoted before anything begins. NYC sales tax is added separately where applicable.`,
  };
  const faqs = [...g.faq.map(([q, a]) => ({ q, a })), costQ];

  /* Exactly the shape consolidate-entity-graph.mjs normalises business nodes to, in the
     same key order, so that post-step is a no-op here and --check compares equal. */
  const business = () => ({
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${SITE}/#business`,
    name: 'Repair ASAP LLC',
    telephone: '+1-775-310-7770',
    url: SITE,
    logo: `${SITE}/assets/images/logo-header.webp`,
    identifier: { '@type': 'PropertyValue', propertyID: 'NYC DCWP Home Improvement Contractor License', value: '2137199-DCWP' },
  });
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: g.h1,
    description,
    author: business(),
    publisher: business(),
    datePublished: g.published,
    dateModified: g.published,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    about: [g.serviceLabel, 'NYC handyman pricing'],
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog/` },
      { '@type': 'ListItem', position: 3, name: g.h1, item: url },
    ],
  };

  const list = (items) => items.map((i) => `            <li>${esc(i)}</li>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    ${ANALYTICS}

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(g.title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:title" content="${esc(g.h1)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}/assets/images/og-image.png">
  <meta property="og:image:alt" content="Repair ASAP LLC handyman services in New York City">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${SITE}/assets/images/og-image.png">
  ${ICONS}
  ${STYLESHEET}
  <script type="application/ld+json">${JSON.stringify(article)}</script>
  <script type="application/ld+json">${JSON.stringify(faqLd)}</script>
  <script type="application/ld+json">${JSON.stringify(crumbs)}</script>
  ${STYLE}
</head>
<body>
  <div id="site-header"></div>

  <section class="article-hero">
    <div class="container">
      <nav class="breadcrumb">
        <a href="/">Home</a><span class="breadcrumb__sep">›</span>
        <a href="/blog/">Blog</a><span class="breadcrumb__sep">›</span>
        <span>${esc(g.title.split('|')[0].trim())}</span>
      </nav>
      <div class="article-meta">
        <span class="article-tag">${esc(g.tag)}</span>
        <span class="article-date">Updated ${monthName(g.published)}</span>
        <span class="article-read">· Prices from catalog ${esc(catalogVersion)}</span>
      </div>
      <h1 class="article-hero__title">${esc(g.h1)}</h1>
      <p class="article-lead">${esc(g.lead)}</p>
    </div>
  </section>

  <section class="article-body">
    <div class="container">
      <div class="article-layout">
        <div class="article-content">
${g.intro.map((p) => `          <p>${esc(p)}</p>`).join('\n')}

          <h2>${esc(g.serviceLabel.charAt(0).toUpperCase() + g.serviceLabel.slice(1))} prices in NYC: ${range(lo, hi)}</h2>
          <p>Every figure below is labor from the current price catalog (${esc(catalogVersion)}), floored at the $150 work minimum. The exact quote is confirmed from your photos before booking; NYC sales tax is added separately where applicable.</p>
${tables.map((t) => renderTable(t.heading, t.rows)).join('\n')}

          <div data-module="calculator" data-config="${esc(g.primaryConfig)}"></div>

          <h2>What drives the price</h2>
          <ul>
${list(g.drivers)}
          </ul>

          <h2>What's included</h2>
          <ul>
${list(g.included)}
          </ul>

          <h2>What's quoted separately</h2>
          <ul>
${list(g.extra)}
          </ul>
${g.notOurJob.length ? `
          <h2>When it's not a handyman job</h2>
          <ul>
${list(g.notOurJob)}
          </ul>` : ''}

          <h2>How the assessment visit and the work minimum are priced</h2>
          <p>Photo and text estimates are free — send photos and you get a real range. If the job needs eyes on site first, the assessment visit is $99 and is credited toward the work if you hire us. Actual work starts at the $150 minimum. Repair ASAP LLC is a NYC DCWP-licensed home improvement contractor (License No. 2137199-DCWP) and carries general liability insurance with COI support for co-ops and condos.</p>

          <h2>Frequently asked questions</h2>
${faqs.map((f) => `          <h3>${esc(f.q)}</h3>\n          <p>${esc(f.a)}</p>`).join('\n')}

          <div class="article-cta">
            <h3>Ready for a real number?</h3>
            <p>Text photos and get a free estimate. DCWP-licensed &amp; insured, COI support, work from $150.</p>
            <div class="article-cta__btns">
              <button class="btn btn--accent" data-open-quote>Get a Free Quote</button>
              <a class="btn btn--outline" href="${esc(g.serviceUrl)}">View ${esc(g.serviceLabel)} service →</a>
            </div>
          </div>

          <div class="related">
            <p class="related__title">Related guides</p>
            <div class="related__grid">
${g.related.map((slug) => {
  const c = cardFor(slug);
  return `              <a class="related__card" href="/blog/${slug}/">\n                <div class="related__card-icon">${c.icon}</div>\n                <div class="related__card-title">${esc(c.title)}</div>\n              </a>`;
}).join('\n')}
            </div>
          </div>
        </div>

        <aside class="article-sidebar">
          <div class="sidebar-card">
            <p class="sidebar-card__title">Quick price reference</p>
${sidebarRows.map(([s, r]) => `            <div class="sidebar-card__item"><span class="sidebar-card__label">${esc(s)}</span><span class="sidebar-card__value">${range(r.lo, r.hi)}</span></div>`).join('\n')}
            <div class="sidebar-card__item"><span class="sidebar-card__label">Work minimum</span><span class="sidebar-card__value">$150</span></div>
            <div class="sidebar-cta">
              <button class="btn btn--accent btn--full" data-open-quote>Get a Free Quote</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>

  <div id="site-footer"></div>
  ${SCRIPTS}
</body>
</html>
`;
}

/* ---- side effects on other files (all idempotent) ------------------------ */

function blogIndexWith(html) {
  const START = '        <!-- cost-guides:start -->';
  const END = '        <!-- cost-guides:end -->';
  const cards = data.guides.map((g) => `        <article class="blog-card reveal">
          <div class="blog-card__icon">${g.icon}</div>
          <div class="blog-card__body">
            <div class="blog-card__meta">
              <span class="blog-card__tag">${esc(g.tag)}</span>
              <span class="blog-card__date">Updated ${monthName(g.published)}</span>
            </div>
            <h2 class="blog-card__title"><a href="/blog/${g.slug}/">${esc(g.h1)}</a></h2>
            <p class="blog-card__excerpt">${esc(g.description)}</p>
            <a class="blog-card__link" href="/blog/${g.slug}/">Read more →</a>
          </div>
        </article>`).join('\n\n');
  const block = `${START}\n${cards}\n${END}`;
  if (html.includes(START)) return html.replace(new RegExp(`${START.trim()}[\\s\\S]*?${END.trim()}`), block.trim());
  /* First run: the guides go at the top of the grid — newest content first. */
  return html.replace(/(<div class="blog-grid">\n)/, `$1\n${block}\n\n`);
}

function sitemapWith(xml) {
  let out = xml;
  for (const g of data.guides) {
    const loc = `${SITE}/blog/${g.slug}/`;
    if (out.includes(`<loc>${loc}</loc>`)) continue;
    const entry = `    <url>\n        <loc>${loc}</loc>\n        <lastmod>${g.published}</lastmod>\n        <changefreq>monthly</changefreq>\n        <priority>0.7</priority>\n    </url>\n`;
    out = out.replace('</urlset>', `${entry}</urlset>`);
  }
  return out;
}

/* Both AI guides list the blog under a line that names the Queens guide; new guides go
   right after the last existing blog line in that block so the list stays contiguous. */
function llmsWith(text) {
  const lines = text.split('\n');
  const anchor = lines.findIndex((l) => l.includes('/blog/handyman-queens-nyc/'));
  if (anchor < 0) throw new Error('cost-guides: llms anchor (handyman-queens-nyc line) not found');
  let insertAt = anchor + 1;
  while (insertAt < lines.length && /^- .*https:\/\/asap\.repair\/blog\//.test(lines[insertAt])) insertAt += 1;
  const missing = data.guides
    .filter((g) => !text.includes(`${SITE}/blog/${g.slug}/`))
    .map((g) => `- ${g.h1.replace(/\s*\(\d{4} Prices\)\s*$/, '')}: ${SITE}/blog/${g.slug}/`);
  if (!missing.length) return text;
  lines.splice(insertAt, 0, ...missing);
  return lines.join('\n');
}

/* A link from the calculator on the service page to the guide that explains the numbers. */
function servicePageWith(html, g) {
  const marker = `href="/blog/${g.slug}/"`;
  if (html.includes(marker)) return html;
  const link = `<p class="calc-guide-link" style="text-align:center;margin:16px 0 0"><a class="btn btn--outline" href="/blog/${g.slug}/">Read the NYC ${esc(g.serviceLabel)} cost guide →</a></p>`;
  const leaf = new RegExp(`(<div data-module="calculator"[^>]*data-config="${g.primaryConfig}"[^>]*>\\s*</div>)`);
  if (leaf.test(html)) return html.replace(leaf, `$1\n                ${link}`);
  /* Hubs mount the derived hub calculator (data-config="hub-…"), whose container is not
     self-closing; put the link just above it instead. */
  const hub = /([ \t]*)(<div data-module="calculator"[^>]*data-config="hub-[a-z-]+"[^>]*>)/;
  if (hub.test(html)) return html.replace(hub, `$1${link}\n$1$2`);
  return null; // caller reports; the guide still ships without the backlink
}

/* ---- run --------------------------------------------------------------- */

const outputs = new Map(); // rel path -> content
for (const g of data.guides) outputs.set(`blog/${g.slug}/index.html`, renderGuide(g));
outputs.set('blog/index.html', blogIndexWith(read('blog/index.html')));
outputs.set('sitemap.xml', sitemapWith(read('sitemap.xml')));
outputs.set('llms.txt', llmsWith(read('llms.txt')));
outputs.set('llms-full.txt', llmsWith(read('llms-full.txt')));

const noBacklink = [];
for (const g of data.guides) {
  const rel = `${g.serviceUrl.replace(/^\//, '')}index.html`;
  if (!existsSync(join(ROOT, rel))) throw new Error(`cost-guides: service page missing for ${g.slug}: ${rel}`);
  const next = servicePageWith(read(rel), g);
  if (next === null) noBacklink.push(rel);
  else outputs.set(rel, next);
}

if (CHECK) {
  /* A brand-new guide page has no baked header yet, so compare the body the generator owns:
     everything except the two baked placeholders, which bake-components fills afterwards. */
  const strip = (s) => s
    .replace(/<div id="site-header"(?: class="loaded")?>(?:<!--baked:header-->[\s\S]*?<!--\/baked-->)?<\/div>/, '<div id="site-header"></div>')
    .replace(/<div id="site-footer"(?: class="loaded")?>(?:<!--baked:footer-->[\s\S]*?<!--\/baked-->)?<\/div>/, '<div id="site-footer"></div>');
  const stale = [...outputs].filter(([rel, content]) => !existsSync(join(ROOT, rel)) || strip(read(rel)) !== strip(content));
  if (stale.length) {
    console.error('Cost guides are out of date. Run: node scripts/generate-cost-guides.mjs');
    for (const [rel] of stale) console.error(`  ${rel}`);
    process.exit(1);
  }
  console.log(`Cost guides are in sync with ${catalogVersion}: ${data.guides.length} guides.`);
  process.exit(0);
}

let written = 0;
const created = [];
for (const [rel, content] of outputs) {
  const abs = join(ROOT, rel);
  const isNew = !existsSync(abs);
  if (!isNew && read(rel) === content) continue;
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
  written += 1;
  if (isNew) created.push(rel);
}
console.log(`Cost guides: ${data.guides.length} guides from ${catalogVersion}; ${written} file(s) written.`);
if (noBacklink.length) console.log(`  no calculator anchor for a backlink on: ${noBacklink.join(', ')}`);

/* bake-components reads git ls-files, so a brand-new page must be intent-to-add first. */
if (created.length) execFileSync('git', ['add', '-N', '--', ...created], { cwd: ROOT });
for (const step of ['bake-components.mjs', 'vendor-fonts.mjs', 'consolidate-entity-graph.mjs']) {
  execSync(`node ${join(ROOT, 'scripts', step)}`, { stdio: 'inherit' });
}
