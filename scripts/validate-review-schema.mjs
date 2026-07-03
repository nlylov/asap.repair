#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { readdirSync, statSync } from 'node:fs';

const root = process.cwd();
const EXPECTED_AGGREGATE_REVIEW_COUNT = '73';
const EXPECTED_AGGREGATE_RATING = '4.9';

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === '.git' || entry === 'node_modules') continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else if (entry.endsWith('.html')) yield full;
  }
}

const errors = [];
let aggregateBlocks = 0;
let reviewBlocks = 0;

function collectJsonLd(html) {
  const matches = html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  return [...matches].map((match) => match[1].trim());
}

function walkJsonLd(node, visitor) {
  if (!node || typeof node !== 'object') return;
  visitor(node);

  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const item of value) walkJsonLd(item, visitor);
    } else if (value && typeof value === 'object') {
      walkJsonLd(value, visitor);
    }
  }
}

for (const file of walk(root)) {
  const html = readFileSync(file, 'utf8');
  const rel = relative(root, file);

  for (const block of collectJsonLd(html)) {
    let parsed;
    try {
      parsed = JSON.parse(block);
    } catch {
      continue;
    }

    const nodes = Array.isArray(parsed) ? parsed : [parsed];
    for (const node of nodes) {
      walkJsonLd(node, (child) => {
        const types = Array.isArray(child['@type']) ? child['@type'] : [child['@type']];
        if (types.includes('Review')) reviewBlocks += 1;
      });
    }
  }

  if (!html.includes('AggregateRating')) continue;

  const reviewCounts = [...html.matchAll(/"reviewCount"\s*:\s*"?([0-9]+)/g)].map((m) => m[1]);
  const aggregateRatingMatch = html.match(/"@type"\s*:\s*"AggregateRating"[\s\S]*?"ratingValue"\s*:\s*"?([0-9.]+)/);
  const aggregateReviewCountMatch = html.match(/"@type"\s*:\s*"AggregateRating"[\s\S]*?"reviewCount"\s*:\s*"?([0-9]+)/);

  if (aggregateReviewCountMatch) {
    aggregateBlocks += 1;
    if (aggregateReviewCountMatch[1] !== EXPECTED_AGGREGATE_REVIEW_COUNT) {
      errors.push(`${rel}: AggregateRating reviewCount=${aggregateReviewCountMatch[1]} expected ${EXPECTED_AGGREGATE_REVIEW_COUNT}`);
    }
  } else if (reviewCounts.length) {
    errors.push(`${rel}: found reviewCount fields but no AggregateRating reviewCount match`);
  }

  if (aggregateRatingMatch && aggregateRatingMatch[1] !== EXPECTED_AGGREGATE_RATING) {
    errors.push(`${rel}: AggregateRating ratingValue=${aggregateRatingMatch[1]} expected ${EXPECTED_AGGREGATE_RATING}`);
  }
}

if (aggregateBlocks === 0) {
  errors.push('No AggregateRating blocks found. Validator likely ran in the wrong directory.');
}

if (reviewBlocks > 0) {
  errors.push(`Found ${reviewBlocks} individual Review JSON-LD blocks. Keep customer reviews visible in HTML, but do not publish self-serving Review structured data for this LocalBusiness site.`);
}

if (errors.length) {
  console.error(`Review schema validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Review schema validation OK: ${aggregateBlocks} AggregateRating blocks use reviewCount=${EXPECTED_AGGREGATE_REVIEW_COUNT}, ratingValue=${EXPECTED_AGGREGATE_RATING}.`);
