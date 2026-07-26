#!/usr/bin/env node
/*
 * Give every service page its own social share card.
 *
 * Why: 85 service pages shared one generic og-image.png, so every link
 * pasted into iMessage, WhatsApp, Slack or Facebook looked identical and
 * said nothing about the service. Pages that have real job photos should
 * lead with one.
 *
 * What it does: for each page with a gallery, takes the first gallery photo,
 * renders a 1200x630 card (photo fills the frame, dark gradient at the
 * bottom, service name + brand line), writes it to assets/og/<slug>.webp and
 * points og:image / twitter:image at it. Idempotent — re-running regenerates
 * the same cards.
 *
 * Requires Pillow. NOTE: on this machine only /usr/bin/python3 has PIL
 * (homebrew python does not, and pip is PEP-668 locked), so the helper is
 * invoked with that interpreter explicitly.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OG_DIR = join(ROOT, 'assets/og');
mkdirSync(OG_DIR, { recursive: true });

const files = execFileSync('git', ['ls-files', 'services/*/*/index.html'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

const PY = '/usr/bin/python3';
const RENDER = `
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
src, out, title = sys.argv[1], sys.argv[2], sys.argv[3]
W, H = 1200, 630
im = Image.open(src).convert('RGB')
# cover-crop to 1200x630
scale = max(W / im.width, H / im.height)
im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
left, top = (im.width - W) // 2, (im.height - H) // 2
card = im.crop((left, top, left + W, top + H))
# bottom scrim so text stays readable on any photo
scrim = Image.new('L', (1, H), 0)
for y in range(H):
    t = max(0.0, (y - H * 0.45) / (H * 0.55))
    scrim.putpixel((0, y), int(235 * (t ** 1.35)))
scrim = scrim.resize((W, H))
card = Image.composite(Image.new('RGB', (W, H), (8, 13, 26)), card, scrim)
dr = ImageDraw.Draw(card)
def font(sz, bold=True):
    for p in ('/System/Library/Fonts/Supplemental/Arial Bold.ttf' if bold else '/System/Library/Fonts/Supplemental/Arial.ttf',
              '/System/Library/Fonts/Helvetica.ttc'):
        try: return ImageFont.truetype(p, sz)
        except Exception: pass
    return ImageFont.load_default()
# wrap title to at most 2 lines
f_title, f_brand = font(60), font(30, False)
words, lines, cur = title.split(), [], ''
for w in words:
    probe = (cur + ' ' + w).strip()
    if dr.textlength(probe, font=f_title) <= W - 120: cur = probe
    else:
        lines.append(cur); cur = w
        if len(lines) == 2: break
if cur and len(lines) < 2: lines.append(cur)
y = H - 80 - 70 * len(lines)
for ln in lines:
    dr.text((60, y), ln, font=f_title, fill=(255, 255, 255)); y += 70
dr.text((60, H - 62), 'Repair ASAP  ·  NYC  ·  4.9 stars, 73 reviews', font=f_brand, fill=(201, 168, 76))
card.save(out, 'WEBP', quality=86, method=6)
`;

let made = 0;
let skipped = 0;
for (const rel of files) {
  const path = join(ROOT, rel);
  const html = readFileSync(path, 'utf8');
  const photo = html.match(/data-full="(\/assets\/photo\/[^"]+)"/);
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (!photo || !h1) { skipped++; continue; }

  const slug = rel.split('/').slice(-2)[0];
  const outRel = `assets/og/${slug}.webp`;
  const title = h1[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  execFileSync(PY, ['-c', RENDER, join(ROOT, photo[1].slice(1)), join(ROOT, outRel), title]);

  const url = `https://asap.repair/${outRel}`;
  let next = html
    .replace(/(<meta property="og:image" content=")[^"]+(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]+(")/, `$1${url}$2`)
    .replace(/(<meta property="og:image:alt" content=")[^"]+(")/, `$1${title} — Repair ASAP NYC$2`);
  if (next !== html) { writeFileSync(path, next); made++; }
}
console.log(`OG cards: ${made} pages given their own card, ${skipped} left on the default (no gallery photo).`);
if (!existsSync(join(OG_DIR, '.gitkeep'))) writeFileSync(join(OG_DIR, '.gitkeep'), '');
