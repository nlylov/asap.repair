#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { readdirSync, statSync } from 'node:fs';

const root = process.cwd();

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
let reviewMicrodataBlocks = 0;
let reviewItempropBlocks = 0;

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

  const reviewMicrodataMatches = html.match(/itemtype=["']https?:\/\/schema\.org\/Review["']/g);
  const reviewItempropMatches = html.match(/itemprop=["'](?:reviewBody|reviewRating|ratingValue|bestRating|worstRating|author|datePublished)["']/g);

  if (reviewMicrodataMatches) {
    reviewMicrodataBlocks += reviewMicrodataMatches.length;
    errors.push(`${rel}: found ${reviewMicrodataMatches.length} schema.org/Review microdata block(s). Keep customer reviews visible in HTML, but do not mark them up as self-serving reviews.`);
  }

  if (rel === 'reviews/index.html' && reviewItempropMatches) {
    reviewItempropBlocks += reviewItempropMatches.length;
    errors.push(`${rel}: found ${reviewItempropMatches.length} review/rating itemprop attribute(s). Keep the reviews page as plain visible HTML.`);
  }

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

  const aggregateRatingMatches = html.match(/"@type"\s*:\s*"AggregateRating"/g);
  if (aggregateRatingMatches) {
    aggregateBlocks += aggregateRatingMatches.length;
    errors.push(`${rel}: found ${aggregateRatingMatches.length} AggregateRating block(s). Keep business-owned ratings visible in HTML/AI facts, but do not publish self-serving review rich-result markup.`);
  }
}

if (reviewBlocks > 0) {
  errors.push(`Found ${reviewBlocks} individual Review JSON-LD blocks. Keep customer reviews visible in HTML, but do not publish self-serving Review structured data for this LocalBusiness site.`);
}

if (aggregateBlocks > 0) {
  errors.push(`Found ${aggregateBlocks} AggregateRating JSON-LD blocks. Keep review/rating claims out of schema.org markup for this business-owned LocalBusiness site.`);
}

if (reviewMicrodataBlocks > 0 || reviewItempropBlocks > 0) {
  errors.push(`Found self-serving review microdata (${reviewMicrodataBlocks} Review itemtype, ${reviewItempropBlocks} review itemprop). Remove review rich-result markup from business-owned review pages.`);
}

if (errors.length) {
  console.error(`Review schema validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Review schema validation OK: no individual Review JSON-LD, AggregateRating JSON-LD, or review microdata found.');
