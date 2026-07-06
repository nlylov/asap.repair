#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const sitemap = readFileSync('sitemap.xml', 'utf8');
const llms = readFileSync('llms.txt', 'utf8');
const llmsFull = readFileSync('llms-full.txt', 'utf8');

const optionalAiGuidePaths = new Set([
  '/privacy-policy/',
  '/terms-of-service/',
]);

const urls = [...sitemap.matchAll(/<loc>https:\/\/asap\.repair([^<]+)<\/loc>/g)]
  .map((match) => match[1]);

if (urls.length === 0) {
  throw new Error('No https://asap.repair URLs found in sitemap.xml');
}

const errors = [];

for (const path of urls) {
  if (optionalAiGuidePaths.has(path)) {
    continue;
  }

  const absoluteUrl = `https://asap.repair${path}`;
  if (!llms.includes(absoluteUrl)) {
    errors.push(`llms.txt missing ${absoluteUrl}`);
  }
  if (!llmsFull.includes(absoluteUrl)) {
    errors.push(`llms-full.txt missing ${absoluteUrl}`);
  }
}

if (errors.length > 0) {
  console.error(`AI guide coverage validation failed (${errors.length}):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`AI guide coverage validation OK: ${urls.length} sitemap URLs checked, ${optionalAiGuidePaths.size} legal/privacy URLs intentionally optional.`);
