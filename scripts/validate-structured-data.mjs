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

    /* HTML MARKUP INSIDE A JSON STRING, CHECKED BEFORE PARSING.
       floor-repair shipped a `<span data-price-src="const.repairMinimum">$150</span>` marker inside
       a FAQPage answer; its double quotes closed the JSON string and the block stopped parsing, so
       the parse check below caught it. That was luck. The SAME mistake written with single-quoted
       attributes — `<span data-price-src='…'>` — is perfectly legal JSON and would have sailed
       through, publishing raw markup as the answer text to every crawler that reads it.
       scripts/generate-calculator-prices.mjs refuses this too, but only for the handful of files
       that generator writes; most pages on this site are written by other generators, and this is
       the check that covers all of them. */
    if (/<[a-zA-Z/!]/.test(match[1])) {
      errors.push(`${file}: HTML markup inside JSON-LD (a price marker or tag in a JSON string — structured data must be plain text)`);
      continue;
    }

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
