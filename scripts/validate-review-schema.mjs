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

for (const file of walk(root)) {
  const html = readFileSync(file, 'utf8');
  if (!html.includes('AggregateRating')) continue;

  const rel = relative(root, file);
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

if (errors.length) {
  console.error(`Review schema validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Review schema validation OK: ${aggregateBlocks} AggregateRating blocks use reviewCount=${EXPECTED_AGGREGATE_REVIEW_COUNT}, ratingValue=${EXPECTED_AGGREGATE_RATING}.`);
