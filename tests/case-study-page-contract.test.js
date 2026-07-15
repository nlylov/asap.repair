'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const generatorSource = fs.readFileSync(path.join(root, 'scripts', 'generate-case-studies.py'), 'utf8');
const cssSource = fs.readFileSync(path.join(root, 'case-studies', 'case-studies.css'), 'utf8');
const redirectsSource = fs.readFileSync(path.join(root, '_redirects'), 'utf8');
const apartmentSource = fs.readFileSync(
  path.join(root, 'case-studies', 'one-bedroom-apartment-turnover-nyc', 'index.html'),
  'utf8',
);
const caseStudyData = JSON.parse(fs.readFileSync(path.join(root, '_data', 'case-studies.json'), 'utf8'));
const apartmentData = caseStudyData.find((caseStudy) => caseStudy.slug === 'one-bedroom-apartment-turnover-nyc');

assert.ok(apartmentData);

test('case study before/after sliders do not render a native range control overlay', () => {
  assert.match(generatorSource, /class="ba__media" role="slider" tabindex="0"/);
  assert.match(generatorSource, /class="ba__labels" aria-hidden="true"/);
  assert.match(generatorSource, /translate="no">Before/);
  assert.match(generatorSource, /translate="no">After/);
  assert.doesNotMatch(generatorSource, /<input class="ba__range"/);
  assert.doesNotMatch(apartmentSource, /<input class="ba__range"/);
  assert.match(cssSource, /\.ba__range \{[\s\S]*clip-path: inset\(50%\);/);
});

test('apartment case study uses the completed bathroom finish photo in the after gallery', () => {
  const afterImages = apartmentData.images.filter((image) => image.stage === 'after');
  const bathroomImage = afterImages.find((image) => image.src.includes('finished-bathroom-complete-fixtures.webp'));

  assert.ok(bathroomImage);
  assert.equal(bathroomImage.width, 1050);
  assert.equal(bathroomImage.height, 1400);
  assert.match(bathroomImage.alt, /new shower fixture/);
  assert.doesNotMatch(apartmentSource, /finished-bathroom-vanity-tub\.webp/);
});

test('old apartment draft preview redirects to the canonical case study', () => {
  assert.match(
    redirectsSource,
    /^\/previews\/one-bedroom-renovation-draft\/\s+\/case-studies\/one-bedroom-apartment-turnover-nyc\/\s+301$/m,
  );
  assert.match(
    redirectsSource,
    /^\/previews\/one-bedroom-renovation-draft\s+\/case-studies\/one-bedroom-apartment-turnover-nyc\/\s+301$/m,
  );
});
