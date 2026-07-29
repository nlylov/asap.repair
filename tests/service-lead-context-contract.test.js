'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const mainSource = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
const modalSource = fs.readFileSync(path.join(root, 'components', 'quote-modal.js'), 'utf8');
const photoDropSource = fs.readFileSync(path.join(root, 'components', 'modules', 'photo-drop.js'), 'utf8');
const taxonomyDoc = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'crm-appliance-service-taxonomy.json'), 'utf8'));
const modalHtml = fs.readFileSync(path.join(root, 'components', 'quote-modal.html'), 'utf8');
const homepageHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('frontend quote payloads include normalized CRM service taxonomy context', () => {
  assert.match(mainSource, /REPAIR_ASAP_CRM_TAXONOMY_VERSION = '2026-07-29'/);
  assert.match(mainSource, /'commercial-refrigeration': \{[\s\S]*serviceCode: 'commercial_refrigeration_triage'/);
  assert.match(mainSource, /'commercial-refrigeration': \{[\s\S]*vertical: 'commercial_refrigeration'/);
  assert.match(mainSource, /'commercial-refrigeration': \{[\s\S]*'epa_608_required'/);
  assert.match(mainSource, /'reach-in-cooler-repair': \{[\s\S]*serviceCode: 'reach_in_cooler_repair_help'/);
  assert.match(mainSource, /'walk-in-cooler-repair': \{[\s\S]*equipmentFamily: 'walk_in_cooler'/);
  assert.match(mainSource, /'restaurant-refrigeration-repair': \{[\s\S]*marketSegment: 'commercial_food_service'/);
  assert.match(mainSource, /'ice-machine-repair': \{[\s\S]*quickbooksItem: 'Ice Machine Diagnostic'/);
  assert.match(mainSource, /window\.repairAsapBuildServiceLeadContext = repairAsapBuildServiceLeadContext/);
});

test('all seven appliance installation routes have consistent website-owned taxonomy mappings', () => {
  const expected = [
    ['dishwasher-installation', 'dishwasher_installation', 'dishwasher'],
    ['dryer-installation', 'dryer_installation', 'dryer'],
    ['microwave-installation', 'microwave_installation', 'microwave'],
    ['range-installation', 'range_installation', 'range_oven'],
    ['refrigerator-installation', 'refrigerator_installation', 'refrigerator'],
    ['washer-dryer-installation', 'washer_dryer_installation', 'washer_dryer_combo'],
    ['washer-installation', 'washer_installation', 'washer'],
  ];

  assert.equal(taxonomyDoc.version, '2026-07-29');
  const catalogByRoute = new Map(taxonomyDoc.serviceCatalog.map(item => [item.publicRoute, item]));
  for (const [slug, serviceCode, applianceType] of expected) {
    const route = `/services/appliance-services/${slug}/`;
    assert.match(mainSource, new RegExp(`'${slug}': \\{[\\s\\S]*?serviceCode: '${serviceCode}'[\\s\\S]*?vertical: 'appliance_installation'[\\s\\S]*?intent: 'installation'[\\s\\S]*?quickbooksItem: 'Appliance Replacement Setup'[\\s\\S]*?applianceType: '${applianceType}'[\\s\\S]*?publicRoute: '${route}'`));
    assert.ok(fs.existsSync(path.join(root, route, 'index.html')), `${route} must resolve to a local page`);
    const documented = catalogByRoute.get(route);
    assert.ok(documented, `${route} must exist in the taxonomy document`);
    assert.equal(documented.crmCode, serviceCode);
    assert.equal(documented.defaultVertical, 'appliance_installation');
    assert.equal(documented.defaultIntent, 'installation');
    assert.equal(documented.applianceType, applianceType);
    assert.equal(documented.quickbooksItem, 'Appliance Replacement Setup');
  }

  assert.equal(new Set(expected.map(([, serviceCode]) => serviceCode)).size, expected.length);
  assert.equal(new Set(expected.map(([slug]) => `/services/appliance-services/${slug}/`)).size, expected.length);
});

test('all website quote surfaces send the service taxonomy custom fields', () => {
  assert.match(mainSource, /\.\.\.\(window\.repairAsapBuildServiceLeadContext\?\.\(\{ service: service\.value \}\) \|\| \{\}\)/);
  assert.match(modalSource, /repairAsapBuildServiceLeadContext\(\{ service: serviceValue \}\)/);
  assert.match(modalSource, /\.\.\.pageQuoteContext\(serviceSelect \? serviceSelect\.value : ''\)/);
  assert.match(photoDropSource, /\.\.\.\(window\.repairAsapBuildServiceLeadContext\?\.\(\{ service: detectedService \}\) \|\| \{\}\)/);
});

test('all customer lead quote surfaces explicitly send an existing thread id without creating one', () => {
  assert.match(mainSource, /threadId: window\.repairAsapGetStoredThreadId\?\.\(\) \|\| ''/);
  assert.match(modalSource, /threadId: window\.repairAsapGetStoredThreadId\?\.\(\) \|\| ''/);
  assert.match(photoDropSource, /threadId: window\.repairAsapGetStoredThreadId\?\.\(\) \|\| ''/);
  assert.match(mainSource, /window\.repairAsapGetStoredThreadId = repairAsapGetStoredThreadId/);
  for (const source of [mainSource, modalSource, photoDropSource]) {
    assert.doesNotMatch(source, /api\/widget\/thread/);
  }
});

test('homepage and modal dropdowns expose high-intent appliance and commercial options', () => {
  for (const html of [homepageHtml, modalHtml]) {
    assert.match(html, /<option value="Refrigerator Repair Help">Refrigerator Repair Help<\/option>/);
    assert.match(html, /<option value="Commercial Refrigeration Triage">Commercial Refrigeration Triage<\/option>/);
    assert.match(html, /<option value="Reach-In Cooler Repair Help">Reach-In Cooler Repair Help<\/option>/);
    assert.match(html, /<option value="Walk-In Cooler Repair Help">Walk-In Cooler Repair Help<\/option>/);
    assert.match(html, /<option value="Prep Table Refrigerator Repair Help">Prep Table Refrigerator Repair Help<\/option>/);
    assert.match(html, /<option value="Restaurant Refrigeration Repair Help">Restaurant Refrigeration Repair Help<\/option>/);
    assert.match(html, /<option value="Ice Machine Repair Help">Ice Machine Repair Help<\/option>/);
    assert.match(html, /<option value="Ice Machine Cleaning">Ice Machine Cleaning<\/option>/);
    assert.match(html, /<option value="AC Repair Help">AC Repair Help<\/option>/);
  }
});
