#!/usr/bin/env node
/*
 * Give every category hub a calculator built out of its own leaf pages.
 *
 * Why: /services/plumbing/, /services/electrical/ and seven more hubs are real
 * landing pages — they rank, they take traffic, and they had no price anywhere
 * on them. A visitor who lands on the hub had to guess which leaf page to open
 * before seeing a single number.
 *
 * Every price here is COPIED from the leaf config that already owns it. Nothing
 * is invented and nothing is rounded: the hub shows the span between the
 * cheapest and dearest tier the leaf itself quotes for that job type, and the
 * leaf page is one click away for the exact tier. If a leaf price changes, this
 * regenerates from it.
 *
 * Writes assets/data/hub-calculators.json, which calculator.js merges at load.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const CALC = join(ROOT, 'components/modules/calculator.js');

/* The data section ends where the exported component begins. Evaluating only
   that part keeps this script independent of the browser runtime below it. */
function loadConfigs() {
  const src = readFileSync(CALC, 'utf8');
  const dataOnly = src.slice(0, src.indexOf('export default function calculator'));
  // eslint-disable-next-line no-eval
  return eval(`${dataOnly}\nCONFIGS`);
}

/* hub slug -> [leaf page slug, config key, label shown in the picker] */
const HUBS = {
  plumbing: [
    ['faucet-installation', 'faucet', 'Faucet installation'],
    ['toilet-installation', 'toilet', 'Toilet installation'],
    ['sink-installation', 'sink', 'Sink installation'],
    ['garbage-disposal-installation', 'garbage-disposal', 'Garbage disposal'],
    ['shut-off-valve-installation', 'shut-off-valve', 'Shut-off valve'],
    ['bathroom-fixture-installation', 'bathroom-fixture', 'Bathroom fixtures'],
    ['leak-repair', 'leak-repair', 'Visible leak repair'],
  ],
  electrical: [
    ['light-fixture-installation', 'light-fixture', 'Light fixture'],
    ['ceiling-fan-installation', 'ceiling-fan', 'Ceiling fan'],
    ['chandelier-installation', 'chandelier', 'Chandelier'],
    ['outlet-installation', 'outlet', 'Outlet replacement'],
    ['switch-installation', 'switch', 'Switch replacement'],
    ['usb-outlet-installation', 'usb-outlet', 'USB outlet'],
    ['smart-device-installation', 'smart-device', 'Smart device'],
    ['electrical-troubleshooting', 'electrical-troubleshooting', 'Troubleshooting'],
  ],
  'furniture-assembly': [
    ['ikea-assembly', 'ikea', 'IKEA furniture'],
    ['bed-assembly', 'beds', 'Bed frame'],
    ['wardrobe-assembly', 'wardrobes', 'Wardrobe'],
    ['desk-assembly', 'desk', 'Desk'],
    ['dresser-assembly', 'dresser', 'Dresser'],
  ],
  'tv-wall-mounting': [
    ['tv-mounting', 'tv', 'TV mounting'],
    ['shelf-installation', 'shelf', 'Shelves'],
    ['mirror-installation', 'mirror', 'Mirror'],
    ['art-installation', 'art', 'Art and frames'],
    ['projector-installation', 'projector', 'Projector'],
  ],
  painting: [
    ['interior-painting', 'interior-painting', 'Interior painting'],
    ['accent-wall-painting', 'accent-wall', 'Accent wall'],
    ['trim-painting', 'trim-painting', 'Trim and doors'],
    ['cabinet-painting', 'cabinet-painting', 'Cabinet painting'],
    ['wallpaper-installation', 'wallpaper-install', 'Wallpaper install'],
    ['wallpaper-removal', 'wallpaper-removal', 'Wallpaper removal'],
  ],
  'flooring-installation': [
    ['laminate-floor-installation', 'laminate-flooring', 'Laminate'],
    ['vinyl-floor-installation', 'vinyl-plank-flooring', 'Vinyl plank'],
    ['click-lock-floor-installation', 'click-lock-flooring', 'Click-lock'],
    ['peel-stick-floor-installation', 'peel-stick-flooring', 'Peel-and-stick'],
    ['baseboard-installation', 'baseboard-trim', 'Baseboard and trim'],
    ['subfloor-preparation', 'subfloor-prep', 'Subfloor prep'],
    ['floor-repair', 'floor-repair', 'Floor repair'],
  ],
  'ac-installation-cleaning': [
    ['window-ac-installation', 'ac-window', 'Window AC install'],
    ['ac-deep-cleaning', 'ac-cleaning', 'AC deep cleaning'],
    ['ac-bracket-installation', 'ac-bracket', 'AC bracket'],
    ['through-wall-ac-installation', 'ac-through-wall', 'Through-wall AC'],
    ['ptac-installation', 'ac-ptac', 'PTAC'],
    ['portable-ac-installation', 'ac-portable', 'Portable AC'],
    ['ac-removal', 'ac-removal', 'AC removal'],
  ],
  'general-repairs': [
    ['drywall-repair', 'drywall-repair', 'Drywall repair'],
    ['door-repair', 'door-repair', 'Door repair'],
    ['door-installation', 'door-installation', 'Door installation'],
    ['lock-installation', 'lock-installation', 'Lock installation'],
    ['blind-installation', 'blind-installation', 'Blinds'],
    ['cabinet-hardware-installation', 'cabinet-hardware', 'Cabinet hardware'],
    ['caulking', 'caulking', 'Caulking'],
    ['apartment-turnover', 'apartment-turnover', 'Apartment turnover'],
  ],
  'appliance-services': [
    ['dishwasher-installation', 'dishwasher', 'Dishwasher install'],
    ['washer-installation', 'washer', 'Washer install'],
    ['dryer-installation', 'dryer', 'Dryer install'],
    ['refrigerator-installation', 'refrigerator', 'Refrigerator install'],
    ['range-installation', 'range', 'Range install'],
    ['microwave-installation', 'microwave', 'Microwave install'],
    ['dryer-vent-cleaning', 'dryer-vent-cleaning', 'Dryer vent cleaning'],
  ],
};

const HUB_TITLES = {
  plumbing: 'Plumbing Fixture Estimate',
  electrical: 'Electrical Work Estimate',
  'furniture-assembly': 'Furniture Assembly Estimate',
  'tv-wall-mounting': 'Mounting Estimate',
  painting: 'Painting & Wall Finish Estimate',
  'flooring-installation': 'Flooring Estimate',
  'ac-installation-cleaning': 'AC Work Estimate',
  'general-repairs': 'General Repair Estimate',
  'appliance-services': 'Appliance Work Estimate',
};

/* Span of every tier a leaf quotes for one job type, e.g. faucet/kitchen covers
   the straight swap through the seized-valve job: [cheapest low, dearest high]. */
function span(tiers) {
  const lows = [];
  const highs = [];
  for (const pair of Object.values(tiers)) {
    if (!Array.isArray(pair) || pair.length !== 2) continue;
    lows.push(pair[0]);
    highs.push(pair[1]);
  }
  return lows.length ? [Math.min(...lows), Math.max(...highs)] : null;
}

/* Exported so scripts/generate-calculator-prices.mjs can rebuild the hubs from the price
   table it just wrote, in memory, without a second pass over the file system. Both callers
   must produce the same bytes or the byte-identity gate in tests/ fails. */
export function buildHubCalculators(CONFIGS) {
const out = {};
const skipped = [];

for (const [hub, leaves] of Object.entries(HUBS)) {
  const services = [];
  const optionSets = {};
  const pricing = {};

  for (const [slug, key, label] of leaves) {
    const leaf = CONFIGS[key];
    if (!leaf || leaf.mode === 'visit' || !leaf.pricing) {
      skipped.push(`${hub}/${key}`);
      continue;
    }
    const jobs = [];
    const prices = {};
    for (const [jobKey, tiers] of Object.entries(leaf.pricing)) {
      /* A job type whose every step is the $99 on-site assessment is a ROUTE, not a price:
         "chandelier over 50 lb" and "the breaker trips repeatedly" are things we come out and
         look at, and the leaf page says so in its own words. Spanning them here produced a
         "$99 – $99" cell on the electrical hub — the assessment fee rendered as the price of
         the work, which is the exact mistake the $99/$150 split exists to prevent. The visitor
         still reaches them: the hub links to the leaf page. */
      if (Object.values(tiers).every((pair) => Array.isArray(pair) && pair[0] === 99 && pair[1] === 99)) continue;
      const range = span(tiers);
      if (!range) continue;
      const jobLabel = leaf.categories?.[0]?.options?.find((o) => o.value === jobKey)?.label;
      jobs.push({ value: jobKey, label: jobLabel || jobKey });
      prices[jobKey] = range;
    }
    if (!jobs.length) {
      skipped.push(`${hub}/${key}`);
      continue;
    }
    services.push({ value: key, label, slug });
    optionSets[key] = [{ value: '', label: 'Choose the job…' }, ...jobs];
    pricing[key] = prices;
  }

  out[`hub-${hub}`] = {
    title: HUB_TITLES[hub],
    subtitle: 'Pick the job to see the range we quote for it, then open that page for the exact tiers.',
    categories: [
      {
        label: 'What do you need?',
        id: 'series',
        options: [{ value: '', label: 'Choose a service…' }, ...services.map(({ value, label }) => ({ value, label }))],
      },
      { label: 'Which job?', id: 'size', dependsOn: 'series', optionSets },
    ],
    pricing,
    cta: { text: 'Get My Free Estimate', href: '/#contact' },
    disclaimer:
      'These are the same ranges quoted on each service page, shown here end to end: the low figure is the simplest version of that job and the high figure the most involved one we quote without an on-site look. Labor only — fixtures, parts and materials are supplied by you or picked up at cost, and NYC sales tax is added separately where it applies. Open the service page for the exact tier that matches your job. Photo and text estimates are free; an on-site assessment is $99 and is credited toward the work.',
    placeholder: 'Pick a service and job to see your range',
  };
}

  /* Non-enumerable so it never lands in the serialized JSON, and so Object.values(out)
     below still counts hubs and nothing else. */
  Object.defineProperty(out, '__skipped', { enumerable: false, value: skipped });
  return out;
}

function main() {
  const out = buildHubCalculators(loadConfigs());
  const skipped = out.__skipped || [];
  const dest = join(ROOT, 'assets/data/hub-calculators.json');
  writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`);
  const total = Object.values(out).reduce((n, c) => n + c.categories[0].options.length - 1, 0);
  console.log(
    `Hub calculators: ${Object.keys(out).length} hubs, ${total} services wired from their own leaf prices` +
      (skipped.length ? `, ${skipped.length} leaf config(s) skipped (no price grid): ${skipped.join(', ')}` : ''),
  );
}

if (import.meta.url === `file://${process.argv[1]}`) main();
