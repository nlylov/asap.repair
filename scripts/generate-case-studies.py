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
ASSET_VERSION = "20260710b"
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


def place_schema(study: dict) -> dict | None:
    location = study.get("location") or study.get("locationShort") or study.get("borough")
    if not location:
        return None
    return {"@type": "Place", "name": location}


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
        for pair in study.get("content", {}).get("comparisonPairs", []):
            for field in ["before", "after"]:
                src = pair.get(field, "")
                validate_local_url(src, f"comparisonPairs.{field}", slug)
                if src.startswith("/") and not (ROOT / src.lstrip("/")).exists():
                    raise SystemExit(f"Missing comparison image {src} for {study['slug']}")
    return published


def render_head(study: dict) -> str:
    url = f"{SITE}/case-studies/{study['slug']}/"
    meta_description = study.get("metaDescription") or study["description"]
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
    }
    spatial_coverage = place_schema(study)
    if spatial_coverage:
        schema["spatialCoverage"] = spatial_coverage
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
  <meta name=\"description\" content=\"{e(meta_description)}\">
  <link rel=\"canonical\" href=\"{url}\">
  <meta property=\"og:title\" content=\"{e(study.get('seoTitle') or study['title'])}\">
  <meta property=\"og:description\" content=\"{e(meta_description)}\">
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
  <link rel=\"stylesheet\" href=\"/styles.css?v={ASSET_VERSION}\">
  <link rel="stylesheet" href="/case-studies/case-studies.css?v={ASSET_VERSION}">
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


def render_detail_gallery(study: dict, content: dict) -> str:
    images = [img for img in study.get("images", []) if img.get("stage") == "detail"]
    if not images:
        return ""
    title = content.get("detailTitle", "Details: finish work and field adjustments")
    subtitle = content.get(
        "detailSubtitle",
        "Detail photos show the finish decisions and field adjustments behind the completed project.",
    )
    if content.get("detailLayout") != "sillSequence":
        return section_gallery(study, "detail", title, subtitle)

    steps = []
    for index, img in enumerate(images, start=1):
        step_title = img.get("stepTitle") or f"Step {index}"
        steps.append(
            f"""<figure class="sill-step">
              <div class="sill-step__media"><span class="sill-step__num">{index}</span><img src="{e(img['src'])}" alt="{e(img.get('alt') or img.get('caption'))}" loading="lazy" width="{e(img.get('width', 1200))}" height="{e(img.get('height', 900))}"></div>
              <figcaption><strong>{e(step_title)}</strong><span>{e(img.get('caption'))}</span></figcaption>
            </figure>"""
        )
    kicker = content.get("detailSequenceKicker", "Step-by-step sequence")
    return f"""
  <section class=\"project-section project-section--gallery project-section--sill-sequence\">
    <div class=\"container\">
      <div class=\"section-header section-header--left\">
        <span class=\"project-eyebrow\">{e(content.get('detailEyebrow', 'Project detail'))}</span>
        <h2 class=\"section-title\">{e(title)}</h2>
        <p class=\"section-subtitle\">{e(subtitle)}</p>
      </div>
      <div class=\"sill-seq\">
        <div class=\"sill-seq__head\">
          <h3>{e(kicker)}</h3>
          <span>{len(images)} documented stages</span>
        </div>
        <div class=\"sill-grid\">
          {''.join(steps)}
        </div>
      </div>
    </div>
  </section>"""


def paragraph_html(paragraphs: list[str]) -> str:
    return "\n          ".join(f"<p>{e(paragraph)}</p>" for paragraph in paragraphs if paragraph)


def render_comparison_pairs(study: dict, content: dict) -> str:
    pairs = content.get("comparisonPairs") or []
    if not pairs:
        return ""
    cards = []
    for pair in pairs:
        title = pair.get("title", "Before and after")
        before_alt = pair.get("beforeAlt") or f"{title} before"
        after_alt = pair.get("afterAlt") or f"{title} after"
        card_classes = ["project-comparison-card"]
        if pair.get("display") == "slider":
            card_classes.append("project-comparison-card--slider")
            if pair.get("wide"):
                card_classes.append("project-comparison-card--wide")
            position = pair.get("initialPosition", 50)
            aspect_ratio = pair.get("aspectRatio", "4/3")
            media = f"""<figure class="ba" style="--ar:{e(aspect_ratio)}; --pos:{e(str(position))}%;" data-position="{e(str(position))}">
            <div class="ba__media" role="slider" tabindex="0" aria-label="Slide to compare {e(title)} before and after" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{e(str(position))}" aria-valuetext="{e(str(position))}% before">
              <img class="ba__after" src="{e(pair['after'])}" alt="{e(after_alt)}" loading="lazy">
              <div class="ba__before-wrap"><img src="{e(pair['before'])}" alt="{e(before_alt)}" loading="lazy"></div>
              <div class="ba__labels" aria-hidden="true">
                <span class="ba__tag ba__tag--before" translate="no">Before</span>
                <span class="ba__tag ba__tag--after" translate="no">After</span>
              </div>
              <div class="ba__divider"><span class="ba__grip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/></svg></span></div>
            </div>
          </figure>"""
        else:
            media = f"""<div class="project-comparison-card__media">
            <figure>
              <span>Before</span>
              <img src="{e(pair['before'])}" alt="{e(before_alt)}" loading="lazy">
            </figure>
            <figure>
              <span>After</span>
              <img src="{e(pair['after'])}" alt="{e(after_alt)}" loading="lazy">
            </figure>
          </div>"""
        cards.append(
            f"""<article class="{e(' '.join(card_classes))}">
          <h3>{e(title)}</h3>
          {media}
          <p>{e(pair.get('caption', ''))}</p>
        </article>"""
        )
    return f"""<section id="project-comparison" class="project-section project-section--comparison">
      <div class="container">
        <div class="section-header section-header--left">
          <span class="project-eyebrow">{e(content.get('comparisonEyebrow', 'Before and after'))}</span>
          <h2 class="section-title">{e(content.get('comparisonTitle', 'Proof from the same job'))}</h2>
          <p class="section-subtitle">{e(content.get('comparisonSubtitle', 'Side-by-side project photos show the starting condition and the finished result.'))}</p>
        </div>
        <div class="project-comparison-grid">
          {''.join(cards)}
        </div>
      </div>
    </section>"""


def render_before_after_slider_script(content: dict) -> str:
    pairs = content.get("comparisonPairs") or []
    if not any(pair.get("display") == "slider" for pair in pairs):
        return ""
    return """  <script>
    (function () {
      document.querySelectorAll('.ba').forEach(function (ba) {
        var media = ba.querySelector('.ba__media');
        var wrap = ba.querySelector('.ba__before-wrap');
        var div = ba.querySelector('.ba__divider');
        if (!media || !wrap || !div) return;

        function set(v) {
          v = Math.max(0, Math.min(100, v));
          ba.style.setProperty('--pos', v + '%');
          wrap.style.width = v + '%';
          div.style.left = v + '%';
          media.setAttribute('aria-valuenow', Math.round(v));
          media.setAttribute('aria-valuetext', Math.round(v) + '% before');
        }

        function setFromX(clientX) {
          var r = media.getBoundingClientRect();
          if (r.width) set(((clientX - r.left) / r.width) * 100);
        }

        media.addEventListener('keydown', function (event) {
          var current = parseFloat(media.getAttribute('aria-valuenow') || '50');
          var step = event.shiftKey ? 10 : 5;
          var next = null;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = current - step;
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = current + step;
          if (event.key === 'PageDown') next = current - 10;
          if (event.key === 'PageUp') next = current + 10;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = 100;
          if (next === null) return;
          event.preventDefault();
          set(next);
        });

        set(parseFloat(ba.getAttribute('data-position') || media.getAttribute('aria-valuenow') || '50'));

        var dragging = false;
        var pending = false;
        var startX = 0;
        var startY = 0;
        var SLOP = 6;

        media.addEventListener('pointerdown', function (event) {
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          startX = event.clientX;
          startY = event.clientY;
          if (event.pointerType === 'mouse') {
            dragging = true;
            try { media.setPointerCapture(event.pointerId); } catch (_) {}
            setFromX(event.clientX);
            event.preventDefault();
          } else {
            pending = true;
          }
        });

        media.addEventListener('pointermove', function (event) {
          if (pending) {
            var dx = event.clientX - startX;
            var dy = event.clientY - startY;
            if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
            if (Math.abs(dy) > Math.abs(dx)) {
              pending = false;
              return;
            }
            pending = false;
            dragging = true;
            try { media.setPointerCapture(event.pointerId); } catch (_) {}
          }
          if (!dragging) return;
          event.preventDefault();
          setFromX(event.clientX);
        });

        function end(event) {
          pending = false;
          dragging = false;
          try { media.releasePointerCapture(event.pointerId); } catch (_) {}
        }

        media.addEventListener('pointerup', end);
        media.addEventListener('pointercancel', end);

        if (!('PointerEvent' in window)) {
          media.addEventListener('touchstart', function (event) {
            var touch = event.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            pending = true;
          }, { passive: false });

          media.addEventListener('touchmove', function (event) {
            var touch = event.touches[0];
            if (pending) {
              var dx = touch.clientX - startX;
              var dy = touch.clientY - startY;
              if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
              if (Math.abs(dy) > Math.abs(dx)) {
                pending = false;
                return;
              }
              pending = false;
              dragging = true;
            }
            if (!dragging) return;
            event.preventDefault();
            setFromX(touch.clientX);
          }, { passive: false });

          media.addEventListener('touchend', function () {
            pending = false;
            dragging = false;
          });
        }

        set(parseFloat(range.value) || 50);
      });
    })();
  </script>"""


def render_optional_focus_section(study: dict, content: dict) -> str:
    if content.get("hideFocusSection"):
        return ""
    title = content.get("focusTitle")
    paragraphs = content.get("focusParagraphs") or []
    if not title or not paragraphs:
        return ""
    eyebrow = content.get("focusEyebrow", "Project detail")
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


def related_project_section(study: dict, studies: list[dict]) -> str:
    if len(studies) < 2:
        return ""
    slugs = [s["slug"] for s in studies]
    index = slugs.index(study["slug"])
    limit = min(3, len(studies) - 1)
    related = [studies[(index + offset) % len(studies)] for offset in range(1, limit + 1)]
    links = "".join(
        f'<a class="project-service-link" href="/case-studies/{e(s["slug"])}/">{e(s["shortTitle"])}<span>→</span></a>'
        for s in related
    )
    return f"""<section class=\"project-section project-section--services\">
      <div class=\"container\">
        <div class=\"section-header\">
          <span class=\"project-eyebrow\">More completed projects</span>
          <h2 class=\"section-title\">See related Repair ASAP work</h2>
        </div>
        <div class=\"project-service-grid\">{links}</div>
      </div>
    </section>"""


def render_detail(study: dict, studies: list[dict]) -> str:
    hero_img = study["heroImage"]
    content = study.get("content", {})
    scope_items = "".join(f"<li>{e(item)}</li>" for item in study.get("scope", []))
    service_links = "".join(
        f'<a class="project-service-link" href="{e(s["url"])}">{e(s["title"])}<span>→</span></a>'
        for s in study.get("relatedServices", [])
    )
    tags = "".join(f"<span>{e(tag)}</span>" for tag in study.get("tags", [])[:6])
    starting_paragraphs = content.get("startingParagraphs") or [
        study["challenge"],
        "Repair Asap reviewed the site conditions, access needs, materials, and finish requirements before sequencing the work.",
    ]
    process_paragraphs = content.get("processParagraphs") or [
        study["solution"],
        "The work was sequenced around the existing conditions, material requirements, and final cleanup needed for a ready-to-use result.",
        "Progress photos document the main steps from preparation through completion.",
    ]
    process_split = max(1, len(process_paragraphs) // 2)
    faq_section = render_faq(study)
    faq_block = f"\n\n    {faq_section}" if faq_section else ""
    related_projects = related_project_section(study, studies)
    related_projects_block = f"\n\n    {related_projects}" if related_projects else ""
    slider_script = render_before_after_slider_script(content)
    slider_script_block = f"\n{slider_script}" if slider_script else ""
    return f"""<!DOCTYPE html>
<html lang=\"en\">
<head>
  <script defer src=\"/analytics.js?v={ASSET_VERSION}\"></script>
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
            <button class=\"btn btn--accent btn--lg\" data-open-quote>{e(content.get('heroCtaText', 'Request a Project Quote'))}</button>
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
          <h2>{e(content.get('startingTitle', 'Starting condition and project scope'))}</h2>
          {paragraph_html(starting_paragraphs)}
        </div>
        <div class=\"project-scope-card\">
          <h3>Scope of work</h3>
          <ul>{scope_items}</ul>
        </div>
      </div>
    </section>

    {render_comparison_pairs(study, content)}

    {section_gallery(study, 'before', content.get('beforeTitle', 'Before: starting condition'), content.get('beforeSubtitle', 'Before photos show the site conditions and details that needed attention before the work could be completed.'))}

    <section class=\"project-section project-section--dark\">
      <div class=\"container project-two-col\">
        <div>
          <span class=\"project-eyebrow\">{e(content.get('processEyebrow', 'Work process'))}</span>
          <h2>{e(content.get('processTitle', 'Planning, preparation, installation, and finishing'))}</h2>
          {paragraph_html(process_paragraphs[:process_split])}
        </div>
        <div>
          {paragraph_html(process_paragraphs[process_split:])}
        </div>
      </div>
    </section>

    {section_gallery(study, 'process', content.get('processGalleryTitle', 'Process: selected progress photos'), content.get('processGallerySubtitle', 'Selected progress photos show how the work moved from preparation to finished condition.'))}

    {render_optional_focus_section(study, content)}

    {render_detail_gallery(study, content)}
    {section_gallery(study, 'after', content.get('afterTitle', 'After: completed project'), content.get('afterSubtitle', 'Final photos show the completed work after installation, finishing, and cleanup.'))}

    {related_projects_block}

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
        <h2>{e(content.get('ctaTitle', 'Planning a repair, installation, or renovation project?'))}</h2>
        <p>{e(content.get('ctaText', 'Send photos, describe the scope, and Repair ASAP will help plan the next step.'))}</p>
        <button class=\"btn btn--accent btn--lg\" data-open-quote>Get a Free Quote</button>
      </div>
    </section>
  </main>
  <div id=\"site-footer\"></div>
  <script src=\"/components/loader.js?v={ASSET_VERSION}\" defer></script>
  <script src=\"/main.js?v={ASSET_VERSION}\" defer></script>{slider_script_block}
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
  <script defer src=\"/analytics.js?v={ASSET_VERSION}\"></script>
  <meta charset=\"UTF-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
  <title>NYC Handyman Case Studies | Repair Asap</title>
  <meta name=\"description\" content=\"Before and after photos from completed Repair ASAP projects across NYC: renovations, drywall, tile, painting, flooring, mounting, and repairs.\">
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
  <link rel=\"stylesheet\" href=\"/styles.css?v={ASSET_VERSION}\">
  <link rel="stylesheet" href="/case-studies/case-studies.css?v={ASSET_VERSION}">
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
  <script src=\"/components/loader.js?v={ASSET_VERSION}\" defer></script>
  <script src=\"/main.js?v={ASSET_VERSION}\" defer></script>
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
        (out_dir / "index.html").write_text(clean_text(render_detail(study, studies)))
    (CASE_DIR / "index.html").write_text(clean_text(render_index(studies)))
    generate_public_data(studies)
    update_sitemap(studies)
    print(f"Generated {len(studies)} case study page(s).")


if __name__ == "__main__":
    main()
