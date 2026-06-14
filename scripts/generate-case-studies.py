#!/usr/bin/env python3
"""Generate static Repair ASAP case-study pages from _data/case-studies.json.

This keeps the marketing site static while making project pages, index cards,
JSON data, and sitemap entries reproducible as Nikita adds more completed jobs.
"""

from __future__ import annotations

import html
import json
import re
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "_data" / "case-studies.json"
PUBLIC_DATA_PATH = ROOT / "assets" / "data" / "case-studies.json"
CASE_DIR = ROOT / "case-studies"
SITE = "https://asap.repair"
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
LOCAL_URL_RE = re.compile(r"^/[A-Za-z0-9/_#?=&.%+-]*$")


def validate_local_url(value: str, field: str, slug: str) -> None:
    if not value.startswith("/"):
        raise SystemExit(f"{field} for {slug} must be a same-origin path: {value}")
    if not LOCAL_URL_RE.match(value):
        raise SystemExit(f"Unsafe {field} for {slug}: {value}")
    if ".." in value:
        raise SystemExit(f"Path traversal in {field} for {slug}: {value}")


def e(value: object) -> str:
    return html.escape(str(value or ""), quote=True)


def json_ld(data: object) -> str:
    return json.dumps(data, ensure_ascii=False, separators=(",", ":"))


def absolute(path: str) -> str:
    if path.startswith("http"):
        return path
    return f"{SITE}{path}"


def clean_text(text: str) -> str:
    return "\n".join(line.rstrip() for line in text.splitlines()) + "\n"


def load_studies() -> list[dict]:
    studies = json.loads(DATA_PATH.read_text())
    published = [s for s in studies if s.get("status") == "published"]
    slugs = [s["slug"] for s in published]
    duplicates = sorted({slug for slug in slugs if slugs.count(slug) > 1})
    if duplicates:
        raise SystemExit(f"Duplicate case-study slugs: {duplicates}")
    for study in published:
        slug = study["slug"]
        if not SLUG_RE.match(slug):
            raise SystemExit(f"Invalid case-study slug: {slug}")
        out_dir = (CASE_DIR / slug).resolve()
        if not str(out_dir).startswith(str(CASE_DIR.resolve()) + "/"):
            raise SystemExit(f"Unsafe output path for slug: {slug}")
        for field in ["slug", "title", "description", "excerpt", "thumbnail", "heroImage"]:
            if not study.get(field):
                raise SystemExit(f"Missing {field} for {study.get('slug')}")
        for image_field in ["thumbnail", "heroImage", "ogImage"]:
            path = study.get(image_field)
            if path:
                validate_local_url(path, image_field, slug)
            if path and path.startswith("/") and not (ROOT / path.lstrip("/")).exists():
                raise SystemExit(f"Missing image {path} for {study['slug']}")
        for service in study.get("relatedServices", []):
            url = service.get("url", "")
            validate_local_url(url, "relatedServices.url", slug)
            local = ROOT / url.lstrip("/")
            if url.endswith("/"):
                local = local / "index.html"
            if not local.exists():
                raise SystemExit(f"Missing related service URL {url} for {slug}")
        for img in study.get("images", []):
            src = img.get("src", "")
            validate_local_url(src, "images.src", slug)
            if src.startswith("/") and not (ROOT / src.lstrip("/")).exists():
                raise SystemExit(f"Missing gallery image {src} for {study['slug']}")
    return published


def render_head(study: dict) -> str:
    url = f"{SITE}/case-studies/{study['slug']}/"
    schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": study["title"],
        "description": study["description"],
        "image": absolute(study.get("ogImage") or study["heroImage"]),
        "author": {"@type": "Organization", "name": "Repair Asap LLC"},
        "publisher": {"@type": "Organization", "name": "Repair Asap LLC", "url": SITE},
        "datePublished": study.get("datePublished"),
        "dateModified": study.get("dateModified"),
        "mainEntityOfPage": {"@type": "WebPage", "@id": url},
        "about": study.get("tags", [])[:8],
        "spatialCoverage": study.get("locationShort") or study.get("borough"),
    }
    breadcrumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": "Case Studies", "item": SITE + "/case-studies/"},
            {"@type": "ListItem", "position": 3, "name": study["title"], "item": url},
        ],
    }
    faqs = study.get("content", {}).get("faqs") or []
    faq_script = ""
    if faqs:
        faq_schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": f["q"],
                    "acceptedAnswer": {"@type": "Answer", "text": f["a"]},
                }
                for f in faqs
            ],
        }
        faq_script = f'\n  <script type="application/ld+json">{json_ld(faq_schema)}</script>'
    return f"""  <meta charset=\"UTF-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
  <title>{e(study.get('seoTitle') or study['title'])}</title>
  <meta name=\"description\" content=\"{e(study['description'])}\">
  <link rel=\"canonical\" href=\"{url}\">
  <meta property=\"og:title\" content=\"{e(study.get('seoTitle') or study['title'])}\">
  <meta property=\"og:description\" content=\"{e(study['description'])}\">
  <meta property=\"og:type\" content=\"article\">
  <meta property=\"og:url\" content=\"{url}\">
  <meta property=\"og:image\" content=\"{absolute(study.get('ogImage') or study['heroImage'])}\">
  <meta property=\"og:image:alt\" content=\"{e(study['title'])}\">
  <meta name=\"twitter:card\" content=\"summary_large_image\">
  <meta name=\"twitter:image\" content=\"{absolute(study.get('ogImage') or study['heroImage'])}\">
  <meta name=\"theme-color\" content=\"#0a0f1c\">
  <meta name=\"robots\" content=\"index, follow\">
  <link rel=\"icon\" type=\"image/x-icon\" href=\"/assets/favicons/favicon.ico\">
  <link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"/assets/favicons/favicon-32x32.png\">
  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">
  <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>
  <link href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap\" rel=\"stylesheet\" media=\"print\" onload=\"this.media='all'\">
  <noscript><link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap\"></noscript>
  <link rel=\"stylesheet\" href=\"/styles.css\">
  <link rel="stylesheet" href="/case-studies/case-studies.css?v=20260614-faq-contrast">
  <script type=\"application/ld+json\">{json_ld(schema)}</script>
  <script type=\"application/ld+json\">{json_ld(breadcrumbs)}</script>{faq_script}"""


def render_image(img: dict, cls: str = "project-gallery__image") -> str:
    return (
        f'<figure class="project-gallery__item project-gallery__item--{e(img.get("stage", "photo"))}">'
        f'<img class="{cls}" src="{e(img["src"])}" alt="{e(img.get("alt") or img.get("caption"))}" '
        f'loading="lazy" width="{e(img.get("width", 1200))}" height="{e(img.get("height", 900))}">'
        f'<figcaption>{e(img.get("caption"))}</figcaption>'
        f'</figure>'
    )


def section_gallery(study: dict, stage: str, title: str, subtitle: str) -> str:
    images = [img for img in study.get("images", []) if img.get("stage") == stage]
    if not images:
        return ""
    return f"""
  <section class=\"project-section project-section--gallery\">
    <div class=\"container\">
      <div class=\"section-header section-header--left\">
        <span class=\"project-eyebrow\">{e(stage.title())}</span>
        <h2 class=\"section-title\">{e(title)}</h2>
        <p class=\"section-subtitle\">{e(subtitle)}</p>
      </div>
      <div class=\"project-gallery\">
        {''.join(render_image(img) for img in images)}
      </div>
    </div>
  </section>"""


def paragraph_html(paragraphs: list[str]) -> str:
    return "\n          ".join(f"<p>{e(paragraph)}</p>" for paragraph in paragraphs if paragraph)


def render_optional_focus_section(study: dict, content: dict) -> str:
    if content.get("hideFocusSection"):
        return ""
    eyebrow = content.get("focusEyebrow", "Custom finish")
    title = content.get("focusTitle", "Wood slat partition with integrated lighting")
    paragraphs = content.get("focusParagraphs") or [
        "A drywall partition was built to separate the dining/break area from the main customer space, then finished with vertical wood slat panels and integrated accent lighting.",
        "This detail gave the barbershop a warmer, more premium look while keeping the space practical for day-to-day commercial use.",
    ]
    split = max(1, len(paragraphs) // 2)
    left_paragraphs = paragraph_html(paragraphs[:split])
    right_paragraphs = paragraph_html(paragraphs[split:])
    return f"""<section class=\"project-section\">
      <div class=\"container project-two-col\">
        <div>
          <span class=\"project-eyebrow\">{e(eyebrow)}</span>
          <h2>{e(title)}</h2>
          {left_paragraphs}
        </div>
        <div>
          {right_paragraphs}
        </div>
      </div>
    </section>"""


def render_faq(study: dict) -> str:
    content = study.get("content", {})
    faqs = content.get("faqs") or []
    if not faqs:
        return ""
    items = "".join(
        f'<details class="project-faq__item"><summary>{e(f["q"])}</summary><div class="project-faq__answer"><p>{e(f["a"])}</p></div></details>'
        for f in faqs
    )
    return f"""<section class=\"project-section project-section--faq\">
      <div class=\"container\">
        <div class=\"section-header section-header--left\">
          <span class=\"project-eyebrow\">FAQ</span>
          <h2 class=\"section-title\">{e(content.get('faqTitle', 'Frequently asked questions'))}</h2>
        </div>
        <div class=\"project-faq\">{items}</div>
      </div>
    </section>"""


def render_detail(study: dict) -> str:
    hero_img = study["heroImage"]
    content = study.get("content", {})
    scope_items = "".join(f"<li>{e(item)}</li>" for item in study.get("scope", []))
    service_links = "".join(
        f'<a class="project-service-link" href="{e(s["url"])}">{e(s["title"])}<span>→</span></a>'
        for s in study.get("relatedServices", [])
    )
    tags = "".join(f"<span>{e(tag)}</span>" for tag in study.get("tags", [])[:10])
    starting_paragraphs = content.get("startingParagraphs") or [
        study["challenge"],
        "The restroom was only roughed in with plumbing and drain lines. The main room had old drywall, visible damage, and uneven surfaces left by previous tenants.",
    ]
    process_paragraphs = content.get("processParagraphs") or [
        study["solution"],
        "The work was completed on a tight commercial schedule. Most of the build-out was handled solo, with helpers brought in for grout and finish-support days.",
        "Durable finishes were prioritized: porcelain tile flooring, restroom tile, subway tile in the customer area, repaired ceilings, and practical access for future maintenance.",
    ]
    process_split = max(1, len(process_paragraphs) // 2)
    faq_section = render_faq(study)
    faq_block = f"\n\n    {faq_section}" if faq_section else ""
    return f"""<!DOCTYPE html>
<html lang=\"en\">
<head>
  <script async src=\"https://www.googletagmanager.com/gtag/js?id=G-1ZRVGCMZ43\"></script>
  <script type=\"text/javascript\">(function(c,l,a,r,i,t,y){{c[a]=c[a]||function(){{(c[a].q=c[a].q||[]).push(arguments)}};t=l.createElement(r);t.async=1;t.src=\"https://www.clarity.ms/tag/\"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);}})(window, document, \"clarity\", \"script\", \"wyzjzrud6n\");</script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-1ZRVGCMZ43');</script>
{render_head(study)}
</head>
<body>
  <div id=\"site-header\"></div>
  <main>
    <section class=\"project-hero\">
      <div class=\"container project-hero__grid\">
        <div class=\"project-hero__copy\">
          <nav class=\"project-breadcrumb\" aria-label=\"Breadcrumb\"><a href=\"/\">Home</a><span>/</span><a href=\"/case-studies/\">Case Studies</a></nav>
          <span class=\"project-eyebrow\">{e(study.get('projectType'))} · {e(study.get('borough'))}</span>
          <h1>{e(study['title'])}</h1>
          <p class=\"project-hero__lede\">{e(study['excerpt'])}</p>
          <div class=\"project-tags\">{tags}</div>
          <div class=\"project-hero__actions\">
            <button class=\"btn btn--accent btn--lg\" data-open-quote>{e(content.get('heroCtaText', 'Request a Commercial Renovation Quote'))}</button>
            <a class=\"btn btn--secondary btn--lg\" href=\"/case-studies/\">View More Projects</a>
          </div>
        </div>
        <figure class=\"project-hero__image\">
          <img src=\"{e(hero_img)}\" alt=\"{e(study['title'])}\" width=\"{e(study.get('heroWidth', 1600))}\" height=\"{e(study.get('heroHeight', 1200))}\" fetchpriority=\"high\">
          <figcaption>{e(study.get('location'))}</figcaption>
        </figure>
      </div>
    </section>

    <section class=\"project-snapshot\">
      <div class=\"container project-snapshot__grid\">
        <div><span>Client</span><strong>{e(study.get('client'))}</strong></div>
        <div><span>Location</span><strong>{e(study.get('locationShort'))}</strong></div>
        <div><span>Property type</span><strong>{e(study.get('industry'))}</strong></div>
        <div><span>{e(content.get('dateLabel', 'Completed'))}</span><strong>{e(study.get('dateRange'))}</strong></div>
      </div>
    </section>

    <section class=\"project-section\">
      <div class=\"container project-two-col\">
        <div>
          <span class=\"project-eyebrow\">{e(content.get('startingEyebrow', 'Starting condition'))}</span>
          <h2>{e(content.get('startingTitle', 'From damaged shell space to customer-ready barbershop'))}</h2>
          {paragraph_html(starting_paragraphs)}
        </div>
        <div class=\"project-scope-card\">
          <h3>Scope of work</h3>
          <ul>{scope_items}</ul>
        </div>
      </div>
    </section>

    {section_gallery(study, 'before', content.get('beforeTitle', 'Before: unfinished and damaged areas'), content.get('beforeSubtitle', 'The project started with damaged drywall, exposed rough-ins, missing ceiling sections, and uneven wall surfaces.'))}

    <section class=\"project-section project-section--dark\">
      <div class=\"container project-two-col\">
        <div>
          <span class=\"project-eyebrow\">{e(content.get('processEyebrow', 'Build-out process'))}</span>
          <h2>{e(content.get('processTitle', 'Drywall, ceiling repair, tile, painting, and lighting'))}</h2>
          {paragraph_html(process_paragraphs[:process_split])}
        </div>
        <div>
          {paragraph_html(process_paragraphs[process_split:])}
        </div>
      </div>
    </section>

    {section_gallery(study, 'process', content.get('processGalleryTitle', 'Process: drywall, tile, and surface preparation'), content.get('processGallerySubtitle', 'Selected progress photos show the transformation from rough construction to durable commercial finishes.'))}

    {render_optional_focus_section(study, content)}

    {section_gallery(study, 'detail', content.get('detailTitle', 'Details: custom feature wall and finish work'), content.get('detailSubtitle', 'Feature-wall and finish details that helped turn the space into a branded customer-facing interior.'))}
    {section_gallery(study, 'after', content.get('afterTitle', 'After: finished Manhattan barbershop interior'), content.get('afterSubtitle', 'Final photos after painting, lighting, tile, shelving, artwork, and cleanup.'))}

    <section class=\"project-section project-section--services\">
      <div class=\"container\">
        <div class=\"section-header\">
          <span class=\"project-eyebrow\">Related services</span>
          <h2 class=\"section-title\">{e(content.get('servicesTitle', 'Need similar work in NYC?'))}</h2>
          <p class=\"section-subtitle\">{e(content.get('servicesSubtitle', 'This project connects to several Repair ASAP service areas.'))}</p>
        </div>
        <div class=\"project-service-grid\">{service_links}</div>
      </div>
    </section>{faq_block}

    <section class=\"project-cta\">
      <div class=\"container\">
        <h2>{e(content.get('ctaTitle', 'Planning a commercial renovation or restroom build-out?'))}</h2>
        <p>{e(content.get('ctaText', 'Send photos, describe the scope, and Repair ASAP will help plan the next step.'))}</p>
        <button class=\"btn btn--accent btn--lg\" data-open-quote>Get a Free Quote</button>
      </div>
    </section>
  </main>
  <div id=\"site-footer\"></div>
  <script src=\"/components/loader.js\" defer></script>
  <script src=\"/main.js\" defer></script>
</body>
</html>
"""


def card(study: dict) -> str:
    return f"""<a class=\"cs-card reveal\" href=\"/case-studies/{e(study['slug'])}/\">
          <div class=\"cs-card__photo\"><img src=\"{e(study['thumbnail'])}\" alt=\"{e(study['title'])}\" loading=\"lazy\" width=\"600\" height=\"400\"></div>
          <div class=\"cs-card__body\">
            <div class=\"cs-card__meta\"><span class=\"cs-card__tag\">{e(study.get('projectType','Case Study'))}</span><span class=\"cs-card__location\">📍 {e(study.get('locationShort') or study.get('borough'))}</span></div>
            <h2 class=\"cs-card__title\">{e(study['title'])}</h2>
            <p class=\"cs-card__excerpt\">{e(study['excerpt'])}</p>
            <div class=\"cs-card__footer\"><span></span><span class=\"cs-card__link\">View project →</span></div>
          </div>
        </a>"""


def render_index(studies: list[dict]) -> str:
    items = [
        {"@type": "ListItem", "position": i + 1, "url": f"{SITE}/case-studies/{s['slug']}/", "name": s["title"]}
        for i, s in enumerate(studies)
    ]
    schema = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Case Studies — Repair Asap LLC", "url": f"{SITE}/case-studies/", "description": "Real before and after photos from completed Repair ASAP jobs across New York City.", "mainEntity": {"@type": "ItemList", "itemListElement": items}}
    cards = "\n        ".join(card(s) for s in studies)
    return f"""<!DOCTYPE html>
<html lang=\"en\">
<head>
  <script async src=\"https://www.googletagmanager.com/gtag/js?id=G-1ZRVGCMZ43\"></script>
  <script type=\"text/javascript\">(function(c,l,a,r,i,t,y){{c[a]=c[a]||function(){{(c[a].q=c[a].q||[]).push(arguments)}};t=l.createElement(r);t.async=1;t.src=\"https://www.clarity.ms/tag/\"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);}})(window, document, \"clarity\", \"script\", \"wyzjzrud6n\");</script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-1ZRVGCMZ43');</script>
  <meta charset=\"UTF-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
  <title>Case Studies — Real NYC Handyman & Renovation Projects | Repair Asap LLC</title>
  <meta name=\"description\" content=\"Real before and after photos from completed Repair ASAP jobs across New York City: commercial renovations, drywall, tile, painting, flooring, mounting, and repairs.\">
  <link rel=\"canonical\" href=\"https://asap.repair/case-studies/\">
  <meta property=\"og:title\" content=\"Case Studies — Real NYC Handyman & Renovation Projects\">
  <meta property=\"og:description\" content=\"Before and after photos from completed jobs across NYC. Real work, real results.\">
  <meta property=\"og:type\" content=\"website\">
  <meta property=\"og:url\" content=\"https://asap.repair/case-studies/\">
  <meta property=\"og:image\" content=\"https://asap.repair/assets/images/og-image.png\">
  <meta property=\"og:image:alt\" content=\"Repair Asap LLC case studies in New York City\">
  <meta name=\"twitter:card\" content=\"summary_large_image\">
  <meta name=\"twitter:image\" content=\"https://asap.repair/assets/images/og-image.png\">
  <meta name=\"theme-color\" content=\"#0a0f1c\">
  <meta name=\"robots\" content=\"index, follow\">
  <link rel=\"icon\" type=\"image/x-icon\" href=\"/assets/favicons/favicon.ico\">
  <link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"/assets/favicons/favicon-32x32.png\">
  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">
  <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>
  <link href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap\" rel=\"stylesheet\" media=\"print\" onload=\"this.media='all'\">
  <noscript><link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap\"></noscript>
  <link rel=\"stylesheet\" href=\"/styles.css\">
  <link rel="stylesheet" href="/case-studies/case-studies.css?v=20260614-faq-contrast">
  <script type=\"application/ld+json\">{json_ld(schema)}</script>
</head>
<body>
  <div id=\"site-header\"></div>
  <main>
    <section class=\"cs-hero\">
      <div class=\"container\">
        <div class=\"cs-hero__badge\">Real Work, Real Results</div>
        <h1 class=\"cs-hero__title\">Case Studies</h1>
        <p class=\"cs-hero__subtitle\">Before, process, and after photos from completed Repair ASAP jobs across New York City. Each project links back to the services used, so you can see proof before you book.</p>
      </div>
    </section>
    <section class=\"cs-strategy\">
      <div class=\"container cs-strategy__grid\">
        <div><strong>Canonical project pages</strong><span>One real job, one permanent URL — no thin photo dumps.</span></div>
        <div><strong>Service-linked proof</strong><span>Projects cross-link to drywall, tile, painting, flooring, electrical, plumbing, and repair pages.</span></div>
        <div><strong>NYC local trust</strong><span>Commercial and residential work organized by project type, borough, and scope.</span></div>
      </div>
    </section>
    <section class=\"cs-grid-section\">
      <div class=\"container\">
        <div class=\"section-header\">
          <h2 class=\"section-title reveal\">Completed Projects</h2>
          <p class=\"section-subtitle reveal\">Real transformations from the field</p>
        </div>
        <div id=\"cs-grid\" class=\"cs-grid\">
        {cards}
        </div>
      </div>
    </section>
    <section class=\"cs-cta\">
      <div class=\"container\">
        <h2 class=\"cs-cta__title\">Need something fixed or renovated?</h2>
        <p class=\"cs-cta__sub\">Send photos, describe the scope, and get a clear next step for your NYC home or business.</p>
        <button class=\"btn btn--accent btn--lg\" data-open-quote>Get a Free Quote</button>
      </div>
    </section>
  </main>
  <div id=\"site-footer\"></div>
  <script src=\"/components/loader.js\" defer></script>
  <script src=\"/main.js\" defer></script>
</body>
</html>
"""


def generate_public_data(studies: list[dict]) -> None:
    PUBLIC_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    public = []
    for s in studies:
        public.append({
            "slug": s["slug"],
            "title": s["title"],
            "excerpt": s["excerpt"],
            "thumbnail": s["thumbnail"],
            "location": s.get("locationShort") or s.get("borough"),
            "category": s.get("category"),
            "categories": s.get("categories", []),
            "tags": s.get("tags", []),
            "serviceSlugs": [re.sub(r"^/services/|/$", "", x.get("url", "")) for x in s.get("relatedServices", [])],
            "featured": s.get("featured", False),
        })
    PUBLIC_DATA_PATH.write_text(json.dumps({"studies": public}, ensure_ascii=False, indent=2) + "\n")


def update_sitemap(studies: list[dict]) -> None:
    path = ROOT / "sitemap.xml"
    text = path.read_text()
    block = "\n".join(
        f"""    <url>\n        <loc>{SITE}/case-studies/{xml_escape(s['slug'])}/</loc>\n        <lastmod>{xml_escape(s.get('dateModified') or s.get('datePublished') or '2026-06-03')}</lastmod>\n        <changefreq>monthly</changefreq>\n        <priority>0.75</priority>\n    </url>"""
        for s in studies
    )
    marker_start = "    <!-- CASE STUDY DETAIL PAGES (generated) -->"
    marker_end = "    <!-- /CASE STUDY DETAIL PAGES -->"
    generated = f"{marker_start}\n{block}\n{marker_end}"
    latest = max((s.get("dateModified") or s.get("datePublished") or "2026-06-03") for s in studies)
    text = re.sub(
        r"(<loc>https://asap\.repair/case-studies/</loc>\s*<lastmod>)([^<]+)(</lastmod>)",
        rf"\g<1>{latest}\g<3>",
        text,
        count=1,
    )
    if marker_start in text and marker_end in text:
        text = re.sub(re.escape(marker_start) + r".*?" + re.escape(marker_end), generated, text, flags=re.S)
    else:
        text = text.replace("</urlset>", f"\n{generated}\n\n</urlset>")
    path.write_text(text)


def main() -> None:
    studies = load_studies()
    CASE_DIR.mkdir(exist_ok=True)
    for study in studies:
        out_dir = CASE_DIR / study["slug"]
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "index.html").write_text(clean_text(render_detail(study)))
    (CASE_DIR / "index.html").write_text(clean_text(render_index(studies)))
    generate_public_data(studies)
    update_sitemap(studies)
    print(f"Generated {len(studies)} case study page(s).")


if __name__ == "__main__":
    main()
