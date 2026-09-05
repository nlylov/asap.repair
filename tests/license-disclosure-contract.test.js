'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const licenseNumber = '2137199-DCWP';
const licenseType = 'Home Improvement Contractor';
const disclosure = `Repair ASAP LLC &middot; NYC DCWP ${licenseType} License No. ${licenseNumber}`;
const verificationUrl = 'https://www.nyc.gov/site/dca/consumers/check-license.page';

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

function normalized(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function withoutBakedFooter(html) {
  return html.replace(/<!--baked:footer-->[\s\S]*?<!--\/baked-->/g, '');
}

function visibleContent(html) {
  return withoutBakedFooter(html).replace(/<script\b[\s\S]*?<\/script>/g, '');
}

function sitemapPages() {
  return [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    const url = new URL(match[1]);
    return url.pathname === '/' ? 'index.html' : `${url.pathname.slice(1)}index.html`;
  });
}

test('canonical footer clearly identifies the NYC DCWP HIC license and insurance type', () => {
  const footer = read('components/footer.html');
  assert.match(footer, /General liability insured, COI-ready/);
  assert.ok(normalized(footer).includes(disclosure));
  assert.ok(footer.includes(`href="${verificationUrl}"`));
  assert.match(footer, /1-year workmanship repair guarantee on covered labor/);
  assert.match(footer, /Normal wear, misuse, pre-existing conditions, client-supplied materials, and\s+third-party damage are excluded/);
});

test('quote request surface displays the same license identity at the point of conversion', () => {
  const modal = read('components/quote-modal.html');
  assert.ok(modal.includes(`NYC DCWP ${licenseType} License No. ${licenseNumber}`));
  assert.match(modal, /does not authorize work or create a home-improvement contract/);
  assert.match(modal, /Remote photo estimates are free\. Selecting a date books an appointment slot/);
  assert.match(modal, /on-site assessment is needed, it costs \$99 and is credited toward approved work/);
  assert.match(modal, /work performed has a \$150 minimum/);
});

test('every sitemap page contains the exact license disclosure in its raw baked footer', () => {
  const pages = sitemapPages();
  assert.ok(pages.length > 0, 'sitemap must contain public HTML pages');

  for (const relative of pages) {
    const html = read(relative);
    const bakedFooter = html.match(/<!--baked:footer-->([\s\S]*?)<!--\/baked-->/);
    assert.ok(bakedFooter, `${relative} must contain a raw baked footer`);
    assert.ok(normalized(bakedFooter[1]).includes(disclosure), `${relative} must identify the NYC DCWP HIC license`);
    assert.match(bakedFooter[1], /General liability insured, COI-ready/, `${relative} must state the insurance type`);
    assert.match(bakedFooter[1], /1-year workmanship repair guarantee on covered labor/, `${relative} must summarize the advertised guarantee`);
  }
});

test('legal, trust, and AI-readable surfaces carry the same verified license identity', () => {
  for (const relative of ['index.html', 'about/index.html', 'faq/index.html', 'terms-of-service/index.html']) {
    const html = visibleContent(read(relative));
    assert.ok(html.includes(licenseNumber), `${relative} must include the license number outside the footer source`);
    assert.match(html, /Home Improvement Contractor/);
  }

  const homeSchemas = [...read('index.html').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
  const business = homeSchemas.find((schema) => schema['@type'] === 'HomeAndConstructionBusiness');
  assert.deepEqual(business.identifier, {
    '@type': 'PropertyValue',
    propertyID: 'NYC DCWP Home Improvement Contractor License',
    value: licenseNumber,
  });

  const entitySource = read('scripts/consolidate-entity-graph.mjs');
  assert.match(entitySource, /name: 'Repair ASAP LLC'/);
  assert.match(entitySource, /value: '2137199-DCWP'/);

  const facts = JSON.parse(read('facts.json'));
  assert.deepEqual(facts.license, {
    holder: 'Repair ASAP LLC',
    agency: 'New York City Department of Consumer and Worker Protection (DCWP)',
    type: licenseType,
    number: licenseNumber,
    verificationUrl,
  });

  for (const relative of ['llms.txt', 'llms-full.txt']) {
    const text = read(relative);
    assert.ok(text.includes(licenseNumber), `${relative} must include the license number`);
    assert.ok(text.includes(licenseType), `${relative} must identify the license type`);
  }
});

test('website intake stays distinct from a home-improvement contract and preserves statutory rights', () => {
  const terms = visibleContent(read('terms-of-service/index.html'));
  assert.match(terms, /does not by itself create or replace a\s+home-improvement contract/);
  assert.match(terms, /separate, completed,\s+signed written agreement/);
  assert.match(terms, /three-business-day cancellation period/);
  assert.match(terms, /No cancellation fee applies when\s+exercising an applicable statutory cancellation right/);
  assert.match(terms, /Nothing in this section limits any right or remedy that cannot\s+lawfully be limited or waived/);

  const home = visibleContent(read('index.html'));
  assert.match(home, /terms-of-service\/#workmanship-guarantee/);
  assert.match(home, /does not authorize work or create a home-improvement contract/);
  assert.match(home, /Repair ASAP LLC · NYC DCWP Home Improvement Contractor License No\. 2137199-DCWP/);
  assert.match(home, /on-site assessment is needed, it costs \$99 and is credited toward approved work/);

  const about = visibleContent(read('about/index.html'));
  assert.match(about, /Normal wear, misuse, pre-existing conditions,\s+client-supplied materials, and third-party damage are excluded/);
});
