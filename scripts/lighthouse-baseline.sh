#!/usr/bin/env bash
set -euo pipefail

# Repair ASAP Lighthouse baseline runner.
# Requires the Lighthouse CLI to already be installed and available on PATH.
# This script intentionally does not install packages. If `lighthouse` is missing,
# install it separately only after package-install approval.

if ! command -v lighthouse >/dev/null 2>&1; then
  echo "ERROR: lighthouse CLI is not installed on PATH." >&2
  echo "Install/use Lighthouse only after package-install approval, or run PageSpeed UI manually." >&2
  exit 127
fi

OUT_DIR="${1:-reports/lighthouse/$(date +%Y%m%d-%H%M%S)}"
mkdir -p "$OUT_DIR"

URLS=(
  "https://asap.repair/"
  "https://asap.repair/services/"
  "https://asap.repair/services/tv-wall-mounting/"
  "https://asap.repair/services/furniture-assembly/"
  "https://asap.repair/services/plumbing/"
  "https://asap.repair/services/electrical/"
  "https://asap.repair/services/appliance-services/"
)

sanitize_url() {
  printf '%s' "$1" | sed -E 's#^https?://##; s#[^A-Za-z0-9._-]+#-#g; s#-$##'
}

for url in "${URLS[@]}"; do
  slug="$(sanitize_url "$url")"
  echo "==> Lighthouse desktop: $url"
  lighthouse "$url" \
    --preset=desktop \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=json \
    --output=html \
    --output-path="$OUT_DIR/${slug}-desktop" \
    --chrome-flags="--headless=new --no-sandbox" \
    --quiet

  echo "==> Lighthouse mobile: $url"
  lighthouse "$url" \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=json \
    --output=html \
    --output-path="$OUT_DIR/${slug}-mobile" \
    --chrome-flags="--headless=new --no-sandbox" \
    --quiet

done

node - "$OUT_DIR" <<'NODE'
const fs = require('fs');
const path = require('path');
const outDir = process.argv[2];
const rows = [];
for (const file of fs.readdirSync(outDir).filter((f) => f.endsWith('.report.json'))) {
  const full = path.join(outDir, file);
  const data = JSON.parse(fs.readFileSync(full, 'utf8'));
  const cats = data.categories || {};
  const audits = data.audits || {};
  rows.push({
    file,
    url: data.finalDisplayedUrl || data.finalUrl,
    performance: Math.round((cats.performance?.score ?? 0) * 100),
    accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
    seo: Math.round((cats.seo?.score ?? 0) * 100),
    fcp: audits['first-contentful-paint']?.displayValue || '',
    lcp: audits['largest-contentful-paint']?.displayValue || '',
    tbt: audits['total-blocking-time']?.displayValue || '',
    cls: audits['cumulative-layout-shift']?.displayValue || '',
  });
}
rows.sort((a, b) => a.file.localeCompare(b.file));
const summaryPath = path.join(outDir, 'summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(rows, null, 2));
console.log(JSON.stringify(rows, null, 2));
console.log(`Summary written to ${summaryPath}`);
NODE

echo "Reports written to $OUT_DIR"
