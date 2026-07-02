import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

const htmlFiles = globSync('**/*.html', {
  exclude: ['node_modules/**', 'tmp/**'],
});

const errors = [];
let jsonLdBlocks = 0;
let articleBlocks = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const matches = html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);

  for (const match of matches) {
    jsonLdBlocks += 1;
    let parsed;
    try {
      parsed = JSON.parse(match[1].trim());
    } catch (error) {
      errors.push(`${file}: invalid JSON-LD (${error.message})`);
      continue;
    }

    const nodes = Array.isArray(parsed) ? parsed : [parsed];
    for (const node of nodes) {
      if (!node || node['@type'] !== 'Article') {
        continue;
      }

      articleBlocks += 1;
      const coverage = node.spatialCoverage;
      if (coverage && (typeof coverage !== 'object' || coverage['@type'] !== 'Place' || !coverage.name)) {
        errors.push(`${file}: Article.spatialCoverage must be a Place object with a name`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`Structured data validation failed (${errors.length}):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Structured data validation OK: ${jsonLdBlocks} JSON-LD blocks, ${articleBlocks} Article blocks.`);
