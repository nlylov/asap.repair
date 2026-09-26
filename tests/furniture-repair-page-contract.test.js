'use strict';

/*
 * Contract for /services/general-repairs/furniture-repair/ (hand-written service page, 2026-09-26).
 *
 * What it pins, and why each part can break silently otherwise:
 *  - identity: one canonical, one H1, unique title/description, baked navigation, an OG card on disk;
 *  - price: the Offer's minPrice/maxPrice and every visible figure are the catalog's
 *    wood-furniture-repair range — the generator writes them, this proves they still resolve;
 *  - FAQ: the FAQPage JSON-LD is the same five questions and answers the customer sees;
 *  - gallery: only the Astoria case-study photos, with their real pixel sizes and specific alt text;
 *  - scope: the owner's brief — exclusions stated under headings that say "No …", no Bronx wording,
 *    no link into flat-pack assembly. These hold for the page's OWN content only: the sitewide baked
 *    header/footer (identical on every page) still link /services/furniture-assembly/ and
 *    /handyman-bronx/, and changing that is a sitewide decision, not this page's;
 *  - discovery: sitemap, llms.txt, llms-full.txt, facts.json and static inbound links all name the URL.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const PAGE = 'services/general-repairs/furniture-repair/index.html';
const URL_ = 'https://asap.repair/services/general-repairs/furniture-repair/';
const PUBLIC_PATH = '/services/general-repairs/furniture-repair/';
const HUB = '/services/general-repairs/';
const CASE_SLUG = 'astoria-wood-table-refinishing-sticky-polyurethane';
const CASE_PATH = `/case-studies/${CASE_SLUG}/`;
const PHOTO_DIR = `/assets/case-studies/${CASE_SLUG}/`;
const SERVICE_KEY = 'wood-furniture-repair';

const html = read(PAGE);
const liveCatalog = JSON.parse(read('pricing/catalog/index.json')).live;
const catalog = JSON.parse(read(`pricing/catalog/${liveCatalog}.json`));
const catalogService = catalog.services.find((service) => service.key === SERVICE_KEY);

const decode = (text) => text
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&rarr;/g, '→').replace(/&middot;/g, '·');
const strip = (fragment) => decode(fragment.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

function jsonLd(source) {
  return [...source.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1].trim()));
}

/* Everything the page itself says: the markup with the sitewide baked header/footer removed. The
   footer links every borough page and the mega-menu links furniture assembly on every page of the
   site; this page's own copy is what the brief governs. */
function ownContent(source) {
  return source
    .replace(/<!--baked:header-->[\s\S]*?<!--\/baked-->/, '')
    .replace(/<!--baked:footer-->[\s\S]*?<!--\/baked-->/, '');
}

function mainContent(source) {
  const start = source.indexOf('<main id="main-content">');
  const end = source.indexOf('</main>', start);
  assert.ok(start !== -1 && end !== -1, 'page must have a <main id="main-content"> landmark');
  return source.slice(start, end);
}

function webpDims(publicPath) {
  const b = fs.readFileSync(path.join(root, publicPath.replace(/^\//, '')));
  const format = b.toString('ascii', 12, 16);
  if (format === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (format === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (format === 'VP8L') { const x = b.readUInt32LE(21); return [(x & 0x3fff) + 1, ((x >> 14) & 0x3fff) + 1]; }
  throw new Error(`${publicPath} is not a WebP file`);
}

function sitemapPages() {
  return [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    const pathname = new URL(match[1]).pathname;
    return pathname === '/' ? 'index.html' : `${pathname.slice(1)}index.html`;
  });
}

test('the catalog still carries the service this page prices', () => {
  assert.ok(catalogService, `${liveCatalog} has no "${SERVICE_KEY}" service`);
  assert.equal(catalogService.unitBasis, 'per_item');
  assert.ok(catalogService.tiers.every((tier) => tier.includes === 'labor_only' && tier.materialsIncluded === false),
    'the page says labor only, materials extra — the catalog must still say the same');
  assert.equal(catalogService.minCharge, catalog.constants.repairMinimum);
});

test('furniture repair page has one canonical identity and static navigation', () => {
  assert.match(html, new RegExp(`<link rel="canonical" href="${URL_}">`));
  assert.match(html, new RegExp(`<meta property="og:url" content="${URL_}">`));
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, 'exactly one H1');
  assert.doesNotMatch(html, /noindex/i);
  assert.ok(html.includes('<!--baked:header-->'), 'header must be baked into raw HTML');
  assert.ok(html.includes('<!--baked:footer-->'), 'footer must be baked into raw HTML');

  const title = decode(/<title>([^<]+)<\/title>/.exec(html)[1]);
  assert.ok(title.length >= 45 && title.length <= 65, `title is ${title.length} characters: ${title}`);
  const description = decode(/<meta\s+name="description"\s+content="([^"]+)"/.exec(html)[1]);
  assert.ok(description.length <= 160, `meta description is ${description.length} characters`);
  assert.match(description, /free photo estimate/i);

  const og = /<meta property="og:image" content="https:\/\/asap\.repair(\/[^"]+)"/.exec(html)[1];
  assert.ok(fs.existsSync(path.join(root, og.slice(1))), `missing OG image ${og}`);
  assert.deepEqual(webpDims(og), [1200, 630]);

  for (const other of sitemapPages()) {
    if (other === PAGE) continue;
    const otherHtml = read(other);
    const otherTitle = /<title>([^<]+)<\/title>/.exec(otherHtml)?.[1];
    const otherDescription = /<meta\s+name="description"\s+content="([^"]+)"/.exec(otherHtml)?.[1];
    assert.notEqual(otherTitle && decode(otherTitle), title, `${other} has the same title`);
    assert.notEqual(otherDescription && decode(otherDescription), description, `${other} has the same description`);
  }
});

test('structured data: breadcrumb to the hub, a catalog-priced Service offer, and the visible FAQ', () => {
  const blocks = jsonLd(html);
  const breadcrumb = blocks.find((node) => node['@type'] === 'BreadcrumbList');
  const service = blocks.find((node) => node['@type'] === 'Service');
  const faq = blocks.find((node) => node['@type'] === 'FAQPage');
  assert.ok(breadcrumb && service && faq, 'BreadcrumbList, Service and FAQPage are all required');

  assert.deepEqual(breadcrumb.itemListElement.map((item) => item.item), [
    'https://asap.repair/',
    'https://asap.repair/services/',
    `https://asap.repair${HUB}`,
    URL_,
  ]);

  assert.equal(service['@id'], `${URL_}#service`);
  assert.equal(service.mainEntityOfPage, URL_);
  assert.equal(service.provider['@id'], 'https://asap.repair/#business');
  assert.equal(service.provider.identifier.value, '2137199-DCWP');
  assert.deepEqual(service.areaServed.map((area) => area.name),
    ['Manhattan', 'Brooklyn', 'Queens', 'Staten Island', 'Nassau County']);
  assert.equal(service.offers['@type'], 'Offer');
  assert.deepEqual(service.offers.priceSpecification, {
    '@type': 'PriceSpecification',
    minPrice: catalogService.range.lo,
    maxPrice: catalogService.range.hi,
    priceCurrency: 'USD',
  });
  assert.ok(blocks.every((node) => !['Review', 'AggregateRating'].includes(node['@type'])));
  assert.doesNotMatch(JSON.stringify(blocks), /aggregateRating|"review"/i);

  const visible = [...html.matchAll(/<details[^>]*class="svc-faq__item"[^>]*>([\s\S]*?)<\/details>/g)].map((match) => ({
    q: strip(/<summary[^>]*>([\s\S]*?)<\/summary>/.exec(match[1])[1]),
    a: strip(/<div class="svc-faq__answer">([\s\S]*?)<\/div>/.exec(match[1])[1]),
  }));
  assert.equal(visible.length, 5, 'five visible FAQ items');
  assert.deepEqual(
    faq.mainEntity.map((item) => ({ q: item.name, a: item.acceptedAnswer.text })),
    visible,
    'FAQPage JSON-LD must be exactly the FAQ the customer sees',
  );
});

test('every price on the page is the catalog figure, with the assessment and minimum stated correctly', () => {
  const range = `$${catalogService.range.lo}–$${catalogService.range.hi}`;
  const markers = [...html.matchAll(/<span data-price-src="([^"]+)"[^>]*>([^<]*)<\/span>/g)];
  assert.ok(markers.length >= 3, 'hero, pricing card and FAQ each quote the range through a marker');
  for (const [, ref, text] of markers) {
    assert.equal(ref, `${SERVICE_KEY}.range`);
    assert.equal(text, range);
  }
  const meta = decode(/<meta\s+name="description"\s+content="([^"]+)"/.exec(html)[1]);
  assert.ok(meta.includes(`${range} per item, labor only`), 'meta description quotes the catalog range');

  const spec = JSON.parse(read('pricing/site-map.json')).proseFigures.files.find((file) => file.file === PAGE);
  assert.ok(spec, 'the page must be one the price generator writes');
  for (const [before, figure] of [['"minPrice":', 'lo'], ['"maxPrice":', 'hi']]) {
    const binding = spec.inlineRanges.find((r) => r.before === before);
    assert.ok(binding, `${before} is not bound to the catalog`);
    assert.deepEqual([binding.ref, binding.figure, binding.format, binding.in], [SERVICE_KEY, figure, 'number', 'jsonld']);
  }

  const text = strip(mainContent(html));
  assert.match(text, /labor only/i);
  assert.match(text, /materials (are )?extra/i);
  assert.match(text, /\$150 work minimum/);
  assert.match(text, /\$99 is credited toward the work/);
  assert.match(text, /photo estimate is free/i);
});

test('gallery shows only the Astoria case-study photos, at their real size, with specific alt text', () => {
  const start = html.indexOf('<section class="svc-gallery" id="gallery"');
  assert.notEqual(start, -1, 'gallery section must exist');
  const section = html.slice(start, html.indexOf('</section>', start));
  const caseStudy = JSON.parse(read('_data/case-studies.json')).find((study) => study.slug === CASE_SLUG);
  assert.equal(caseStudy.status, 'published');
  const published = new Set([caseStudy.heroImage, caseStudy.thumbnail, ...caseStudy.images.map((image) => image.src)]);

  const cards = [...section.matchAll(/<div class="svc-gallery__card" data-type="([a-z]+)">([\s\S]*?<\/div>\s*<div class="svc-gallery__caption">[\s\S]*?<\/div>)\s*<\/div>/g)];
  assert.ok(cards.length >= 6, `expected a real gallery, found ${cards.length} cards`);
  const alts = new Set();
  for (const [, type, body] of cards) {
    const full = /data-full="([^"]+)"/.exec(body)[1];
    const img = /<img src="([^"]+)" alt="([^"]+)"[^>]*width="(\d+)" height="(\d+)"/.exec(body);
    assert.ok(img, `card for ${full} needs src, alt, width and height`);
    const [, src, alt, width, height] = img;
    assert.equal(src, full);
    assert.ok(src.startsWith(PHOTO_DIR), `${src} is not an Astoria case-study photo`);
    assert.ok(published.has(src), `${src} is not one of the photos the case study publishes`);
    assert.deepEqual([Number(width), Number(height)], webpDims(src), `${src} width/height do not match the file`);
    assert.ok(alt.length >= 40 && /Astoria/.test(alt), `alt text is not specific: "${alt}"`);
    assert.ok(!alts.has(alt), `duplicate alt text: "${alt}"`);
    alts.add(alt);
    assert.ok(['before', 'process', 'detail', 'after'].includes(type));
  }
  for (const [, filter, shown] of section.matchAll(/data-filter="([a-z]+)">[^(<]*\((\d+)\)/g)) {
    const expected = filter === 'all' ? cards.length : cards.filter((card) => card[1] === filter).length;
    assert.equal(Number(shown), expected, `filter "${filter}" count`);
  }
  assert.ok(section.includes(`href="${CASE_PATH}"`), 'gallery links to the case study it comes from');
});

test('copy follows the owner brief: scope, exclusions, geography and links', () => {
  const own = ownContent(html);
  const main = mainContent(html);
  const text = strip(main);

  for (const phrase of [/re-glued and clamped/, /legs, rails and stretchers/, /runners, slides and glides/,
    /re-set or replace/, /edge veneer/, /strip(ped)? and refinish/, /bolts, brackets, glides and hardware/]) {
    assert.match(text, phrase);
  }
  for (const exclusion of [/upholstery, fabric or leather/, /do not weld/, /antique restoration that requires conservation/,
    /flat-pack furniture, a repair often costs more than replacing the piece/]) {
    assert.match(text, exclusion);
  }
  /* Headings are what a skimmer or an outline reads: a bare "Upholstery" under the services grid
     reads as an offer. Every heading in the not-offered section has to carry its own negation. */
  const notOffered = /<section[^>]*id="not-offered"[\s\S]*?<\/section>/.exec(main);
  assert.ok(notOffered, 'the page must state what it does not take on');
  const refusals = [...notOffered[0].matchAll(/<h3>([^<]+)<\/h3>/g)].map((match) => decode(match[1]));
  assert.ok(refusals.length >= 4, `expected the four refusals, found ${refusals.length}`);
  for (const heading of refusals) {
    assert.match(heading, /^No\b|Cheaper to Replace/, `"${heading}" reads like a service offered`);
  }

  assert.match(text, /Manhattan, Brooklyn, Queens, Staten Island and Nassau County/);
  assert.doesNotMatch(own, /bronx/i, 'the page must not mention the Bronx');
  assert.doesNotMatch(main, /href="\/services\/furniture-assembly\//, 'no links into furniture assembly from this page');
  assert.doesNotMatch(main, /ikea|flat-pack assembly/i);
  assert.doesNotMatch(own, /id="related-content"/, 'the JS related-content block would inject unrelated case studies');
  assert.doesNotMatch(text, /\bwill rank\b|recommended by (Google|ChatGPT)/i);

  const hrefs = new Set([...main.matchAll(/href="([^"]+)"/g)].map((match) => match[1]));
  for (const href of [HUB, CASE_PATH,
    '/services/general-repairs/cabinet-hardware-installation/',
    '/services/general-repairs/door-repair/',
    '/services/painting/cabinet-painting/',
    '/services/tv-wall-mounting/wall-cabinet-installation/']) {
    assert.ok(hrefs.has(href), `missing link to ${href}`);
    if (href.startsWith('/services/') || href.startsWith('/case-studies/')) {
      assert.ok(fs.existsSync(path.join(root, href.slice(1), 'index.html')), `${href} does not resolve locally`);
    }
  }
  assert.match(text, /Related project context: the Astoria wood table refinishing case study/);
});

test('discovery surfaces and static inbound links all carry the new URL', () => {
  const sitemap = read('sitemap.xml');
  assert.equal(sitemap.split(`<loc>${URL_}</loc>`).length - 1, 1, 'exactly one sitemap entry');
  assert.match(sitemap, new RegExp(`<loc>${URL_}</loc>\\s*<lastmod>\\d{4}-\\d{2}-\\d{2}</lastmod>`));
  assert.ok(read('llms.txt').includes(URL_), 'llms.txt');
  assert.ok(read('llms-full.txt').includes(URL_), 'llms-full.txt');

  const facts = JSON.parse(read('facts.json'));
  assert.ok(facts.priorityServicePages.generalRepairsAndInstallations.includes(URL_));
  const route = facts.revenuePriorityRoutes.woodFurnitureRepair;
  assert.equal(route.url, URL_);
  assert.ok(!route.areaServed.some((area) => /bronx/i.test(area)));
  assert.ok(facts.quotePreparationByCategory.woodFurnitureRepair);

  for (const relative of ['services/general-repairs/index.html', 'services/index.html', `case-studies/${CASE_SLUG}/index.html`]) {
    assert.ok(read(relative).includes(`href="${PUBLIC_PATH}"`), `${relative} must link to the new page`);
  }
  const caseStudy = JSON.parse(read('_data/case-studies.json')).find((study) => study.slug === CASE_SLUG);
  assert.ok(caseStudy.relatedServices.some((service) => service.url === PUBLIC_PATH),
    'the case-study SOURCE carries the link, so regeneration keeps it');
});
