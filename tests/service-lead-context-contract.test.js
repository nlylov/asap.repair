'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const mainSource = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
const modalSource = fs.readFileSync(path.join(root, 'components', 'quote-modal.js'), 'utf8');
const photoDropSource = fs.readFileSync(path.join(root, 'components', 'modules', 'photo-drop.js'), 'utf8');
const modalHtml = fs.readFileSync(path.join(root, 'components', 'quote-modal.html'), 'utf8');
const homepageHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('frontend quote payloads include normalized CRM service taxonomy context', () => {
  assert.match(mainSource, /REPAIR_ASAP_CRM_TAXONOMY_VERSION = '2026-07-15'/);
  assert.match(mainSource, /'commercial-refrigeration': \{[\s\S]*serviceCode: 'commercial_refrigeration_triage'/);
  assert.match(mainSource, /'commercial-refrigeration': \{[\s\S]*vertical: 'commercial_refrigeration'/);
  assert.match(mainSource, /'commercial-refrigeration': \{[\s\S]*'epa_608_required'/);
  assert.match(mainSource, /window\.repairAsapBuildServiceLeadContext = repairAsapBuildServiceLeadContext/);
});

test('all website quote surfaces send the service taxonomy custom fields', () => {
  assert.match(mainSource, /\.\.\.\(window\.repairAsapBuildServiceLeadContext\?\.\(\{ service: service\.value \}\) \|\| \{\}\)/);
  assert.match(modalSource, /repairAsapBuildServiceLeadContext\(\{ service: serviceValue \}\)/);
  assert.match(modalSource, /\.\.\.pageQuoteContext\(serviceSelect \? serviceSelect\.value : ''\)/);
  assert.match(photoDropSource, /\.\.\.\(window\.repairAsapBuildServiceLeadContext\?\.\(\{ service: detectedService \}\) \|\| \{\}\)/);
});

test('homepage and modal dropdowns expose high-intent appliance and commercial options', () => {
  for (const html of [homepageHtml, modalHtml]) {
    assert.match(html, /<option value="Refrigerator Repair Help">Refrigerator Repair Help<\/option>/);
    assert.match(html, /<option value="Commercial Refrigeration Triage">Commercial Refrigeration Triage<\/option>/);
    assert.match(html, /<option value="Ice Machine Cleaning">Ice Machine Cleaning<\/option>/);
    assert.match(html, /<option value="AC Repair Help">AC Repair Help<\/option>/);
  }
});
