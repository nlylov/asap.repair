'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

const galleryPages = {
  'services/ac-installation-cleaning/through-wall-ac-installation/index.html': {
    base: '/assets/photo/ac-installation/through-wall-ac-installation/',
    files: ['2c7ef3159c3c9ec2.webp', '82c97c9d1fafd310.webp', 'c61c974add1f7a92.webp', 'eea65fda0c2858c1.webp', '35c7de8add0796da.webp', '5ccf695423203b04.webp', 'ef400d5f4899fee5.webp', '0d62192524174fcd.webp'],
    banned: /mini-split|\bPTAC\b|\bRV\b|camper|outdoor condenser|appliance padding/i,
  },
  'services/ac-installation-cleaning/ac-deep-cleaning/index.html': {
    base: '/assets/photo/ac-installation/ac-deep-cleaning/',
    files: ['a86e597ec1ebd693.webp', 'd234a9fa2bcca9e2.webp', 'f7dff58466310500.webp', '82197f22178054d0.webp', 'e103d31b289ad5fd.webp', 'e1a7c3ae57b9724c.webp', '4bdc3eedc8f7450e.webp', '7c1e6805960728ca.webp'],
    banned: /range hood|mini-split.*install|outdoor kitchen|gas grill/i,
  },
  'services/appliance-services/microwave-installation/index.html': {
    base: '/assets/photo/appliance-services/microwave-installation/',
    files: ['5f230c7a50c40b4f.webp', '78b5b8156378047b.webp', '2b8ea3f1a7873313.webp', 'adf9d7a30f0c82cc.webp', '467b73f73a1b64ed.webp', 'ab34dd063837e4b5.webp', 'cde377c5eb506577.webp', 'a6e02ad7a9c228a6.webp'],
    banned: /outdoor kitchen|gas grill|gas range|range hood installation/i,
  },
  'services/appliance-services/refrigerator-installation/index.html': {
    base: '/assets/photo/appliance-services/refrigerator-installation/',
    files: ['209c3536da928d67.webp', 'b2d67c83f702acb7.webp', '750aa1e92a9e452b.webp', '6903c3dc5f2578aa.webp', '49ddd1c22397da81.webp', 'c134536f073f42fb.webp', '82236cbd2ea2d114.webp', '3c05900801302f89.webp'],
    banned: /commercial refrigerator|repair service|condenser coil|evaporator coil|air conditioner/i,
  },
};

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

function gallerySection(html) {
  const start = html.indexOf('<section class="svc-gallery" id="gallery"');
  assert.notEqual(start, -1, 'gallery section must exist');
  const end = html.indexOf('</section>', start);
  assert.notEqual(end, -1, 'gallery section must close');
  return html.slice(start, end + '</section>'.length);
}

test('four Phase 1 galleries contain only their reviewed page-specific mappings', () => {
  for (const [relative, expected] of Object.entries(galleryPages)) {
    const section = gallerySection(read(relative));
    const cards = section.match(/class="svc-gallery__card"/g) || [];
    const fullPaths = [...section.matchAll(/data-full="([^"]+)"/g)].map(match => match[1]);
    const imagePaths = [...section.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);

    assert.equal(cards.length, 8, `${relative} must have eight curated cards`);
    assert.deepEqual(fullPaths.map(item => path.basename(item)), expected.files, `${relative} full-image mapping drifted`);
    assert.deepEqual(imagePaths.map(item => path.basename(item)), expected.files, `${relative} thumbnail mapping drifted`);
    assert.ok(fullPaths.every(item => item.startsWith(expected.base)), `${relative} must use only its service asset directory`);
    assert.ok(imagePaths.every(item => item.startsWith(expected.base.replace('/assets/photo/', '/assets/photo/thumbnails/'))));
    assert.doesNotMatch(section, expected.banned, `${relative} contains unrelated gallery evidence`);
    assert.doesNotMatch(section, /Show All|svc-gallery__more|svc-gallery__filters/);

    for (const full of fullPaths) {
      const thumbnail = full.replace('/assets/photo/', '/assets/photo/thumbnails/');
      assert.ok(fs.existsSync(path.join(root, full)), `missing ${full}`);
      assert.ok(fs.existsSync(path.join(root, thumbnail)), `missing ${thumbnail}`);
    }
  }
});

test('all seven installation pages expose explicit, service-specific scope blocks', () => {
  const slugs = [
    'dishwasher-installation',
    'dryer-installation',
    'microwave-installation',
    'range-installation',
    'refrigerator-installation',
    'washer-dryer-installation',
    'washer-installation',
  ];

  for (const slug of slugs) {
    const relative = `services/appliance-services/${slug}/index.html`;
    const html = read(relative);
    const scopeStart = html.indexOf('<section class="svc-features svc-install-scope" id="installation-scope"');
    const seoStart = html.indexOf('<section class="svc-seo-text">');
    assert.ok(scopeStart > seoStart, `${slug} scope should follow its service overview`);
    const scopeEnd = html.indexOf('</section>', scopeStart);
    const scope = html.slice(scopeStart, scopeEnd + '</section>'.length);
    assert.equal((scope.match(/<h3>What’s Included<\/h3>/g) || []).length, 1);
    assert.equal((scope.match(/<h3>What May Cost Extra<\/h3>/g) || []).length, 1);
    assert.equal((scope.match(/<h3>What Must Be Ready Before Arrival<\/h3>/g) || []).length, 1);
    assert.match(scope, /existing|compatible|prepared/i);
    assert.match(scope, /building|COI/i);
    assert.doesNotMatch(html, /Related project context:/i);
  }
});

test('target AC pages no longer present unrelated renovation cases as service proof', () => {
  for (const relative of [
    'services/ac-installation-cleaning/through-wall-ac-installation/index.html',
    'services/ac-installation-cleaning/ac-deep-cleaning/index.html',
  ]) {
    assert.doesNotMatch(read(relative), /Related project context:/i);
  }
});

test('every sitemap page and canonical generator uses the Phase 1 asset version', () => {
  const assetVersion = '20260729a';
  const sitemap = read('sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]));
  assert.equal(urls.length, 131);

  for (const url of urls) {
    const relative = url.pathname === '/' ? 'index.html' : `${url.pathname.slice(1)}index.html`;
    const html = read(relative);
    assert.match(html, new RegExp(`/components/loader\\.js\\?v=${assetVersion}`), `${relative} loader cache-buster drifted`);
    assert.match(html, new RegExp(`/main\\.js\\?v=${assetVersion}`), `${relative} main cache-buster drifted`);
  }

  assert.match(read('components/loader.js'), new RegExp(`const ASSET_VERSION = '${assetVersion}'`));
  assert.match(read('scripts/generate-area-pages.mjs'), /const ASSET_VERSION = '20260726a'/);
  assert.match(read('scripts/generate-area-pages.mjs'), new RegExp(`const MAIN_ASSET_VERSION = '${assetVersion}'`));
  assert.match(read('scripts/generate-area-pages.mjs'), new RegExp(`const LOADER_ASSET_VERSION = '${assetVersion}'`));
  assert.match(read('scripts/generate-appliance-repair-pages.mjs'), new RegExp(`const ASSET_VERSION = '${assetVersion}'`));
  assert.match(read('scripts/generate-appliance-repair-pages.mjs'), /const CSS_VERSION = '20260726a'/);
  assert.match(read('scripts/generate-case-studies.py'), /ASSET_VERSION = "20260726a"/);
  assert.match(read('scripts/generate-case-studies.py'), new RegExp(`APP_ASSET_VERSION = "${assetVersion}"`));
});
